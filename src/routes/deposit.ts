import express from 'express'
import { create } from '../controllers/deposit.controller'

const router = express.Router()

// POST /api/deposit/create - 创建支付订单
router.post('/create', create)

export default router
