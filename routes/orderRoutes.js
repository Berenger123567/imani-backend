import { Router } from 'express'
import Order from '../models/Order.js'
import { authMiddleware } from '../middleware/authMiddleware.js'
import { upload } from '../middleware/upload.js'
import { sendNewOrderNotification, sendReplyToClient } from '../services/emailService.js'

const router = Router()

router.post('/', async (req, res) => {
  try {
    const order = await Order.create(req.body)
    // Envoyer la notification par email (en arrière-plan, sans bloquer la réponse)
    sendNewOrderNotification(order).catch(err =>
      console.error('Email notification failed:', err.message)
    )
    res.status(201).json(order)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, search, sort } = req.query
    let query = {}

    if (status && status !== 'all') {
      query.status = status
    }
    if (search) {
      const re = new RegExp(search, 'i')
      query.$or = [
        { name: re },
        { email: re },
        { destination: re },
      ]
    }

    const sortField = sort === 'date' ? 'date' : 'createdAt'
    const orders = await Order.find(query).sort({ [sortField]: -1 })
    res.json(orders)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ error: 'Commande introuvable' })
    res.json(order)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body
    if (!['new', 'progress', 'sent', 'done'].includes(status)) {
      return res.status(400).json({ error: 'Statut invalide' })
    }
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
    if (!order) return res.status(404).json({ error: 'Commande introuvable' })
    res.json(order)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/:id/reply', authMiddleware, upload.single('pdf'), async (req, res) => {
  try {
    const { message } = req.body
    const pdfPath = req.file ? `/uploads/${req.file.filename}` : null

    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ error: 'Commande introuvable' })

    order.replies.push({ message, pdfPath })

    if (order.status === 'new' || order.status === 'progress') {
      order.status = 'sent'
    }

    await order.save()

    sendReplyToClient(order, message, pdfPath).catch(err =>
      console.error('Reply email failed:', err.message)
    )

    res.json(order)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
