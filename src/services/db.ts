import tcb from '@cloudbase/node-sdk'

// 云开发初始化
const app = tcb.init({
  env: process.env.TCB_ENV_ID!,
  secretId: process.env.TCB_SECRET_ID,
  secretKey: process.env.TCB_SECRET_KEY,
})

export const db = app.database()

// ============ 验证码相关 ============

export interface SmsCode {
  phone: string
  code: string
  expireAt: Date
  createdAt: Date
}

export async function saveSmsCode(phone: string, code: string): Promise<void> {
  const expireAt = new Date(Date.now() + 5 * 60 * 1000) // 5分钟后过期
  const createdAt = new Date()

  console.log(`[验证码] 保存: phone="${phone}", code="${code}"`)

  // 先删除旧的验证码
  const removeResult = await db.collection('sms_codes').where({ phone }).remove()
  console.log(`[验证码] 删除旧记录:`, removeResult)

  // 保存新验证码
  const addResult = await db.collection('sms_codes').add({
    phone,
    code,
    expireAt,
    createdAt,
  })
  console.log(`[验证码] 新记录已保存:`, addResult)
}

export async function verifySmsCode(phone: string, code: string): Promise<boolean> {
  console.log(`[验证码] 验证: phone=${phone}, code=${code}`)
  const { data } = await db.collection('sms_codes').where({ phone, code }).get()
  console.log(`[验证码] 查询结果:`, data)

  if (data.length === 0) {
    console.log(`[验证码] 未找到匹配记录`)
    return false
  }

  const record = data[0] as SmsCode

  // 检查是否过期
  if (new Date(record.expireAt) < new Date()) {
    console.log(`[验证码] 已过期`)
    return false
  }

  console.log(`[验证码] 验证成功`)
  return true
}

// 删除验证码（登录成功后调用）
export async function deleteSmsCode(phone: string): Promise<void> {
  await db.collection('sms_codes').where({ phone }).remove()
}

// 检查是否可以发送验证码（60秒限制）
export async function canSendSmsCode(phone: string): Promise<boolean> {
  const { data } = await db.collection('sms_codes').where({ phone }).get()

  if (data.length === 0) {
    return true
  }

  const record = data[0] as SmsCode
  const elapsed = Date.now() - new Date(record.createdAt).getTime()

  // 60秒内不能重复发送
  return elapsed >= 60 * 1000
}

// ============ 用户相关 ============

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

// ============ 订单相关 ============

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
