import { Request, Response } from 'express'
import { asyncHandler, Errors } from '../middleware/error'
import {
  ALIPAY_SUBJECT,
  DEPOSIT_AMOUNT,
  createPayment,
  generateTradeNO,
  PayChannel,
  getRecordForPayment,
  handleAlipayNotify,
  getDepositStatus,
  refundDeposit,
} from '../services/deposit.service'
import { createTrade, verifyAlipayNotify } from '../services/alipay.service'

// POST /api/deposit/create - 创建支付订单
export const create = asyncHandler(async (req: Request, res: Response) => {
  const { orderId, channel } = req.body

  if (!orderId) {
    throw Errors.badRequest('缺少 orderId')
  }

  const validChannels: PayChannel[] = ['alipay']
  if (channel && !validChannels.includes(channel)) {
    throw Errors.badRequest('当前仅支持支付宝支付')
  }

  const paymentChannel: PayChannel = (channel as PayChannel) || 'alipay'

  const record = await getRecordForPayment(orderId)
  const tradeNO = generateTradeNO(orderId)
  const buyerId = req.user?.alipayUserId
  if (!buyerId) {
    throw Errors.badRequest('未获取到支付宝用户ID，请重新登录')
  }

  const alipayTradeNo = await createTrade({
    outTradeNo: tradeNO,
    subject: ALIPAY_SUBJECT,
    totalAmountCents: DEPOSIT_AMOUNT,
    buyerId,
    body: `${record.roomName} 押金`,
  })

  const result = await createPayment(orderId, paymentChannel, tradeNO, {
    record,
    payerUserId: buyerId,
  })

  res.json({ success: true, data: { ...result, tradeNO: alipayTradeNo } })
})

// POST /api/deposit/notify - 支付宝异步回调
export const notify = asyncHandler(async (req: Request, res: Response) => {
  const params = req.body
  console.log('[Notify] 收到支付宝回调:', JSON.stringify(params))

  const isValid = verifyAlipayNotify(params)
  console.log('[Notify] 签名验证:', isValid)
  if (!isValid) {
    res.status(400).send('fail')
    return
  }

  console.log('[Notify] trade_status:', params.trade_status, 'out_trade_no:', params.out_trade_no)
  if (params.trade_status === 'TRADE_SUCCESS' || params.trade_status === 'TRADE_FINISHED') {
    await handleAlipayNotify(params.out_trade_no, params.trade_no)
    console.log('[Notify] 押金状态已更新')
  }

  res.send('success')
})

// GET /api/deposit/:orderId/status - 查询押金状态
export const status = asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = req.params

  const result = await getDepositStatus(orderId)
  if (!result) {
    throw Errors.notFound('未找到押金记录')
  }

  res.json({ success: true, data: result })
})

// POST /api/deposit/refund - 退款
export const refund = asyncHandler(async (req: Request, res: Response) => {
  const { orderId, amount } = req.body

  if (!orderId) {
    throw Errors.badRequest('缺少 orderId')
  }

  if (!amount || amount <= 0) {
    throw Errors.badRequest('退款金额无效')
  }

  await refundDeposit(orderId, amount)

  res.json({ success: true })
})
