/**
 * 百居易 (Hostex) 订单查询服务
 *
 * 实时调用百居易 API 获取订单，不做本地同步
 */

const HOSTEX_BASE_URL = 'https://www.myhostex.com/api'

// 百居易 API 返回的数据结构
interface HostexClient {
  name: string
  phone: string
  email?: string
}

interface HostexHouse {
  id: number
  title: string
}

interface HostexReservation {
  code: string
  check_in: string
  check_out: string
  staying_status: string
  house: HostexHouse
  house_id: number
  guest: {
    name: string
    phone: string
  }
}

interface HostexOrder {
  code: string
  status: string
  thirdparty_type: number
  create_time: string
  update_time: string
  client: HostexClient
  reservations: HostexReservation[]
}

interface HostexResponse {
  error_code: number
  error_msg: string
  data: {
    list: HostexOrder[]
    total?: number
  }
}

// OTA 平台映射
const OTA_MAP: Record<number, string> = {
  5: 'manual',
  11: 'ctrip',
  12: 'meituan',
  22: 'douyin',
}

// 返回给前端的订单格式
export interface Order {
  orderId: string
  guestName: string
  guestPhone: string
  houseId: number
  roomName: string
  checkInDate: string
  checkOutDate: string
  status: string
  ota: string // OTA 来源
  pms: string // PMS 平台
  pmsRoomId: string // PMS 房间ID
}

// 筛选条件
export interface OrderFilter {
  phone?: string
  houseId?: number
}

// 百居易凭证
export interface HostexCredentials {
  session: string
  operatorId: string
}

/**
 * 格式化手机号：去除空格、横线和+86前缀
 * 百居易格式：+86 186 2961 6237 或 15072851529
 * 标准格式：18629616237
 */
function normalizePhone(phone: string): string {
  if (!phone) return ''
  return phone.replace(/[\s\+\-]/g, '').replace(/^86/, '')
}

/**
 * 格式化日期：从 "2026-03-20 00:00:00" 提取 "2026-03-20"
 */
function formatDate(datetime: string): string {
  if (!datetime) return ''
  return datetime.split(' ')[0]
}

/**
 * 获取今天的日期字符串 YYYY-MM-DD
 */
function getToday(): string {
  return new Date().toISOString().split('T')[0]
}

/**
 * 从百居易获取订单列表
 */
async function fetchOrdersFromHostex(
  session: string,
  operatorId: string,
  startDate: string,
  endDate: string
): Promise<HostexOrder[]> {
  const url = new URL(`${HOSTEX_BASE_URL}/reservation_order/list`)
  url.searchParams.set('page', '1')
  url.searchParams.set('page_size', '100')
  url.searchParams.set('date_type', 'check_in')
  url.searchParams.set('out_status', 'wait_stay')
  url.searchParams.set('start_date', startDate)
  url.searchParams.set('end_date', endDate)
  url.searchParams.set('opid', operatorId)
  url.searchParams.set('opclient', 'Web-Mac-Chrome')

  const response = await fetch(url.toString(), {
    headers: {
      accept: 'application/json, text/plain, */*',
      cookie: `hostex_session=${session}; operator_id=${operatorId}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Hostex HTTP error: ${response.status}`)
  }

  const result = (await response.json()) as HostexResponse

  if (result.error_code !== 0) {
    throw new Error(`Hostex API error: [${result.error_code}] ${result.error_msg}`)
  }

  const list = result.data.list || []
  console.log(`[Hostex] API 返回 ${list.length} 条原始订单`)

  return list
}

/**
 * 将百居易订单转换为我们的格式
 */
function transformOrder(hostexOrder: HostexOrder): Order | null {
  const reservation = hostexOrder.reservations?.[0]
  if (!reservation) return null

  return {
    orderId: hostexOrder.code,
    guestName: hostexOrder.client?.name || reservation.guest?.name || '',
    guestPhone: normalizePhone(hostexOrder.client?.phone || reservation.guest?.phone || ''),
    houseId: reservation.house?.id || 0,
    roomName: reservation.house?.title || '',
    checkInDate: formatDate(reservation.check_in),
    checkOutDate: formatDate(reservation.check_out),
    status: hostexOrder.status,
    ota: OTA_MAP[hostexOrder.thirdparty_type] || 'unknown',
    pms: 'hostex',
    pmsRoomId: String(reservation.house_id),
  }
}

/**
 * 获取当天入住的订单
 */
export async function fetchAllOrders(credentials: HostexCredentials): Promise<Order[]> {
  const { session, operatorId } = credentials

  const today = getToday()

  console.log(`[Hostex] 获取订单: date=${today}`)

  const hostexOrders = await fetchOrdersFromHostex(session, operatorId, today, today)

  const orders = hostexOrders.map(transformOrder).filter((order): order is Order => order !== null)

  console.log(`[Hostex] 获取到 ${orders.length} 条订单`)

  return orders
}

/**
 * 筛选订单（只返回 accepted 状态）
 */
export function filterOrders(orders: Order[], filter: OrderFilter): Order[] {
  return orders.filter((order) => {
    // 只要 accepted 状态
    if (order.status !== 'accepted') return false

    // 按手机号筛选
    if (filter.phone) {
      const normalizedInputPhone = normalizePhone(filter.phone)
      if (order.guestPhone !== normalizedInputPhone) return false
    }

    // 按房源ID筛选
    if (filter.houseId) {
      if (order.houseId !== filter.houseId) return false
    }

    return true
  })
}

/**
 * 查询订单
 */
export async function findOrders(
  credentials: HostexCredentials,
  filter: OrderFilter
): Promise<Order[]> {
  const orders = await fetchAllOrders(credentials)
  const filtered = filterOrders(orders, filter)

  console.log(`[Hostex] 找到 ${filtered.length} 条匹配订单`, filter)
  console.log('[Hostex] 订单数据:', JSON.stringify(filtered, null, 2))

  return filtered
}

/**
 * 检查百居易 Session 是否有效
 */
export async function checkHostexSession(credentials: HostexCredentials): Promise<boolean> {
  try {
    const today = getToday()
    await fetchOrdersFromHostex(credentials.session, credentials.operatorId, today, today)
    return true
  } catch {
    return false
  }
}

// Hostex 房间列表返回结构
interface HostexRoom {
  id: number
  house_title: string
  house_type: {
    house_type_id: number
    title: string
  }
  checkin_guide: {
    address_info: string | null
    lock_info: string | null
    wifi_info: string | null
    guide_url: string | null
  }
}

interface HostexRoomResponse {
  error_code: number
  error_msg: string
  data: {
    list: HostexRoom[]
    total: number
  }
}

/**
 * 从百居易获取房间列表
 */
export async function fetchRoomsFromHostex(credentials: HostexCredentials): Promise<HostexRoom[]> {
  const { session, operatorId } = credentials

  const url = new URL(`${HOSTEX_BASE_URL}/house/search`)
  url.searchParams.set('page', '1')
  url.searchParams.set('page_size', '100')
  url.searchParams.set('opid', operatorId)
  url.searchParams.set('opclient', 'Web-Mac-Chrome')

  const response = await fetch(url.toString(), {
    headers: {
      accept: 'application/json, text/plain, */*',
      cookie: `hostex_session=${session}; operator_id=${operatorId}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Hostex HTTP error: ${response.status}`)
  }

  const result = (await response.json()) as HostexRoomResponse

  if (result.error_code !== 0) {
    throw new Error(`Hostex API error: [${result.error_code}] ${result.error_msg}`)
  }

  console.log(`[Hostex] 获取到 ${result.data.list.length} 个房间`)

  return result.data.list
}

/**
 * 解析房间号（从 "301 轻旅｜投影大床房" 提取 "301"）
 */
function parseRoomNumber(houseTitle: string): string {
  const match = houseTitle.match(/^(\d+)/)
  return match ? match[1] : houseTitle
}

export interface SyncRoomData {
  hostexHouseId: number
  roomNumber: string
  roomName: string
}

/**
 * 获取格式化的房间列表（用于同步到本地）
 */
export async function fetchRoomList(credentials: HostexCredentials): Promise<SyncRoomData[]> {
  const rooms = await fetchRoomsFromHostex(credentials)

  return rooms.map((room) => ({
    hostexHouseId: room.id,
    roomNumber: parseRoomNumber(room.house_title),
    roomName: room.house_title,
  }))
}
