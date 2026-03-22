import express from 'express'
import { create, notify, status } from '../controllers/deposit.controller'

const router = express.Router()

// POST /api/deposit/create - 创建支付订单
router.post('/create', create)

// POST /api/deposit/notify - 支付宝异步回调
router.post('/notify', notify)

// GET /api/deposit/:orderId/status - 查询押金状态
router.get('/:orderId/status', status)

export default router
