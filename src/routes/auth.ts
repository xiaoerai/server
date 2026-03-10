import express from 'express'
import { validate } from '../middleware/validate'
import { LoginSchema } from '../schemas/auth'
import { login } from '../controllers/auth.controller'

const router = express.Router()

router.post('/login', validate(LoginSchema), login)

export default router
