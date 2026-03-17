import { db } from './client'

export interface Guest {
  _id?: string
  checkInRecordId: string // 入住记录ID
  name: string // 姓名
  idNumber: string // 身份证号
  idImageUrl?: string // 身份证照片
  createdAt: Date
}

const collection = db.collection('guests')

// 根据入住记录ID查找住客
export async function findGuestsByRecordId(checkInRecordId: string): Promise<Guest[]> {
  const { data } = await collection.where({ checkInRecordId }).get()
  return data as Guest[]
}

// 创建住客记录
export async function createGuest(guest: Omit<Guest, '_id' | 'createdAt'>): Promise<string> {
  const { id } = await collection.add({
    ...guest,
    createdAt: new Date(),
  })
  return id as string
}

// 批量创建住客
export async function createGuests(guests: Omit<Guest, '_id' | 'createdAt'>[]): Promise<void> {
  const now = new Date()
  for (const guest of guests) {
    await collection.add({
      ...guest,
      createdAt: now,
    })
  }
}
