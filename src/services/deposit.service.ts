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
}

// TODO: 后续从 rooms 表读取
const DEPOSIT_AMOUNT = 50000 // 500 元

/**
 * 创建支付订单
 */
export async function createPayment(
  orderId: string,
  channel: PayChannel
): Promise<CreatePaymentResult> {
  const record = await findRecordByOrderId(orderId)
  if (!record) {
    throw Errors.notFound('未找到入住记录')
  }

  // 检查是否已有押金记录且已支付
  const existingDeposit = await findDepositByOrderId(orderId)
  if (existingDeposit && existingDeposit.status === 'paid') {
    throw Errors.conflict('押金已支付')
  }

  // TODO: 调用收钱吧 API 创建预订单
  // const result = await shouqianba.precreate({ amount, channel, orderId })
  // return { tradeNO: result.tradeNO, ... }

  // Mock
  const tradeNO = `MOCK_${channel}_${Date.now()}`

  // 创建押金记录
  const depositId = await createDeposit({
    orderId,
    amount: DEPOSIT_AMOUNT,
    channel,
    status: 'created',
    tradeNO,
  })

  // 关联到入住记录
  await updateCheckInRecord(orderId, { depositId })

  console.log(`[Deposit] 创建支付订单: orderId=${orderId}, channel=${channel}, tradeNO=${tradeNO}`)

  return { tradeNO, orderId, amount: DEPOSIT_AMOUNT, channel }
}

/**
 * 确认支付成功
 * 真实环境由收钱吧回调触发，mock 环境前端直接调用
 */
export async function confirmPayment(
  orderId: string,
  transactionId: string
): Promise<{ checkin: CheckInRecord; deposit: Deposit }> {
  const record = await findRecordByOrderId(orderId)
  if (!record) {
    throw Errors.notFound('未找到入住记录')
  }
  const deposit = await findDepositByOrderId(orderId)
  if (!deposit) {
    throw Errors.notFound('未找到押金记录')
  }
  if (deposit.status === 'paid') {
    throw Errors.conflict('押金已支付')
  }

  // 更新押金记录
  await updateDeposit(orderId, {
    status: 'paid',
    transactionId,
    paidAt: new Date(),
  })

  // 更新入住记录
  await updateCheckInRecord(orderId, {
    depositPaid: true,
    status: 'checked_in',
  })

  console.log(`[Deposit] 支付确认: orderId=${orderId}, transactionId=${transactionId}`)

  return {
    checkin: {
      ...record,
      depositPaid: true,
      status: 'checked_in',
      updatedAt: new Date(),
    },
    deposit: {
      ...deposit,
      status: 'paid',
      transactionId,
      paidAt: new Date(),
      updatedAt: new Date(),
    },
  }
}
