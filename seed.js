import 'dotenv/config'
import mongoose from 'mongoose'
import Order from './models/Order.js'

const DEMO_ORDERS = [
  { id: 1, name: "Amina Diallo", email: "amina.diallo@gmail.com", phone: "+33 6 78 45 12 90", destination: "Santorin, Grèce", date: "2026-04-28", budget: "1500€", duration: "7 jours", composition: "Couple", climate: "Tropical", travel_style: "Culture & Relaxation", activities: ["Visites historiques", "Coucher de soleil", "Gastronomie"], accommodation: "Hôtel 4 étoiles avec vue mer", food: "Végétarien", feelings: "Romantique, paisible", status: "new", message: "" },
  { id: 2, name: "Karim Benali", email: "karim.b@outlook.com", phone: "+33 6 23 89 45 67", destination: "Marrakech, Maroc", date: "2026-04-25", budget: "800€", duration: "5 jours", composition: "Solo", climate: "Chaud", travel_style: "Aventure & Culture", activities: ["Souks", "Désert", "Randonnée Atlas"], accommodation: "Riad traditionnel", food: "Halal", feelings: "Exploration, émerveillement", status: "progress", message: "" },
  { id: 3, name: "Sophie & Marc Laurent", email: "sophie.laurent@mail.com", phone: "+33 6 91 34 78 12", destination: "Bali, Indonésie", date: "2026-04-20", budget: "3000€", duration: "14 jours", composition: "Couple", climate: "Tropical", travel_style: "Luxe & Nature", activities: ["Temples", "Rizières", "Plages secrètes", "Spa"], accommodation: "Villa privée avec piscine", food: "Sans préférence", feelings: "Lune de miel, magique", status: "sent", message: "Carnet envoyé le 22/04" },
  { id: 4, name: "Fatou Ndiaye", email: "fatou.ndiaye@yahoo.fr", phone: "+33 6 45 67 89 01", destination: "Dakar, Sénégal", date: "2026-04-18", budget: "1200€", duration: "10 jours", composition: "Famille", climate: "Chaud", travel_style: "Retour aux sources", activities: ["Île de Gorée", "Lac Rose", "Marchés locaux"], accommodation: "Appartement familial", food: "Cuisine locale", feelings: "Nostalgie, retrouvailles", status: "done", message: "Voyage terminé - feedback positif" },
  { id: 5, name: "Lucas & Thomas Petit", email: "lucas.petit@gmail.com", phone: "+33 6 12 34 56 78", destination: "Tokyo, Japon", date: "2026-05-01", budget: "2500€", duration: "12 jours", composition: "Amis", climate: "Tempéré", travel_style: "Culture & Fun", activities: ["Temples", "Street food", "Akihabara", "Mont Fuji"], accommodation: "Hôtels capsules + ryokan", food: "Tout goûter !", feelings: "Aventure entre potes", status: "new", message: "" },
  { id: 6, name: "Aïcha Moussa", email: "aicha.m@hotmail.fr", phone: "+33 6 56 78 90 12", destination: "Le Caire, Égypte", date: "2026-04-27", budget: "1000€", duration: "6 jours", composition: "Solo", climate: "Chaud", travel_style: "Histoire & Mystère", activities: ["Pyramides", "Musée", "Croisière Nil"], accommodation: "Hôtel proche du Caire", food: "Halal", feelings: "Rêve d'enfance", status: "progress", message: "" },
  { id: 7, name: "Julie Moreau", email: "julie.moreau@gmail.com", phone: "+33 6 89 01 23 45", destination: "Maldives", date: "2026-05-03", budget: "4000€", duration: "8 jours", composition: "Couple", climate: "Tropical", travel_style: "Luxe & Farniente", activities: ["Plongée", "Spa", "Coucher de soleil en bateau"], accommodation: "Overwater bungalow", food: "Fruits de mer", feelings: "Anniversaire de mariage", status: "new", message: "" },
  { id: 8, name: "Ibrahim & Famille Koné", email: "ibrahim.kone@mail.com", phone: "+33 6 34 56 78 90", destination: "Istanbul, Turquie", date: "2026-04-22", budget: "1800€", duration: "8 jours", composition: "Famille", climate: "Tempéré", travel_style: "Culture & Découverte", activities: ["Sainte-Sophie", "Grand Bazar", "Bosphore"], accommodation: "Appartement familial centre-ville", food: "Cuisine turque", feelings: "Découverte en famille", status: "sent", message: "Carnet envoyé le 24/04" },
  { id: 9, name: "Emma & Sarah Dubois", email: "emma.dubois@outlook.fr", phone: "+33 6 67 89 01 23", destination: "Lisbonne, Portugal", date: "2026-04-26", budget: "900€", duration: "5 jours", composition: "Amis", climate: "Doux", travel_style: "City trip & Fun", activities: ["Tramway 28", "Pastéis de Nata", "Fado", "Plage"], accommodation: "Airbnb centre historique", food: "Gastronomie portugaise", feelings: "Week-end entre filles", status: "progress", message: "" },
  { id: 10, name: "Moussa Traoré", email: "moussa.traore@gmail.com", phone: "+33 6 78 90 12 34", destination: "Zanzibar, Tanzanie", date: "2026-05-05", budget: "2000€", duration: "10 jours", composition: "Couple", climate: "Tropical", travel_style: "Plage & Nature", activities: ["Stone Town", "Snorkeling", "Épices", "Safari"], accommodation: "Lodge en bord de mer", food: "Fruits de mer & tropical", feelings: "Évasion totale", status: "new", message: "" },
  { id: 11, name: "Clara Fontaine", email: "clara.fontaine@mail.com", phone: "+33 6 90 12 34 56", destination: "New York, USA", date: "2026-04-15", budget: "2200€", duration: "7 jours", composition: "Solo", climate: "Tempéré", travel_style: "City trip & Shopping", activities: ["Central Park", "Broadway", "Statue Liberté", "Times Square"], accommodation: "Hotel Manhattan", food: "Street food & restaurants", feelings: "Premier voyage solo", status: "done", message: "Voyage terminé - super retour" },
  { id: 12, name: "Omar & Leïla Hassan", email: "omar.hassan@gmail.com", phone: "+33 6 01 23 45 67", destination: "Cancún, Mexique", date: "2026-05-08", budget: "2800€", duration: "9 jours", composition: "Couple", climate: "Tropical", travel_style: "All inclusive & Aventure", activities: ["Cenotes", "Chichén Itzá", "Plage", "Plongée"], accommodation: "Resort all inclusive", food: "All inclusive", feelings: "Lune de miel reportée", status: "new", message: "" },
]

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    const count = await Order.countDocuments()
    if (count > 0) {
      console.log(`Database already has ${count} orders. Skipping seed.`)
    } else {
      const cleanOrders = DEMO_ORDERS.map(({ id, ...rest }) => rest)
      await Order.insertMany(cleanOrders)
      console.log(`Seeded ${cleanOrders.length} demo orders.`)
    }
  } catch (err) {
    console.error('Seed error:', err.message)
  } finally {
    await mongoose.disconnect()
    process.exit(0)
  }
}

seed()
