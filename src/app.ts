import express, { Express } from 'express'
import cors from 'cors'
import { errorHandler } from './middleware/error'
import { logger } from './middleware/logger'
import routes from './routes'

const app: Express = express()

// 中间件
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(logger)

// 路由
app.use('/api', routes)

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 错误处理
app.use(errorHandler)

export default app
