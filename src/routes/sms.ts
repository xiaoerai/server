import express from 'express'
import { validate } from '../middleware/validate'
import { SendSmsSchema } from '../schemas/sms'
import { sendSms } from '../controllers/sms.controller'

const router = express.Router()

router.post('/send', validate(SendSmsSchema), sendSms)

export default router
