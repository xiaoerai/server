import express from 'express'
import { getMyGuests, removeMyGuest } from '../controllers/user.controller'

const router = express.Router()

// GET /api/user/guests - 获取历史住客
router.get('/guests', getMyGuests)

// DELETE /api/user/guests - 解除住客关联
router.delete('/guests', removeMyGuest)

export default router
