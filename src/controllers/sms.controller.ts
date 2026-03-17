import { Request, Response } from 'express'
import { sendVerificationCode } from '../services/sms.service'
import { SendSmsInput } from '../schemas/sms'
import { asyncHandler } from '../middleware/error'

// POST /api/sms/send - 发送验证码
export const sendSms = asyncHandler(async (req: Request, res: Response) => {
  const { phone } = req.validated as SendSmsInput

  await sendVerificationCode(phone)

  res.json({
    success: true,
    message: '验证码已发送',
  })
})
