import express from 'express'
import { createCheckIn, getCheckIn, updateCheckIn } from '../controllers/checkin.controller'

const router = express.Router()

// POST /api/checkin - 创建入住记录
router.post('/', createCheckIn)

// GET /api/checkin/:orderId - 查询入住记录
router.get('/:orderId', getCheckIn)

// PUT /api/checkin/:orderId - 更新入住记录
router.put('/:orderId', updateCheckIn)

export default router
