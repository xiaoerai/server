// 阿里云短信服务
// TODO: 安装 @alicloud/dysmsapi20170525 依赖后启用

// 生成 6 位随机验证码
export function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// 发送短信验证码
export async function sendSmsCode(phone: string, code: string): Promise<boolean> {
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
