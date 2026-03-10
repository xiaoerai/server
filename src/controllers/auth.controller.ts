import { Request, Response, NextFunction } from 'express'
import { loginWithSmsCode } from '../services/auth.service'
import { LoginInput } from '../schemas/auth'

// POST /api/auth/login - 登录
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { code, phone, smsCode } = req.validated as LoginInput

    const data = await loginWithSmsCode(code, phone, smsCode)

    res.json({
      success: true,
      data,
    })
  } catch (err) {
    next(err)
  }
}
