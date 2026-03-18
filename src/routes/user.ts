import express from 'express'
import { getMyGuests } from '../controllers/user.controller'

const router = express.Router()

// GET /api/user/guests - 获取历史住客
router.get('/guests', getMyGuests)

export default router
