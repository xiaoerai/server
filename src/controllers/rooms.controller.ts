import { Request, Response } from 'express'
import { asyncHandler } from '../middleware/error'
import { fetchRoomList } from '../services/hostex.service'
import { upsertRoomByPms, findAllRooms } from '../db'

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

// GET /api/rooms - 获取所有房间
export const getRooms = asyncHandler(async (_req: Request, res: Response) => {
  const rooms = await findAllRooms()
  res.json({ success: true, data: rooms })
})
