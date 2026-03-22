import express from 'express'
import { create, notify } from '../controllers/deposit.controller'

const router = express.Router()

// POST /api/deposit/create - 创建支付订单
router.post('/create', create)

// POST /api/deposit/notify - 支付宝异步回调
router.post('/notify', notify)

export default router
