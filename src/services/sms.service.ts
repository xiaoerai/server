import { saveSmsCode, canSendSmsCode } from './db'
import { generateCode, sendSmsCode } from './sms'

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
