import { Router } from 'express'
import Order from '../models/Order.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = Router()

router.get('/', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 })
    const total = orders.length
    const newOrders = orders.filter(o => o.status === 'new').length
    const progressOrders = orders.filter(o => o.status === 'progress').length
    const sentOrders = orders.filter(o => o.status === 'sent').length
    const doneOrders = orders.filter(o => o.status === 'done').length

    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const monthOrders = orders.filter(o => new Date(o.createdAt) >= monthStart).length
    const lastMonthOrders = orders.filter(o => {
      const d = new Date(o.createdAt)
      return d >= lastMonthStart && d < monthStart
    }).length

    const compositionCounts = {}
    orders.forEach(o => {
      if (o.composition) compositionCounts[o.composition] = (compositionCounts[o.composition] || 0) + 1
    })

    const recent = orders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)

    const dayLabels = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
    const weekData = [0, 0, 0, 0, 0, 0, 0]
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(now.getDate() - 6)
    sevenDaysAgo.setHours(0, 0, 0, 0)

    orders.forEach(o => {
      const d = new Date(o.createdAt)
      if (d >= sevenDaysAgo) {
        weekData[d.getDay()]++
      }
    })

    const weeklyData = []
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - (i * 7))
      weekStart.setHours(0, 0, 0, 0)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 7)

      const count = orders.filter(o => {
        const d = new Date(o.createdAt)
        return d >= weekStart && d < weekEnd
      }).length
      weeklyData.push(count)
    }

    const lastMonthProgress = orders.filter(o => {
      const d = new Date(o.createdAt)
      return d >= lastMonthStart && d < monthStart && o.status === 'progress'
    }).length

    const lastMonthSent = orders.filter(o => {
      const d = new Date(o.createdAt)
      return d >= lastMonthStart && d < monthStart && o.status === 'sent'
    }).length

    const monthProgress = orders.filter(o => {
      const d = new Date(o.createdAt)
      return d >= monthStart && o.status === 'progress'
    }).length

    const monthSent = orders.filter(o => {
      const d = new Date(o.createdAt)
      return d >= monthStart && o.status === 'sent'
    }).length

    const calcTrend = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return Math.round(((current - previous) / previous) * 100)
    }

    const trends = {
      total: calcTrend(monthOrders, lastMonthOrders),
      progress: calcTrend(monthProgress, lastMonthProgress),
      sent: calcTrend(monthSent, lastMonthSent),
      month: calcTrend(monthOrders, lastMonthOrders),
    }

    res.json({
      kpi: {
        total,
        progress: progressOrders,
        sent: sentOrders,
        month: monthOrders,
      },
      trends,
      statusCounts: {
        new: newOrders,
        progress: progressOrders,
        sent: sentOrders,
        done: doneOrders,
      },
      composition: compositionCounts,
      weeklyOrders: weekData,
      weeklyLabels: dayLabels,
      trendData: weeklyData,
      recent: recent.map(o => ({
        id: o._id,
        name: o.name,
        email: o.email,
        destination: o.destination,
        date: o.date,
        status: o.status,
      })),
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
