import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  age: { type: String, default: '' },
  english: { type: String, default: '' },
  destination: { type: String, default: 'À définir' },
  date: { type: String, default: '' },
  budget: { type: String, default: '' },
  duration: { type: String, default: '' },
  composition: { type: String, default: '' },
  climate: { type: String, default: '' },
  travel_style: { type: String, default: '' },
  activities: [{ type: String }],
  accommodation: { type: String, default: '' },
  food: { type: String, default: '' },
  feelings: { type: String, default: '' },
  status: {
    type: String,
    enum: ['new', 'progress', 'sent', 'done'],
    default: 'new',
  },
  message: { type: String, default: '' },
  replies: [{
    message: String,
    pdfPath: String,
    createdAt: { type: Date, default: Date.now },
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

orderSchema.pre('save', function (next) {
  this.updatedAt = new Date()
  next()
})

export default mongoose.model('Order', orderSchema)
