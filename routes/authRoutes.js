import { Router } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = Router()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let hashedPassword = null
let adminEmail = process.env.ADMIN_EMAIL || 'admin@imani.com'

async function getHashedPassword() {
  if (!hashedPassword) {
    hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10)
  }
  return hashedPassword
}

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    const validEmail = email === adminEmail
    const storedHash = await getHashedPassword()
    const validPassword = await bcrypt.compare(password, storedHash)

    if (!validEmail || !validPassword) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' })
    }

    const token = jwt.sign(
      { id: 'admin', email: adminEmail },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({ token, email: adminEmail })
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

    const storedHash = await getHashedPassword()
    const validPassword = await bcrypt.compare(currentPassword, storedHash)
    if (!validPassword) {
      return res.status(400).json({ error: 'Mot de passe actuel incorrect' })
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Le nouveau mot de passe doit contenir au moins 6 caractères' })
    }

    hashedPassword = await bcrypt.hash(newPassword, 10)

    const envPath = path.resolve(__dirname, '../.env')
    try {
      let envContent = fs.readFileSync(envPath, 'utf8')
      envContent = envContent.replace(
        /ADMIN_PASSWORD=.*/,
        `ADMIN_PASSWORD=${newPassword}`
      )
      fs.writeFileSync(envPath, envContent, 'utf8')
      console.log('✅ Mot de passe mis à jour dans .env')
    } catch {
      console.warn('⚠️ Impossible de mettre à jour le fichier .env')
    }

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

    adminEmail = email

    const envPath = path.resolve(__dirname, '../.env')
    try {
      let envContent = fs.readFileSync(envPath, 'utf8')
      if (envContent.includes('ADMIN_EMAIL=')) {
        envContent = envContent.replace(/ADMIN_EMAIL=.*/, `ADMIN_EMAIL=${email}`)
      } else {
        envContent += `\nADMIN_EMAIL=${email}`
      }
      fs.writeFileSync(envPath, envContent, 'utf8')
      console.log('✅ Email mis à jour dans .env')
    } catch {
      console.warn('⚠️ Impossible de mettre à jour le fichier .env')
    }

    res.json({ success: true, message: 'Email modifié avec succès', email })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
