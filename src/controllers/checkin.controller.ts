import { Request, Response } from 'express'
import * as checkinService from '../services/checkin.service'
import * as guestService from '../services/guest.service'
import { asyncHandler, Errors } from '../middleware/error'

// 创建入住记录 + 主住客信息
export const createCheckIn = asyncHandler(async (req: Request, res: Response) => {
  const { orderId, roomId, roomName, phone, checkInDate, checkOutDate, guest } = req.body

  if (!orderId || !roomId || !roomName || !phone || !checkInDate || !checkOutDate) {
    throw Errors.badRequest('缺少必要参数')
  }

  if (!guest || !guest.name || !guest.idNumber) {
    throw Errors.badRequest('缺少住客信息')
  }

  // 1. 创建住客
  const guestId = await guestService.createGuest(guest)

  // 2. 创建入住记录（直接带上 guestId）
  const record = await checkinService.createCheckIn({
    orderId,
    roomId,
    roomName,
    phone,
    checkInDate,
    checkOutDate,
    guestIds: [guestId],
  })

  res.json({ success: true, data: record })
})

// 查询入住记录
export const getCheckIn = asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = req.params

  const record = await checkinService.getCheckInByOrderId(orderId)

  if (!record) {
    throw Errors.notFound('未找到入住记录')
  }

  res.json({ success: true, data: record })
})

// 更新入住记录
export const updateCheckIn = asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = req.params
  const { depositPaid, depositAmount, status } = req.body

  await checkinService.updateCheckIn(orderId, {
    depositPaid,
    depositAmount,
    status,
  })

  res.json({ success: true })
})
