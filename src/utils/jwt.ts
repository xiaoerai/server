import jwt from 'jsonwebtoken'

export interface JwtPayload {
  openid: string
  phone: string
}

const SECRET = process.env.JWT_SECRET || 'default_secret_change_me'
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN } as jwt.SignOptions)
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, SECRET) as JwtPayload
    return decoded
  } catch {
    return null
  }
}
