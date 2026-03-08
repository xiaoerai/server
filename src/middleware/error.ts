import { Request, Response, NextFunction } from 'express'

const isDev = process.env.NODE_ENV !== 'production'

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message)
    this.name = 'AppError'
    Error.captureStackTrace(this, this.constructor)
  }
}

// 常用错误快捷方法
export const Errors = {
  badRequest: (message = '请求参数错误') => new AppError(400, message, 'BAD_REQUEST'),
  unauthorized: (message = '未登录') => new AppError(401, message, 'UNAUTHORIZED'),
  forbidden: (message = '无权限') => new AppError(403, message, 'FORBIDDEN'),
  notFound: (message = '资源不存在') => new AppError(404, message, 'NOT_FOUND'),
  conflict: (message = '资源冲突') => new AppError(409, message, 'CONFLICT'),
  internal: (message = '服务器内部错误') => new AppError(500, message, 'INTERNAL_ERROR'),
}

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  const requestId = (req as any).requestId || 'unknown'
  const timestamp = new Date().toISOString()

  // 详细错误日志
  console.error('\n========== ERROR ==========')
  console.error(`Time: ${timestamp}`)
  console.error(`RequestId: ${requestId}`)
  console.error(`${req.method} ${req.path}`)
  console.error(`Error: ${err.message}`)

  if (isDev && err.stack) {
    console.error(`Stack:\n${err.stack}`)
  }

  console.error('===========================\n')

  // 响应处理
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code || err.statusCode,
        message: err.message,
        ...(isDev && { requestId }),
      },
    })
  }

  // 未知错误
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: isDev ? err.message : '服务器内部错误',
      ...(isDev && { requestId, stack: err.stack }),
    },
  })
}

// 全局未捕获异常处理
export function setupGlobalErrorHandlers() {
  process.on('uncaughtException', (err) => {
    console.error('\n========== UNCAUGHT EXCEPTION ==========')
    console.error(`Time: ${new Date().toISOString()}`)
    console.error(`Error: ${err.message}`)
    console.error(`Stack:\n${err.stack}`)
    console.error('=========================================\n')
    process.exit(1)
  })

  process.on('unhandledRejection', (reason, promise) => {
    console.error('\n========== UNHANDLED REJECTION ==========')
    console.error(`Time: ${new Date().toISOString()}`)
    console.error('Promise:', promise)
    console.error('Reason:', reason)
    console.error('==========================================\n')
  })
}
