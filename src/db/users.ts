import { db } from './client'

export interface User {
  _id?: string
  phone: string
  guestIds?: string[] // 关联的住客ID列表（按最近使用排序）
  createdAt: Date
  lastLoginAt: Date
}

export async function findUserByOpenid(openid: string): Promise<User | null> {
  const { data } = await db.collection('users').where({ openid }).get()
  return (data[0] as User) || null
}

export async function findUserByPhone(phone: string): Promise<User | null> {
  const { data } = await db.collection('users').where({ phone }).get()
  return (data[0] as User) || null
}

export async function createUser(phone: string): Promise<void> {
  const now = new Date()
  await db.collection('users').add({
    phone,
    createdAt: now,
    lastLoginAt: now,
  })
}

export async function updateUserLogin(phone: string): Promise<void> {
  await db.collection('users').where({ phone }).update({
    lastLoginAt: new Date(),
  })
}

// 关联住客到用户（最近使用的排最前，去重）
export async function addGuestIdToUser(phone: string, guestId: string): Promise<void> {
  const user = await findUserByPhone(phone)
  if (!user) return

  const existing = user.guestIds || []
  // 去重：先移除已有的，再插入到头部
  const updated = [guestId, ...existing.filter((id) => id !== guestId)]

  await db.collection('users').where({ phone }).update({
    guestIds: updated,
  })
}

// 从用户的住客列表中移除
export async function removeGuestIdFromUser(phone: string, guestId: string): Promise<void> {
  const user = await findUserByPhone(phone)
  if (!user || !user.guestIds) return

  const updated = user.guestIds.filter((id) => id !== guestId)

  await db.collection('users').where({ phone }).update({
    guestIds: updated,
  })
}
