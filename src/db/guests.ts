import { db } from './client'

export interface Guest {
  _id?: string
  name: string // 姓名
  idNumber: string // 身份证号
  idImageUrl?: string // 身份证照片
  createdAt: Date
}

const _ = db.command
const collection = db.collection('guests')

// 根据身份证号查找住客
export async function findGuestByIdNumber(idNumber: string): Promise<Guest | null> {
  const { data } = await collection.where({ idNumber }).get()
  return (data[0] as Guest) || null
}

// 根据ID列表查找住客
export async function findGuestsByIds(ids: string[]): Promise<Guest[]> {
  if (ids.length === 0) return []
  const { data } = await collection.where({ _id: _.in(ids) }).get()
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
