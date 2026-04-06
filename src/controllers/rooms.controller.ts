import { Request, Response } from 'express'
import { asyncHandler, Errors } from '../middleware/error'
import { fetchRoomList } from '../services/hostex.service'
import {
  upsertRoomByPms,
  findAllRooms,
  findRoomByNumber,
  updateRoomStatus,
  findCheckedInRecordsByRoomNumbers,
} from '../db'

// POST /api/rooms/sync - 从 Hostex 同步房间列表
export const syncRooms = asyncHandler(async (_req: Request, res: Response) => {
  const credentials = {
    session: process.env.HOSTEX_SESSION!,
    operatorId: process.env.HOSTEX_OPERATOR_ID!,
  }

  const rooms = await fetchRoomList(credentials)

  for (const room of rooms) {
    await upsertRoomByPms('hostex', String(room.hostexHouseId), {
      roomNumber: room.roomNumber,
      roomName: room.roomName,
    })
  }

  console.log(`[Rooms] 同步完成，共 ${rooms.length} 个房间`)

  res.json({ success: true, data: { synced: rooms.length } })
})

// GET /api/rooms - 获取所有房间（occupied 房间附带当前住客信息）
export const getRooms = asyncHandler(async (_req: Request, res: Response) => {
  const rooms = await findAllRooms()

  // 找出所有 occupied 房间的房间号
  const occupiedRoomNumbers = rooms.filter((r) => r.status === 'occupied').map((r) => r.roomNumber)

  // 批量查询入住记录
  const checkedInRecords = await findCheckedInRecordsByRoomNumbers(occupiedRoomNumbers)
  const recordMap = new Map(checkedInRecords.map((r) => [r.roomNumber, r]))

  // 组装返回数据
  const data = rooms.map((room) => {
    const record = recordMap.get(room.roomNumber)
    return {
      ...room,
      currentGuest: record
        ? {
            phone: record.phone,
            checkInDate: record.checkInDate,
            checkOutDate: record.checkOutDate,
          }
        : null,
    }
  })

  res.json({ success: true, data })
})

// PUT /api/rooms/:roomNumber/status - 修改房间状态
const VALID_STATUSES = ['available', 'occupied', 'dirty'] as const
type RoomStatus = (typeof VALID_STATUSES)[number]

export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const { roomNumber } = req.params
  const { status } = req.body as { status: RoomStatus }

  if (!status || !VALID_STATUSES.includes(status)) {
    throw Errors.badRequest('无效的房间状态')
  }

  const room = await findRoomByNumber(roomNumber)
  if (!room) {
    throw Errors.notFound('房间不存在')
  }

  await updateRoomStatus(roomNumber, status)
  res.json({ success: true, data: { roomNumber, status } })
})
