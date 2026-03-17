import { Request, Response, NextFunction } from 'express'
import { findOrders } from '../services/hostex.service'

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
  } catch (err) {
    console.error('[Orders] 查询失败:', err)
    next(err)
  }
}
