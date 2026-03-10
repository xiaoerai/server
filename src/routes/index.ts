import express from 'express'
import smsRouter from './sms'
import authRouter from './auth'

const router = express.Router()

// 认证相关
router.use('/sms', smsRouter)
router.use('/auth', authRouter)

// TODO: 添加其他路由
// router.use('/orders', ordersRouter)
// router.use('/checkin', checkinRouter)
// router.use('/deposit', depositRouter)
// router.use('/checkout', checkoutRouter)

export default router
