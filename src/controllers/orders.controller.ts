import { Request, Response, NextFunction } from 'express'
// import { findOrdersByPhone } from '../db'

// GET /api/orders?phone=xxx
export async function getOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const phone = req.query.phone as string

    if (!phone) {
      res.status(400).json({
        success: false,
        message: '缺少 phone 参数',
      })
      return
    }

    // TODO: 正式环境从数据库查询
    // const orders = await findOrdersByPhone(phone)

    // 开发阶段：返回模拟订单数据
    const mockOrders = [
      {
        orderId: 'ORD20260316001',
        roomNumber: '悦享大床房 301',
        checkInDate: '2026-03-16',
        checkOutDate: '2026-03-18',
      },
      {
        orderId: 'ORD20260316002',
        roomNumber: '豪华双床房 502',
        checkInDate: '2026-03-16',
        checkOutDate: '2026-03-17',
      },
    ]

    console.log(`[Orders] 返回模拟订单给 ${phone}:`, mockOrders.length, '条')

    res.json({
      success: true,
      data: mockOrders,
    })
  } catch (err) {
    next(err)
  }
}
