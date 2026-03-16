import jwt from 'jsonwebtoken'
import { verifySmsCode, deleteSmsCode, findUserByOpenid, createUser, updateUserLogin } from '../db'
import { code2Session } from './wechat.service'

// JWT 配置
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_change_me'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

interface JwtPayload {
  openid: string
  phone: string
}

function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions)
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload
  } catch {
    return null
  }
}

// 登录结果
export interface LoginResult {
  token: string
  user: { phone: string }
}

// 短信验证码登录
export async function loginWithSmsCode(
  wxCode: string,
  phone: string,
  smsCode: string
): Promise<LoginResult> {
  // 1. 验证短信验证码
  const isValid = await verifySmsCode(phone, smsCode)
  if (!isValid) {
    throw new Error('验证码错误或已过期')
  }

  // 2. 用 code 换取 openid
  const openid = await code2Session(wxCode)

  // 3. 查找或创建用户
  const user = await findUserByOpenid(openid)
  if (!user) {
    await createUser(openid, phone)
  } else {
    await updateUserLogin(openid)
  }

  // 4. 生成 JWT
  const token = signToken({ openid, phone })

  // 5. 登录成功，删除验证码
  await deleteSmsCode(phone)

  return {
    token,
    user: { phone },
  }
}
