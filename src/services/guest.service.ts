/**
 * 住客服务
 */

import { createGuest, findGuestsByRecordId, Guest } from '../db'

export interface GuestInput {
  name: string
  idNumber: string
  idImageUrl?: string
}

/**
 * 添加住客
 */
export async function addGuest(checkInRecordId: string, guest: GuestInput): Promise<string> {
  const guestId = await createGuest({
    checkInRecordId,
    name: guest.name,
    idNumber: guest.idNumber,
    idImageUrl: guest.idImageUrl,
  })

  console.log(`[Guest] 添加住客: recordId=${checkInRecordId}, guestId=${guestId}`)

  return guestId
}

/**
 * 获取入住记录的所有住客
 */
export async function getGuestsByRecordId(checkInRecordId: string): Promise<Guest[]> {
  return findGuestsByRecordId(checkInRecordId)
}
