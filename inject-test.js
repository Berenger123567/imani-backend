import 'dotenv/config'
import mongoose from 'mongoose'
import Order from './models/Order.js'

const TEST_ORDER = {
  name: "Test Client",
  email: "test@example.com",
  phone: "+33 6 99 88 77 66",
  destination: "Dubai, Emirats Arabes",
  date: "2026-06-15",
  budget: "2000€",
  duration: "8 jours",
  composition: "Couple",
  climate: "Chaud",
  travel_style: "Luxe & Aventure",
  activities: ["Safari désert", "Shopping", "Plage"],
  accommodation: "Hôtel 5★",
  food: "Sans préférence",
  feelings: "Inoubliable, magique",
  message: "Commande test injectée manuellement",
  status: "new",
}

async function injectTest() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    const order = await Order.create(TEST_ORDER)
    console.log('Test order created:', order._id)
    console.log('Name:', order.name)
    console.log('Destination:', order.destination)
    console.log('Status:', order.status)
  } catch (err) {
    console.error('Error:', err.message)
  } finally {
    await mongoose.disconnect()
    process.exit(0)
  }
}

injectTest()
