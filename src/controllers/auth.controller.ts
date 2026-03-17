import { Request, Response } from 'express'
import { loginWithSmsCode } from '../services/auth.service'
import { LoginInput } from '../schemas/auth'
import { asyncHandler } from '../middleware/error'

// POST /api/auth/login - 登录
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { code, phone, smsCode } = req.validated as LoginInput

  const data = await loginWithSmsCode(code, phone, smsCode)

  res.json({
    success: true,
    data,
  })
})
