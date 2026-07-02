import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import path from 'path'
import { fileURLToPath } from 'url'
import { connectDB } from './config/db.js'
import User from './models/User.js'
import authRoutes from './routes/authRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import statsRoutes from './routes/statsRoutes.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

app.set('trust proxy', 1)

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean)

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}))
app.use(helmet())
app.use(express.json())

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Trop de requÃªtes, rÃ©essayez plus tard.',
})
app.use('/api', limiter)

app.use('/uploads', express.static(path.resolve(__dirname, 'uploads')))

app.use('/api/auth', authRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/stats', statsRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.get('/api/health/email', async (req, res) => {
  try {
    const sgMail = (await import('@sendgrid/mail')).default
    if (process.env.SENDGRID_API_KEY) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY)
      res.json({
        status: 'ok', email: 'configured',
        sendgrid: !!process.env.SENDGRID_API_KEY,
        to: process.env.EMAIL_TO || process.env.EMAIL_USER,
      })
    } else {
      res.status(503).json({ status: 'error', email: 'not_configured', message: 'SENDGRID_API_KEY missing' })
    }
  } catch (err) {
    res.status(503).json({ status: 'error', email: 'error', message: err.message })
  }
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({ error: err.message || 'Erreur serveur' })
})

async function createDefaultAdmin() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@imani.com'
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
    const existing = await User.findOne({ email: adminEmail.toLowerCase() })
    if (!existing) {
      await User.create({ email: adminEmail, password: adminPassword })
      console.log('Admin user created')
    } else {
      console.log('Admin user already exists')
    }
  } catch (err) {
    console.error('Failed to create admin user:', err.message)
  }
}

async function start() {
  await connectDB()
  await createDefaultAdmin()
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
}

start()
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});
