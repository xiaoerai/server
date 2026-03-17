import { db } from './client'

export interface CheckInRecord {
  _id?: string
  hostexOrderId: string       // 百居易订单ID
  roomId: string              // 百居易房型ID
  roomName: string            // 房间名称（冗余存储，方便显示）
  phone: string               // 入住人手机号
  checkInDate: string         // 入住日期
  checkOutDate: string        // 退房日期

  idUploaded: boolean         // 是否已上传身份证
  idImageUrl?: string         // 身份证照片URL
  depositPaid: boolean        // 是否已支付押金
  depositAmount?: number      // 押金金额

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
  const { data } = await collection
    .where({ phone })
    .orderBy('checkInDate', 'desc')
    .get()
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
  return id
}

// 更新入住记录
export async function updateCheckInRecord(
  hostexOrderId: string,
  updates: Partial<Pick<CheckInRecord, 'idUploaded' | 'idImageUrl' | 'depositPaid' | 'depositAmount' | 'status'>>
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
