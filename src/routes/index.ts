import express from 'express'
import smsRouter from './sms'
import authRouter from './auth'
import ordersRouter from './orders'
import checkinRouter from './checkin'
import depositRouter from './deposit'
import userRouter from './user'
import roomsRouter from './rooms'

const router = express.Router()

// 认证相关
router.use('/sms', smsRouter)
router.use('/auth', authRouter)

// 订单
router.use('/orders', ordersRouter)

// 入住
router.use('/checkin', checkinRouter)

// 押金支付
router.use('/deposit', depositRouter)

// 用户
router.use('/user', userRouter)

// 房间
router.use('/rooms', roomsRouter)

export default router
