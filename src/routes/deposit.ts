import express from 'express'
import { create, confirm } from '../controllers/deposit.controller'

const router = express.Router()

// POST /api/deposit/create - 创建支付订单
router.post('/create', create)

// POST /api/deposit/confirm - 确认支付
router.post('/confirm', confirm)

export default router
