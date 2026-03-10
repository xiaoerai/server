import { verifySmsCode, findUserByOpenid, createUser, updateUserLogin } from './db'
import { code2Session } from './wechat'
import { signToken } from '../utils/jwt'

export interface LoginResult {
  token: string
  user: { phone: string }
}

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

  return {
    token,
    user: { phone },
  }
}
