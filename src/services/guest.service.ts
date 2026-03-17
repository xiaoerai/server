/**
 * 住客服务
 */

import { createGuest as dbCreateGuest, findGuestsByIds, addGuestIdToRecord, Guest } from '../db'

export interface GuestInput {
  name: string
  idNumber: string
  idImageUrl?: string
}

/**
 * 创建住客
 */
export async function createGuest(guest: GuestInput): Promise<string> {
  const guestId = await dbCreateGuest({
    name: guest.name,
    idNumber: guest.idNumber,
    idImageUrl: guest.idImageUrl,
  })

  console.log(`[Guest] 创建住客: guestId=${guestId}`)

  return guestId
}

/**
 * 添加住客到入住记录
 */
export async function addGuestToCheckInRecord(recordId: string, guestId: string): Promise<void> {
  await addGuestIdToRecord(recordId, guestId)
  console.log(`[Guest] 关联住客到入住记录: recordId=${recordId}, guestId=${guestId}`)
}

/**
 * 根据ID列表获取住客
 */
export async function getGuestsByIds(ids: string[]): Promise<Guest[]> {
  return findGuestsByIds(ids)
}
