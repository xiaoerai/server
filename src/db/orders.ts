import { db } from './client'

export interface Order {
  _id?: string
  orderId: string
  hotelId: string
  phone: string
  roomNumber: string
  checkInDate: string
  checkOutDate: string
  depositStatus: 'unpaid' | 'paid' | 'refunded'
  status: 'pending' | 'checked_in' | 'checked_out'
  createdAt: Date
  updatedAt: Date
}

export async function findOrdersByPhone(phone: string): Promise<Order[]> {
  const { data } = await db
    .collection('orders')
    .where({ phone })
    .orderBy('checkInDate', 'desc')
    .get()

  return data as Order[]
}
