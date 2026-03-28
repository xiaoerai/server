/**
 * 入住服务
 */

import { createCheckInRecord, findRecordByOrderId, updateCheckInRecord, CheckInRecord } from '../db'
import { Errors } from '../middleware/error'

export interface CreateCheckInParams {
  orderId: string
  roomId: string
  roomName: string
  phone: string
  checkInDate: string
  checkOutDate: string
  guestIds?: string[]
}

export interface UpdateCheckInParams {
  depositId?: string
  status?: CheckInRecord['status']
}

/**
 * 创建入住记录
 */
export async function createCheckIn(params: CreateCheckInParams): Promise<CheckInRecord> {
  const { orderId, roomId, roomName, phone, checkInDate, checkOutDate, guestIds = [] } = params

  // 检查是否已存在
  const existing = await findRecordByOrderId(orderId)
  if (existing) {
    throw Errors.conflict('该订单已办理入住')
  }

  const record: Omit<CheckInRecord, '_id' | 'createdAt' | 'updatedAt'> = {
    hostexOrderId: orderId,
    roomId,
    roomName,
    phone,
    checkInDate,
    checkOutDate,
    guestIds,
    depositPaid: false,
    status: 'pending',
  }

  const id = await createCheckInRecord(record)

  console.log(`[CheckIn] 创建入住记录: ${orderId}, id=${id}`)

  return { _id: id, ...record, createdAt: new Date(), updatedAt: new Date() }
}

/**
 * 查询入住记录
 */
export async function getCheckInByOrderId(orderId: string): Promise<CheckInRecord | null> {
  return findRecordByOrderId(orderId)
}

/**
 * 更新入住记录
 */
export async function updateCheckIn(orderId: string, params: UpdateCheckInParams): Promise<void> {
  const existing = await findRecordByOrderId(orderId)
  if (!existing) {
    throw Errors.notFound('未找到入住记录')
  }

  await updateCheckInRecord(orderId, params)

  console.log(`[CheckIn] 更新入住记录: ${orderId}`, params)
}

/**
 * 退房
 */
export async function checkout(orderId: string): Promise<CheckInRecord> {
  const record = await findRecordByOrderId(orderId)
  if (!record) {
    throw Errors.notFound('未找到入住记录')
  }

  if (record.status === 'checked_out') {
    throw Errors.conflict('该订单已退房')
  }

  if (record.status !== 'checked_in') {
    throw Errors.badRequest('当前状态不允许退房')
  }

  await updateCheckInRecord(orderId, { status: 'checked_out' })

  console.log(`[CheckIn] 退房: ${orderId}`)

  return { ...record, status: 'checked_out', updatedAt: new Date() }
}
