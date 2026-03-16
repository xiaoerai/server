import { saveSmsCode, canSendSmsCode } from '../db'

// 生成 6 位随机验证码
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// 发送短信验证码（阿里云）
async function sendSmsCode(phone: string, code: string): Promise<boolean> {
  // 开发阶段：直接打印验证码，不真正发送
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[SMS] 验证码 ${code} 发送至 ${phone}`)
    return true
  }

  // TODO: 生产环境调用阿里云短信 API
  // const { ALIYUN_ACCESS_KEY_ID, ALIYUN_ACCESS_KEY_SECRET, ALIYUN_SMS_SIGN_NAME, ALIYUN_SMS_TEMPLATE_CODE } = process.env
  //
  // const client = new Dysmsapi20170525({
  //   accessKeyId: ALIYUN_ACCESS_KEY_ID,
  //   accessKeySecret: ALIYUN_ACCESS_KEY_SECRET,
  //   endpoint: 'dysmsapi.aliyuncs.com',
  // })
  //
  // const response = await client.sendSms({
  //   phoneNumbers: phone,
  //   signName: ALIYUN_SMS_SIGN_NAME,
  //   templateCode: ALIYUN_SMS_TEMPLATE_CODE,
  //   templateParam: JSON.stringify({ code }),
  // })
  //
  // return response.body.code === 'OK'

  console.log(`[SMS] 验证码 ${code} 发送至 ${phone}`)
  return true
}

// 发送验证码（业务逻辑）
export async function sendVerificationCode(phone: string): Promise<void> {
  // 检查发送频率
  const canSend = await canSendSmsCode(phone)
  if (!canSend) {
    throw new Error('发送太频繁，请稍后再试')
  }

  // 生成验证码
  const code = generateCode()

  // 保存到数据库
  await saveSmsCode(phone, code)

  // 发送短信
  const sent = await sendSmsCode(phone, code)
  if (!sent) {
    throw new Error('短信发送失败')
  }
}
