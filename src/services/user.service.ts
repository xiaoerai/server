/**
 * 用户服务
 */

import { findUserByPhone, findGuestsByIds, findGuestByIdNumber, removeGuestIdFromUser } from '../db'

export interface GuestInfo {
  name: string
  idNumber: string
}

/**
 * 获取用户关联的历史住客
 */
export async function getGuestsByPhone(phone: string): Promise<GuestInfo[]> {
  const user = await findUserByPhone(phone)
  if (!user || !user.guestIds || user.guestIds.length === 0) {
    return []
  }

  const guests = await findGuestsByIds(user.guestIds)

  // 按 guestIds 顺序排列（最近使用的在前）
  return user.guestIds
    .map((id) => guests.find((g) => g._id === id))
    .filter(Boolean)
    .map((g) => ({ name: g!.name, idNumber: g!.idNumber }))
}

/**
 * 通过身份证号解除用户与住客的关联
 */
export async function unlinkGuestByIdNumber(phone: string, idNumber: string): Promise<void> {
  const guest = await findGuestByIdNumber(idNumber)
  if (!guest || !guest._id) return
  await removeGuestIdFromUser(phone, guest._id)
}
