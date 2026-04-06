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

// 查询押金列表（分页 + 状态筛选）
export async function findAllDeposits(params: {
  status?: string
  page: number
  pageSize: number
}): Promise<Deposit[]> {
  const where: Record<string, unknown> = {}
  if (params.status) where.status = params.status

  const skip = (params.page - 1) * params.pageSize
  const { data } = await collection
    .where(where)
    .orderBy('createdAt', 'desc')
    .skip(skip)
    .limit(params.pageSize)
    .get()
  return data as Deposit[]
}

// 统计押金记录数量
export async function countDeposits(params: { status?: string }): Promise<number> {
  const where: Record<string, unknown> = {}
  if (params.status) where.status = params.status

  const { total } = await collection.where(where).count()
  return total ?? 0
}

// 更新押金状态（按 orderId + 当前状态匹配）
export async function updateDeposit(
  orderId: string,
  updates: Partial<Pick<Deposit, 'status' | 'transactionId' | 'paidAt' | 'refundedAt'>>,
  currentStatus?: Deposit['status']
): Promise<void> {
  const where: Record<string, unknown> = { orderId }
  if (currentStatus) {
    where.status = currentStatus
  }
  await collection.where(where).update({
    ...updates,
    updatedAt: new Date(),
  })
}
