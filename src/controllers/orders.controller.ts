import { Request, Response } from 'express'
import { findOrders } from '../services/hostex.service'
import { asyncHandler, Errors } from '../middleware/error'

// 模拟订单数据（测试用）
const MOCK_PHONE = '15290500792'

function getMockOrders() {
  const today = new Date()
  const formatDate = (d: Date) => d.toISOString().split('T')[0]
  const addDays = (d: Date, n: number) => {
    const result = new Date(d)
    result.setDate(result.getDate() + n)
    return result
  }

  return [
    {
      orderId: 'MOCK_ORD_001',
      roomName: '301 豪华大床房',
      houseId: 12556371,
      pms: 'hostex',
      pmsRoomId: '12556371',
      ota: 'manual',
      checkInDate: formatDate(today),
      checkOutDate: formatDate(addDays(today, 2)),
    },
    {
      orderId: 'MOCK_ORD_002',
      roomName: '502 海景双床房',
      houseId: 12556372,
      pms: 'hostex',
      pmsRoomId: '12556372',
      ota: 'meituan',
      checkInDate: formatDate(addDays(today, 1)),
      checkOutDate: formatDate(addDays(today, 4)),
    },
  ]
}

// GET /api/orders?phone=xxx
export const getOrders = asyncHandler(async (req: Request, res: Response) => {
  const phone = req.query.phone as string

  if (!phone) {
    throw Errors.badRequest('缺少 phone 参数')
  }

  // 测试手机号：直接返回模拟订单
  if (phone === MOCK_PHONE) {
    console.log(`[Orders] 返回模拟订单 (phone: ${phone})`)
    return res.json({
      success: true,
      data: getMockOrders(),
    })
  }

  // TODO: 后续从数据库获取民宿对应的凭证
  const credentials = {
    session: process.env.HOSTEX_SESSION!,
    operatorId: process.env.HOSTEX_OPERATOR_ID!,
  }

  // 实时调用百居易 API 查询订单
  const orders = await findOrders(credentials, { phone })

  console.log(`[Orders] 查询到 ${orders.length} 条订单 (phone: ${phone})`)

  res.json({
    success: true,
    data: orders,
  })
})
