import express from 'express'
import { login, getDeposits, getCheckins } from '../controllers/admin.controller'
import { auth, adminOnly } from '../middleware/auth'

const router = express.Router()

// POST /api/admin/login - 管理员登录（不需要 auth）
router.post('/login', login)

// GET /api/admin/deposits - 押金列表（需要管理员权限）
router.get('/deposits', auth, adminOnly, getDeposits)

// GET /api/admin/checkins - 入住记录列表（需要管理员权限）
router.get('/checkins', auth, adminOnly, getCheckins)

export default router
