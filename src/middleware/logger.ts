import { Request, Response, NextFunction } from 'express'

const isDev = process.env.NODE_ENV !== 'production'

// 生成请求ID
function generateRequestId() {
  return Math.random().toString(36).substring(2, 10)
}

// 格式化时间
function formatTime() {
  return new Date().toISOString()
}

export function logger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now()
  const requestId = generateRequestId()

  // 挂载到 req 上，方便后续使用
  ;(req as any).requestId = requestId

  // 请求开始日志
  if (isDev) {
    console.log(`\n[${formatTime()}] --> ${req.method} ${req.path}`)
    if (req.query && Object.keys(req.query).length > 0) {
      console.log(`  Query: ${JSON.stringify(req.query)}`)
    }
    if (req.body && Object.keys(req.body).length > 0) {
      console.log(`  Body: ${JSON.stringify(req.body)}`)
    }
  }

  // 响应完成日志
  res.on('finish', () => {
    const duration = Date.now() - start
    const status = res.statusCode
    const statusIcon = status >= 400 ? '✗' : '✓'

    if (isDev) {
      console.log(`[${formatTime()}] <-- ${statusIcon} ${status} ${duration}ms`)
    } else {
      // 生产环境：单行日志，便于日志采集
      console.log(
        JSON.stringify({
          time: formatTime(),
          requestId,
          method: req.method,
          path: req.path,
          status,
          duration,
        })
      )
    }
  })

  next()
}
