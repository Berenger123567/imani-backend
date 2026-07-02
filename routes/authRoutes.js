import { Router } from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = Router()

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' })
    }

    const validPassword = await user.comparePassword(password)
    if (!validPassword) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' })
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({ token, email: user.email })
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

router.get('/verify', authMiddleware, (req, res) => {
  res.json({ valid: true, admin: req.admin })
})

router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    const user = await User.findById(req.admin.id)
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable' })
    }

    const validPassword = await user.comparePassword(currentPassword)
    if (!validPassword) {
      return res.status(400).json({ error: 'Mot de passe actuel incorrect' })
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Le nouveau mot de passe doit contenir au moins 6 caractères' })
    }

    user.password = newPassword
    await user.save()

    res.json({ success: true, message: 'Mot de passe modifié avec succès' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/update-email', authMiddleware, async (req, res) => {
  try {
    const { email } = req.body

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Email invalide' })
    }

    const user = await User.findById(req.admin.id)
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable' })
    }

    user.email = email
    await user.save()

    res.json({ success: true, message: 'Email modifié avec succès', email })
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' })
    }
    res.status(500).json({ error: err.message })
  }
})

export default router
