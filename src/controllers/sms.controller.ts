import { Request, Response, NextFunction } from 'express'
import { sendVerificationCode } from '../services/sms.service'
import { SendSmsInput } from '../schemas/sms'

// POST /api/sms/send - 发送验证码
export async function sendSms(req: Request, res: Response, next: NextFunction) {
  try {
    const { phone } = req.validated as SendSmsInput

    await sendVerificationCode(phone)

    res.json({
      success: true,
      message: '验证码已发送',
    })
  } catch (err) {
    next(err)
  }
}
