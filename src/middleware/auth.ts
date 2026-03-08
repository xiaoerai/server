import { Request, Response, NextFunction } from 'express'

// TODO: 实现 IDaaS Token 验证
export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // TODO: 验证 token
  next()
}
