import { Request, Response } from 'express'
import { getGuestsByPhone } from '../services/user.service'
import { asyncHandler, Errors } from '../middleware/error'

// GET /api/user/guests - 获取用户关联的历史住客
export const getMyGuests = asyncHandler(async (req: Request, res: Response) => {
  const phone = req.query.phone as string

  if (!phone) {
    throw Errors.badRequest('缺少 phone 参数')
  }

  const guests = await getGuestsByPhone(phone)

  res.json({ success: true, data: guests })
})
