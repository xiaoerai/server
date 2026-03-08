import 'dotenv/config'
import app from './app'
import { setupGlobalErrorHandlers } from './middleware/error'

// 全局未捕获异常处理
setupGlobalErrorHandlers()

const PORT = process.env.PORT || 7001

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
