// 微信小程序登录接口

interface Code2SessionResponse {
  openid?: string
  session_key?: string
  unionid?: string
  errcode?: number
  errmsg?: string
}

/**
 * 用 wx.login 获取的 code 换取 openid
 * 文档: https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/user-login/code2Session.html
 */
export async function code2Session(code: string): Promise<string> {
  const { WECHAT_APPID, WECHAT_APP_SECRET } = process.env

  // 未配置微信 AppID：直接用前端传来的 code 作为 openid
  if (!WECHAT_APPID || !WECHAT_APP_SECRET) {
    console.log(`[WeChat] 开发模式，openid: ${code}`)
    return code
  }

  const url = new URL('https://api.weixin.qq.com/sns/jscode2session')
  url.searchParams.set('appid', WECHAT_APPID)
  url.searchParams.set('secret', WECHAT_APP_SECRET)
  url.searchParams.set('js_code', code)
  url.searchParams.set('grant_type', 'authorization_code')

  const response = await fetch(url.toString())
  const data = (await response.json()) as Code2SessionResponse

  if (data.errcode) {
    console.error('[WeChat] code2Session 失败:', data.errcode, data.errmsg)
    throw new Error(`微信登录失败: ${data.errmsg || '未知错误'}`)
  }

  if (!data.openid) {
    throw new Error('微信登录失败: 未获取到 openid')
  }

  return data.openid
}
