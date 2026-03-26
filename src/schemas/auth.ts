import { z } from 'zod'

// 登录请求参数
export const LoginSchema = z.object({
  code: z.string().min(1, '授权码不能为空'),
  phone: z.string().regex(/^1[3-9]\d{9}$/, '手机号格式不正确'),
  smsCode: z.string().length(6, '验证码为6位数字'),
  platform: z.enum(['alipay', 'wechat', 'h5']).default('h5'),
})

export type LoginInput = z.infer<typeof LoginSchema>
