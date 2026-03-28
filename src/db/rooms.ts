import { db } from './client'

export interface Room {
  _id?: string
  hostexHouseId: number // Hostex 房间ID
  roomNumber: string // 房间号（如 "301"）
  roomName: string // 房间名（如 "301 轻旅｜投影大床房"）
  doorCode: string // 门锁密码
  wifiName: string // WiFi名称
  wifiPassword: string // WiFi密码
  deposit: number // 押金（分）
  status: 'available' | 'occupied' | 'dirty'
}

const collection = db.collection('rooms')

// 查找所有房间
export async function findAllRooms(): Promise<Room[]> {
  const { data } = await collection.get()
  return data as Room[]
}

// 根据 Hostex 房间ID查找
export async function findRoomByHostexId(hostexHouseId: number): Promise<Room | null> {
  const { data } = await collection.where({ hostexHouseId }).get()
  return (data[0] as Room) || null
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
  updates: Partial<Omit<Room, '_id'>>
): Promise<void> {
  await collection.doc(id).update(updates)
}

// 根据 Hostex 房间ID更新状态
export async function updateRoomStatusByHostexId(
  hostexHouseId: number,
  status: Room['status']
): Promise<void> {
  await collection.where({ hostexHouseId }).update({ status })
}

// 创建或更新房间（同步用）
export async function upsertRoom(
  hostexHouseId: number,
  data: Omit<Room, '_id' | 'hostexHouseId'>
): Promise<void> {
  const existing = await findRoomByHostexId(hostexHouseId)
  if (existing) {
    // 只更新名称和房间号，不覆盖密码、WiFi等手动配置的字段
    await collection.where({ hostexHouseId }).update({
      roomNumber: data.roomNumber,
      roomName: data.roomName,
    })
  } else {
    await collection.add({ hostexHouseId, ...data })
  }
}
