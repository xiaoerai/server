import { Request, Response, NextFunction } from 'express'
import { verifyToken, JwtPayload } from '../utils/jwt'
import { Errors } from './error'

// 扩展 Request 类型
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

// JWT 验证中间件
export function auth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(Errors.unauthorized('请先登录'))
  }

  const token = authHeader.slice(7)
  const payload = verifyToken(token)

  if (!payload) {
    return next(Errors.unauthorized('登录已过期，请重新登录'))
  }

  req.user = payload
  next()
}
