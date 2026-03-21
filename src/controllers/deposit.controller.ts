import { Request, Response } from 'express'
import { asyncHandler, Errors } from '../middleware/error'
import {
  ALIPAY_SUBJECT,
  DEPOSIT_AMOUNT,
  createPayment,
  generateTradeNO,
  PayChannel,
  getRecordForPayment,
} from '../services/deposit.service'
import { createAppPayOrder } from '../services/alipay.service'

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
  const orderStr = await createAppPayOrder({
    outTradeNo: tradeNO,
    subject: ALIPAY_SUBJECT,
    totalAmountCents: DEPOSIT_AMOUNT,
    body: `${record.roomName} 押金`,
  })

  const result = await createPayment(orderId, paymentChannel, tradeNO, { record, orderStr })

  res.json({ success: true, data: result })
})
