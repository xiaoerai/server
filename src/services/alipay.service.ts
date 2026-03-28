import { AlipaySdk } from 'alipay-sdk'
import { Errors } from '../middleware/error'

const { ALIPAY_APP_ID, ALIPAY_PRIVATE_KEY, ALIPAY_PUBLIC_KEY, ALIPAY_NOTIFY_URL, ALIPAY_GATEWAY } =
  process.env

if (!ALIPAY_APP_ID || !ALIPAY_PRIVATE_KEY) {
  console.warn('[Alipay] 未配置 AppId 或私钥，支付接口将不可用')
}

const alipayClient =
  ALIPAY_APP_ID && ALIPAY_PRIVATE_KEY
    ? new AlipaySdk({
        appId: ALIPAY_APP_ID,
        privateKey: ALIPAY_PRIVATE_KEY,
        alipayPublicKey: ALIPAY_PUBLIC_KEY,
        charset: 'utf-8',
        gateway: ALIPAY_GATEWAY || 'https://openapi.alipay.com/gateway.do',
        signType: 'RSA2',
      })
    : null

/**
 * 用授权码换取支付宝 user_id
 */
export async function getAlipayUserId(authCode: string): Promise<string> {
  if (!alipayClient) {
    throw Errors.internal('支付宝未配置')
  }

  const result = await alipayClient.exec('alipay.system.oauth.token', {
    grantType: 'authorization_code',
    code: authCode,
  })

  if (!result.userId) {
    throw Errors.internal(`获取支付宝用户ID失败: ${result.subMsg || result.msg}`)
  }

  return result.userId
}

export interface CreateTradeParams {
  outTradeNo: string
  subject: string
  totalAmountCents: number
  buyerId?: string
  body?: string
}

export async function createTrade(params: CreateTradeParams): Promise<string> {
  if (!alipayClient) {
    throw Errors.internal('支付宝支付未配置')
  }

  const amountYuan = (params.totalAmountCents / 100).toFixed(2)

  const result = await alipayClient.exec('alipay.trade.create', {
    bizContent: {
      out_trade_no: params.outTradeNo,
      total_amount: amountYuan,
      subject: params.subject,
      product_code: 'JSAPI_PAY',
      ...(params.body ? { body: params.body } : {}),
      ...(params.buyerId ? { buyer_id: params.buyerId } : {}),
    },
    ...(ALIPAY_NOTIFY_URL ? { notifyUrl: ALIPAY_NOTIFY_URL } : {}),
  })

  if (!result.tradeNo) {
    throw Errors.internal(`支付宝下单失败: ${result.subMsg || result.msg}`)
  }

  return result.tradeNo
}

export interface RefundParams {
  tradeNo: string // 支付宝交易号
  refundAmountCents: number // 退款金额（分）
  refundReason?: string
}

/**
 * 支付宝退款
 */
export async function refundTrade(params: RefundParams): Promise<void> {
  if (!alipayClient) {
    throw Errors.internal('支付宝未配置')
  }

  const amountYuan = (params.refundAmountCents / 100).toFixed(2)

  const result = await alipayClient.exec('alipay.trade.refund', {
    bizContent: {
      trade_no: params.tradeNo,
      refund_amount: amountYuan,
      refund_reason: params.refundReason || '押金退还',
    },
  })

  if (result.code !== '10000') {
    throw Errors.internal(`支付宝退款失败: ${result.subMsg || result.msg}`)
  }

  console.log(`[Alipay] 退款成功: tradeNo=${params.tradeNo}, amount=${amountYuan}`)
}

/**
 * 验证支付宝异步通知签名
 */
export function verifyAlipayNotify(params: Record<string, string>): boolean {
  if (!alipayClient) return false
  try {
    return alipayClient.checkNotifySign(params)
  } catch {
    return false
  }
}
