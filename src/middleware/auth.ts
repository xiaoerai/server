import { Request, Response, NextFunction } from 'express'
import { verifyToken, JwtPayload } from '../services/auth.service'
import { Errors } from './error'

// 管理员手机号（环境变量配置，逗号分隔支持多个）
const ADMIN_PHONES = (process.env.ADMIN_PHONES || '').split(',').filter(Boolean)

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

// 管理员权限中间件（必须在 auth 之后使用）
export function adminOnly(req: Request, _res: Response, next: NextFunction) {
  const isAdminByPhone = req.user && ADMIN_PHONES.includes(req.user.phone)
  const isAdminByRole = req.user?.role === 'admin'
  if (!isAdminByPhone && !isAdminByRole) {
    return next(Errors.forbidden('无管理员权限'))
  }
  next()
}
