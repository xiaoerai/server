import { z } from 'zod'

// 发送验证码请求参数
export const SendSmsSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, '手机号格式不正确'),
})

export type SendSmsInput = z.infer<typeof SendSmsSchema>
