/**
 * 押金支付服务
 */

import {
  findRecordByOrderId,
  updateCheckInRecord,
  findDepositByOrderId,
  createDeposit,
  updateDeposit,
} from '../db'
import type { CheckInRecord, Deposit } from '../db'
import { Errors } from '../middleware/error'

export type PayChannel = 'alipay' | 'wechat'

export interface CreatePaymentResult {
  tradeNO: string
  orderId: string
  amount: number // 分
  channel: PayChannel
  orderStr?: string
}

// TODO: 后续从 rooms 表读取
export const DEPOSIT_AMOUNT = 1 // 0.01 元（测试用，正式改回 50000）
export const ALIPAY_SUBJECT = 'AI小二押金'

export function generateTradeNO(orderId: string, prefix = 'AI'): string {
  return `${prefix}${orderId}_${Date.now()}`
}

export async function getRecordForPayment(orderId: string) {
  const record = await findRecordByOrderId(orderId)
  if (!record) {
    throw Errors.notFound('未找到入住记录')
  }

  // 检查是否已有押金记录且已支付
  const existingDeposit = await findDepositByOrderId(orderId)
  if (existingDeposit && existingDeposit.status === 'paid') {
    throw Errors.conflict('押金已支付')
  }

  return record
}

interface PersistOptions {
  record?: CheckInRecord
  orderStr?: string
  payerUserId?: string
}

/**
 * Mock 支付（保留旧实现，方便联调/演示）
 */
export async function createPaymentMock(
  orderId: string,
  channel: PayChannel
): Promise<CreatePaymentResult> {
  const record = await getRecordForPayment(orderId)
  const tradeNO = `MOCK_${channel}_${Date.now()}`

  const depositId = await createDeposit({
    orderId,
    amount: DEPOSIT_AMOUNT,
    channel,
    status: 'created',
    tradeNO,
  })

  await updateCheckInRecord(orderId, { depositId })

  console.log(
    `[Deposit] [Mock] 创建支付订单: orderId=${orderId}, channel=${channel}, tradeNO=${tradeNO}, room=${record.roomName}`
  )

  return { tradeNO, orderId, amount: DEPOSIT_AMOUNT, channel }
}

/**
 * 创建真实支付订单（支付宝）- 仅负责持久化
 */
export async function createPayment(
  orderId: string,
  channel: PayChannel,
  tradeNO: string,
  options: PersistOptions = {}
): Promise<CreatePaymentResult> {
  if (channel !== 'alipay') {
    throw Errors.badRequest('当前仅支持支付宝支付')
  }

  const record = options.record ?? (await getRecordForPayment(orderId))

  // 创建押金记录
  const depositId = await createDeposit({
    orderId,
    amount: DEPOSIT_AMOUNT,
    channel,
    status: 'created',
    tradeNO,
    ...(options.payerUserId ? { payerUserId: options.payerUserId } : {}),
  })

  // 关联到入住记录
  await updateCheckInRecord(orderId, { depositId })

  console.log(
    `[Deposit] 创建支付订单: orderId=${orderId}, channel=${channel}, tradeNO=${tradeNO}, room=${record.roomName}`
  )

  return {
    tradeNO,
    orderId,
    amount: DEPOSIT_AMOUNT,
    channel,
    ...(options.orderStr ? { orderStr: options.orderStr } : {}),
  }
}

/**
 * 处理支付宝异步通知，更新押金状态
 * out_trade_no 格式：AI{orderId}_{timestamp}
 */
export async function handleAlipayNotify(outTradeNo: string, tradeNo: string): Promise<void> {
  const orderId = outTradeNo.replace(/^AI/, '').replace(/_\d+$/, '')

  const deposit = await findDepositByOrderId(orderId)
  if (!deposit || deposit.status === 'paid') return

  await updateDeposit(orderId, {
    status: 'paid',
    transactionId: tradeNo,
    paidAt: new Date(),
  })

  await updateCheckInRecord(orderId, {
    depositPaid: true,
    status: 'checked_in',
  })

  console.log(`[Deposit] 支付宝回调确认: orderId=${orderId}, tradeNo=${tradeNo}`)
}

/**
 * 查询押金状态
 */
export async function getDepositStatus(
  orderId: string
): Promise<{ status: Deposit['status']; paidAt?: Date } | null> {
  const deposit = await findDepositByOrderId(orderId)
  if (!deposit) return null

  return {
    status: deposit.status,
    ...(deposit.paidAt ? { paidAt: deposit.paidAt } : {}),
  }
}
