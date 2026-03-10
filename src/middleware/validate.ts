import { Request, Response, NextFunction } from 'express'
import { ZodSchema } from 'zod'
import { Errors } from './error'

// 扩展 Request 类型，添加 validated 属性
declare global {
  namespace Express {
    interface Request {
      validated: unknown
    }
  }
}

// 通用 Zod 验证中间件
export function validate<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      return next(Errors.badRequest(result.error.errors[0].message))
    }
    req.validated = result.data
    next()
  }
}
