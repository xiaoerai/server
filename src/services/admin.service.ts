import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { JwtPayload } from './auth.service'
import { Errors } from '../middleware/error'

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_change_me'
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || ''

export function adminLogin(username: string, password: string): string {
  if (!ADMIN_PASSWORD) {
    throw Errors.internal('管理员密码未配置')
  }

  const usernameMatch = safeEqual(username, ADMIN_USERNAME)
  const passwordMatch = safeEqual(password, ADMIN_PASSWORD)

  if (!usernameMatch || !passwordMatch) {
    throw Errors.unauthorized('账号或密码错误')
  }

  const payload: JwtPayload = { phone: 'admin', role: 'admin' }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' } as jwt.SignOptions)
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return crypto.timingSafeEqual(bufA, bufB)
}
