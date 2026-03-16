import 'dotenv/config'
import tcb from '@cloudbase/node-sdk'

const app = tcb.init({
  env: process.env.TCB_ENV_ID!,
  secretId: process.env.TCB_SECRET_ID,
  secretKey: process.env.TCB_SECRET_KEY,
})

const db = app.database()

async function initCollections() {
  const collections = ['sms_codes', 'users', 'orders', 'guests', 'rooms']

  for (const name of collections) {
    try {
      await db.createCollection(name)
      console.log(`✅ 创建集合: ${name}`)
    } catch (err: any) {
      console.log(`⏭️  ${name}: ${err.message || err}`)
    }
  }

  console.log('\n初始化完成!')
  process.exit(0)
}

initCollections()
