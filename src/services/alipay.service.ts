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

export interface CreateAppPayOrderParams {
  outTradeNo: string
  subject: string
  totalAmountCents: number
  body?: string
}

export async function createAppPayOrder(params: CreateAppPayOrderParams): Promise<string> {
  if (!alipayClient) {
    throw Errors.internal('支付宝支付未配置')
  }

  const amountYuan = (params.totalAmountCents / 100).toFixed(2)

  const bizParams = {
    bizContent: {
      out_trade_no: params.outTradeNo,
      total_amount: amountYuan,
      subject: params.subject,
      product_code: 'QUICK_MSECURITY_PAY',
      ...(params.body ? { body: params.body } : {}),
    },
    ...(ALIPAY_NOTIFY_URL ? { notifyUrl: ALIPAY_NOTIFY_URL } : {}),
  }

  return alipayClient.sdkExecute('alipay.trade.app.pay', bizParams)
}
