import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import path from 'path'
import { fileURLToPath } from 'url'
import { connectDB } from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import statsRoutes from './routes/statsRoutes.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

connectDB()

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
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
    const { default: nodemailer } = await import('nodemailer')

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
    })

    await transporter.verify()
    res.json({ status: 'ok', email: 'connected', user: process.env.EMAIL_USER })
  } catch (err) {
    res.status(503).json({ status: 'error', email: 'disconnected', message: err.message })
  }
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({ error: err.message || 'Erreur serveur' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});
