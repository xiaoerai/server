import express from 'express'
import { syncRooms, getRooms, updateStatus } from '../controllers/rooms.controller'
import { auth, adminOnly } from '../middleware/auth'

const router = express.Router()

// POST /api/rooms/sync - 从 Hostex 同步房间
router.post('/sync', syncRooms)

// GET /api/rooms - 获取所有房间
router.get('/', getRooms)

// PUT /api/rooms/:roomNumber/status - 修改房间状态（需要管理员权限）
router.put('/:roomNumber/status', auth, adminOnly, updateStatus)

export default router
