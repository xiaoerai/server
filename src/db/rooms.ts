import { db } from './client'

export interface Room {
  _id?: string
  hotelId: string // 民宿ID
  roomNumber: string // 房间号
  doorCode: string // 门锁密码
  wifiName: string // WiFi名称
  wifiPassword: string // WiFi密码
  deposit: number // 押金（分）
}

const collection = db.collection('rooms')

// 根据民宿ID查找房间列表
export async function findRoomsByHotelId(hotelId: string): Promise<Room[]> {
  const { data } = await collection.where({ hotelId }).get()
  return data as Room[]
}

// 根据ID查找房间
export async function findRoomById(id: string): Promise<Room | null> {
  const { data } = await collection.where({ _id: id }).get()
  return (data[0] as Room) || null
}

// 创建房间
export async function createRoom(room: Omit<Room, '_id'>): Promise<string> {
  const { id } = await collection.add(room)
  return id as string
}

// 更新房间信息
export async function updateRoom(
  id: string,
  updates: Partial<Omit<Room, '_id' | 'hotelId'>>
): Promise<void> {
  await collection.doc(id).update(updates)
}
