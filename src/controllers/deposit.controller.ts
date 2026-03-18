import { Request, Response } from 'express'
import { asyncHandler, Errors } from '../middleware/error'
import { createPayment, confirmPayment, PayChannel } from '../services/deposit.service'

// POST /api/deposit/create - 创建支付订单
export const create = asyncHandler(async (req: Request, res: Response) => {
  const { orderId, channel } = req.body

  if (!orderId) {
    throw Errors.badRequest('缺少 orderId')
  }

  const validChannels: PayChannel[] = ['alipay', 'wechat']
  if (channel && !validChannels.includes(channel)) {
    throw Errors.badRequest('无效的支付渠道')
  }

  const result = await createPayment(orderId, channel || 'alipay')

  res.json({ success: true, data: result })
})

// POST /api/deposit/confirm - 确认支付（mock 用，真实环境由回调触发）
export const confirm = asyncHandler(async (req: Request, res: Response) => {
  const { orderId, transactionId } = req.body

  if (!orderId || !transactionId) {
    throw Errors.badRequest('缺少 orderId 或 transactionId')
  }

  const record = await confirmPayment(orderId, transactionId)

  res.json({ success: true, data: record })
})
