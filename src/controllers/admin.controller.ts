import { Request, Response } from 'express'
import { asyncHandler, Errors } from '../middleware/error'
import { adminLogin } from '../services/admin.service'
import { findAllDeposits, countDeposits } from '../db/deposits'
import {
  findAllCheckInRecords,
  countCheckInRecords,
  findRecordByOrderId,
} from '../db/check_in_records'
import { findGuestsByIds } from '../db/guests'

// POST /api/admin/login
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { username, password } = req.body

  if (!username || !password) {
    throw Errors.badRequest('缺少账号或密码')
  }

  const token = adminLogin(username, password)
  res.json({ success: true, data: { token } })
})

// GET /api/admin/deposits
export const getDeposits = asyncHandler(async (req: Request, res: Response) => {
  const status = req.query.status as string | undefined
  const page = parseInt(req.query.page as string) || 1
  const pageSize = parseInt(req.query.pageSize as string) || 20

  const [list, total] = await Promise.all([
    findAllDeposits({ status, page, pageSize }),
    countDeposits({ status }),
  ])

  // 关联入住记录，拿房间和手机号信息
  const enriched = await Promise.all(
    list.map(async (deposit) => {
      const record = await findRecordByOrderId(deposit.orderId)
      return {
        ...deposit,
        roomNumber: record?.roomNumber || '-',
        roomName: record?.roomName || '-',
        phone: record?.phone || '-',
      }
    })
  )

  res.json({ success: true, data: { list: enriched, total, page, pageSize } })
})

// GET /api/admin/checkins
export const getCheckins = asyncHandler(async (req: Request, res: Response) => {
  const status = req.query.status as string | undefined
  const startDate = req.query.startDate as string | undefined
  const endDate = req.query.endDate as string | undefined
  const page = parseInt(req.query.page as string) || 1
  const pageSize = parseInt(req.query.pageSize as string) || 20

  const [list, total] = await Promise.all([
    findAllCheckInRecords({ status, startDate, endDate, page, pageSize }),
    countCheckInRecords({ status, startDate, endDate }),
  ])

  // 批量查询 guests
  const allGuestIds = [...new Set(list.flatMap((r) => r.guestIds || []))]
  const allGuests = await findGuestsByIds(allGuestIds)
  const guestMap = new Map(allGuests.map((g) => [g._id, g]))

  const enriched = list.map((record) => ({
    ...record,
    guests: (record.guestIds || [])
      .map((id) => guestMap.get(id))
      .filter(Boolean)
      .map((g) => ({
        _id: g!._id,
        name: g!.name,
        idNumber: g!.idNumber,
        idImageUrl: g!.idImageUrl || null,
      })),
  }))

  res.json({ success: true, data: { list: enriched, total, page, pageSize } })
})
