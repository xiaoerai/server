import { db } from './client'

export interface Deposit {
  _id?: string
  orderId: string // 关联的订单ID
  amount: number // 金额（分）
  channel: 'alipay' | 'wechat' // 支付渠道
  status: 'created' | 'paid' | 'refunded' // 支付状态
  payerUserId?: string // 支付者平台用户ID（退款时使用）
  tradeNO?: string // 收钱吧/支付宝交易号
  transactionId?: string // 支付回调的交易流水号
  paidAt?: Date // 支付时间
  refundedAt?: Date // 退款时间
  createdAt: Date
  updatedAt: Date
}

const collection = db.collection('deposits')

// 根据订单ID查找押金记录
export async function findDepositByOrderId(orderId: string): Promise<Deposit | null> {
  const { data } = await collection.where({ orderId }).orderBy('createdAt', 'desc').get()
  return (data[0] as Deposit) || null
}

// 创建押金记录
export async function createDeposit(
  deposit: Omit<Deposit, '_id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const now = new Date()
  const { id } = await collection.add({
    ...deposit,
    createdAt: now,
    updatedAt: now,
  })
  return id as string
}

// 更新押金状态
export async function updateDeposit(
  orderId: string,
  updates: Partial<Pick<Deposit, 'status' | 'transactionId' | 'paidAt' | 'refundedAt'>>
): Promise<void> {
  await collection.where({ orderId, status: 'created' }).update({
    ...updates,
    updatedAt: new Date(),
  })
}
