import { db } from './client'

export interface PmsMapping {
  platform: string // 'hostex' 等
  roomId: string // PMS 里的房间ID
}

export interface Room {
  _id?: string
  roomNumber: string // 房间号（唯一标识，如 "301"）
  roomName: string // 房间名（如 "301 轻旅｜投影大床房"）
  doorCode: string // 门锁密码
  wifiName: string // WiFi名称
  wifiPassword: string // WiFi密码
  deposit: number // 押金（分）
  status: 'available' | 'occupied' | 'dirty'
  pms: PmsMapping[] // PMS 平台关联
}

const collection = db.collection('rooms')

// 查找所有房间
export async function findAllRooms(): Promise<Room[]> {
  const { data } = await collection.get()
  return data as Room[]
}

// 根据房间号查找
export async function findRoomByNumber(roomNumber: string): Promise<Room | null> {
  const { data } = await collection.where({ roomNumber }).get()
  return (data[0] as Room) || null
}

// 根据 PMS 平台 + roomId 查找
export async function findRoomByPms(platform: string, roomId: string): Promise<Room | null> {
  const { data } = await collection
    .where({ 'pms.platform': platform, 'pms.roomId': roomId })
    .get()
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
  roomNumber: string,
  updates: Partial<Omit<Room, '_id' | 'roomNumber'>>
): Promise<void> {
  await collection.where({ roomNumber }).update(updates)
}

// 根据房间号更新状态
export async function updateRoomStatus(
  roomNumber: string,
  status: Room['status']
): Promise<void> {
  await collection.where({ roomNumber }).update({ status })
}

// 创建或更新房间（同步用）
export async function upsertRoomByPms(
  platform: string,
  pmsRoomId: string,
  data: { roomNumber: string; roomName: string }
): Promise<void> {
  // 先按房间号查
  const existing = await findRoomByNumber(data.roomNumber)
  if (existing) {
    // 房间已存在，更新名称，确保 pms 映射存在
    const hasPms = existing.pms?.some(
      (p) => p.platform === platform && p.roomId === pmsRoomId
    )
    if (!hasPms) {
      const updatedPms = [...(existing.pms || []), { platform, roomId: pmsRoomId }]
      await collection.where({ roomNumber: data.roomNumber }).update({
        roomName: data.roomName,
        pms: updatedPms,
      })
    } else {
      await collection.where({ roomNumber: data.roomNumber }).update({
        roomName: data.roomName,
      })
    }
  } else {
    // 新房间
    await collection.add({
      roomNumber: data.roomNumber,
      roomName: data.roomName,
      doorCode: '',
      wifiName: '',
      wifiPassword: '',
      deposit: 0,
      status: 'available',
      pms: [{ platform, roomId: pmsRoomId }],
    })
  }
}
