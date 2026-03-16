import { db } from './client'

export interface User {
  _id?: string
  openid: string
  phone: string
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

export async function createUser(openid: string, phone: string): Promise<void> {
  const now = new Date()
  await db.collection('users').add({
    openid,
    phone,
    createdAt: now,
    lastLoginAt: now,
  })
}

export async function updateUserLogin(openid: string): Promise<void> {
  await db.collection('users').where({ openid }).update({
    lastLoginAt: new Date(),
  })
}
