import { db } from './client'

const _ = db.command

export interface CheckInRecord {
  _id?: string
  hostexOrderId: string // PMS 订单ID
  roomNumber: string // 房间号（关联 rooms 表）
  roomName: string // 房间名称（冗余存储，方便显示）
  phone: string // 下单人手机号
  checkInDate: string // 入住日期
  checkOutDate: string // 退房日期
  source?: string // OTA 来源（meituan / ctrip / douyin / manual）

  guestIds: string[] // 住客ID列表

  depositId?: string // 关联押金记录ID
  depositPaid: boolean // 是否已支付押金

  status: 'pending' | 'checked_in' | 'checked_out'

  createdAt: Date
  updatedAt: Date
}

const collection = db.collection('check_in_records')

// 根据订单ID查找记录
export async function findRecordByOrderId(hostexOrderId: string): Promise<CheckInRecord | null> {
  const { data } = await collection.where({ hostexOrderId }).get()
  return (data[0] as CheckInRecord) || null
}

// 根据手机号查找记录
export async function findRecordsByPhone(phone: string): Promise<CheckInRecord[]> {
  const { data } = await collection.where({ phone }).orderBy('checkInDate', 'desc').get()
  return data as CheckInRecord[]
}

// 创建入住记录
export async function createCheckInRecord(
  record: Omit<CheckInRecord, '_id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const now = new Date()
  const { id } = await collection.add({
    ...record,
    createdAt: now,
    updatedAt: now,
  })
  return id as string
}

// 更新入住记录
export async function updateCheckInRecord(
  hostexOrderId: string,
  updates: Partial<Pick<CheckInRecord, 'depositId' | 'depositPaid' | 'status'>>
): Promise<void> {
  await collection.where({ hostexOrderId }).update({
    ...updates,
    updatedAt: new Date(),
  })
}

// 更新状态
export async function updateRecordStatus(
  hostexOrderId: string,
  status: CheckInRecord['status']
): Promise<void> {
  await collection.where({ hostexOrderId }).update({
    status,
    updatedAt: new Date(),
  })
}

// 添加住客ID到记录
export async function addGuestIdToRecord(recordId: string, guestId: string): Promise<void> {
  await collection.doc(recordId).update({
    guestIds: _.push(guestId),
    updatedAt: new Date(),
  })
}
