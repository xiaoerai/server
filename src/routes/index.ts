import express from 'express'
import smsRouter from './sms'
import authRouter from './auth'
import ordersRouter from './orders'
import checkinRouter from './checkin'

const router = express.Router()

// 认证相关
router.use('/sms', smsRouter)
router.use('/auth', authRouter)

// 订单
router.use('/orders', ordersRouter)

// 入住
router.use('/checkin', checkinRouter)

// TODO: 添加其他路由
// router.use('/deposit', depositRouter)
// router.use('/checkout', checkoutRouter)

export default router
