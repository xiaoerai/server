import express from 'express'
import { syncRooms, getRooms } from '../controllers/rooms.controller'

const router = express.Router()

// POST /api/rooms/sync - 从 Hostex 同步房间
router.post('/sync', syncRooms)

// GET /api/rooms - 获取所有房间
router.get('/', getRooms)

export default router
