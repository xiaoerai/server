import jwt from 'jsonwebtoken'
import {
  verifySmsCode,
  deleteSmsCode,
  findUserByPhone,
  createUser,
  updateUserLogin,
} from '../db'
import { getAlipayUserId } from './alipay.service'
import { code2Session } from './wechat.service'

// JWT 配置
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_change_me'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export type Platform = 'alipay' | 'wechat' | 'h5'

export interface JwtPayload {
  phone: string
  openid?: string
  alipayUserId?: string
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

// 测试手机号
const MOCK_PHONE = '15290500792'

// 根据平台获取用户标识
async function getPlatformId(
  platform: Platform,
  authCode: string
): Promise<{ openid?: string; alipayUserId?: string }> {
  switch (platform) {
    case 'alipay': {
      const alipayUserId = await getAlipayUserId(authCode)
      return { alipayUserId }
    }
    case 'wechat': {
      const openid = await code2Session(authCode)
      return { openid }
    }
    case 'h5':
    default:
      return {}
  }
}

// 短信验证码登录
export async function loginWithSmsCode(
  authCode: string,
  phone: string,
  smsCode: string,
  platform: Platform = 'h5'
): Promise<LoginResult> {
  // 测试手机号：跳过验证码，但正常走平台授权（拿真实 alipayUserId）
  if (phone !== MOCK_PHONE) {
    const isValid = await verifySmsCode(phone, smsCode)
    if (!isValid) {
      throw new Error('验证码错误或已过期')
    }
  } else {
    console.log(`[Auth] 测试手机号登录，跳过验证码 (phone: ${phone})`)
  }

  // 根据平台获取用户标识（只存 JWT，不存数据库）
  const platformId = await getPlatformId(platform, authCode)

  // 3. 查找或创建用户（用户表只存 phone）
  const user = await findUserByPhone(phone)
  if (!user) {
    await createUser(phone)
  } else {
    await updateUserLogin(phone)
  }

  // 4. 生成 JWT（包含平台用户ID，支付时使用）
  const token = signToken({ phone, ...platformId })

  // 5. 登录成功，删除验证码
  await deleteSmsCode(phone)

  return {
    token,
    user: { phone },
  }
}
