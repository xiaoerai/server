import express from 'express'
import { createCheckIn, getCheckIn, updateCheckIn, checkOut } from '../controllers/checkin.controller'

const router = express.Router()

// POST /api/checkin - 创建入住记录
router.post('/', createCheckIn)

// POST /api/checkout - 退房
router.post('/checkout', checkOut)

// GET /api/checkin/:orderId - 查询入住记录
router.get('/:orderId', getCheckIn)

// PUT /api/checkin/:orderId - 更新入住记录
router.put('/:orderId', updateCheckIn)

export default router
