/**
 * 入住服务
 */

import {
  createCheckInRecord,
  findRecordByOrderId,
  updateCheckInRecord,
  CheckInRecord,
  findRoomByPms,
  updateRoomStatus,
} from '../db'
import { Errors } from '../middleware/error'

export interface CreateCheckInParams {
  orderId: string
  pmsRoomId: string
  pms: string
  roomName: string
  phone: string
  checkInDate: string
  checkOutDate: string
  ota?: string
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
  const { orderId, pmsRoomId, pms, roomName, phone, checkInDate, checkOutDate, ota, guestIds = [] } = params

  // 检查是否已存在
  const existing = await findRecordByOrderId(orderId)
  if (existing) {
    throw Errors.conflict('该订单已办理入住')
  }

  // 通过 PMS 映射查找房间号
  const room = await findRoomByPms(pms, pmsRoomId)
  if (!room) {
    throw Errors.notFound(`未找到房间映射: ${pms}/${pmsRoomId}`)
  }

  const record: Omit<CheckInRecord, '_id' | 'createdAt' | 'updatedAt'> = {
    hostexOrderId: orderId,
    roomNumber: room.roomNumber,
    roomName,
    phone,
    checkInDate,
    checkOutDate,
    ota,
    guestIds,
    depositPaid: false,
    status: 'pending',
  }

  const id = await createCheckInRecord(record)

  console.log(`[CheckIn] 创建入住记录: ${orderId}, room=${room.roomNumber}, id=${id}`)

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

  // 联动房间状态 → dirty
  await updateRoomStatus(record.roomNumber, 'dirty')

  console.log(`[CheckIn] 退房: ${orderId}, room=${record.roomNumber} → dirty`)

  return { ...record, status: 'checked_out', updatedAt: new Date() }
}
