import { Request, Response } from 'express'
import { getGuestsByPhone, unlinkGuestByIdNumber } from '../services/user.service'
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

// DELETE /api/user/guests - 通过身份证号解除用户与住客的关联
export const removeMyGuest = asyncHandler(async (req: Request, res: Response) => {
  const phone = req.query.phone as string
  const idNumber = req.query.idNumber as string

  if (!phone) {
    throw Errors.badRequest('缺少 phone 参数')
  }
  if (!idNumber) {
    throw Errors.badRequest('缺少 idNumber 参数')
  }

  await unlinkGuestByIdNumber(phone, idNumber)

  res.json({ success: true })
})
