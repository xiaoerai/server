import express from 'express'
import { getOrders } from '../controllers/orders.controller'

const router = express.Router()

// GET /api/orders?phone=xxx
router.get('/', getOrders)

export default router
