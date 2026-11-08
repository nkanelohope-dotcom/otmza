// backend/seed-pricing.js
const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'database.json');

let db = { services: [], pricing: [], gallery: [], settings: {} };
if (fs.existsSync(DB_FILE)) {
  db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

// Map the old static tabs to our new categories
const pricingData = [
  // --- STANDARD CLEANING ---
  { category: 'standard', service: 'Standard Apartment Cleaning', label: 'Bachelor / Studio – 1 Bedroom', price: 300, unit: 'per clean' },
  { category: 'standard', service: 'Standard Apartment Cleaning', label: '2 Bedroom Apartment', price: 350, unit: 'per clean' },
  { category: 'standard', service: 'Standard Apartment Cleaning', label: '3 Bedroom Apartment', price: 450, unit: 'per clean' },
  { category: 'standard', service: 'Standard House Cleaning', label: '2 Bedroom House', price: 450, unit: 'per clean' },
  { category: 'standard', service: 'Standard House Cleaning', label: '3 Bedroom House', price: 550, unit: 'per clean' },
  { category: 'standard', service: 'Standard House Cleaning', label: '4 Bedroom House', price: 700, unit: 'per clean' },
  { category: 'standard', service: 'Standard House Cleaning', label: '5 Bedroom House', price: 900, unit: 'per clean' },

  // --- SPRING CLEANING ---
  { category: 'spring', service: 'Apartment Spring Cleaning', label: 'Bachelor / Studio – 1 Bedroom', price: 600, unit: 'per clean' },
  { category: 'spring', service: 'Apartment Spring Cleaning', label: '2 Bedroom Apartment', price: 700, unit: 'per clean' },
  { category: 'spring', service: 'Apartment Spring Cleaning', label: '3 Bedroom Apartment', price: 900, unit: 'per clean' },

  // --- DEEP CLEANING ---
  { category: 'deep', service: 'Apartment Deep Cleaning', label: 'Bachelor / Studio – 1 Bedroom', price: 1500, unit: 'per clean' },
  { category: 'deep', service: 'Apartment Deep Cleaning', label: '2 Bedroom Apartment', price: 2000, unit: 'per clean' },
  { category: 'deep', service: 'Apartment Deep Cleaning', label: '3 Bedroom Apartment', price: 2500, unit: 'per clean' },
  { category: 'deep', service: 'House Deep Cleaning (Occupied)', label: '2 Bedroom House', price: 3300, unit: 'per clean' },
  { category: 'deep', service: 'House Deep Cleaning (Occupied)', label: '3 Bedroom House', price: 3900, unit: 'per clean' },
  { category: 'deep', service: 'House Deep Cleaning (Occupied)', label: '4 Bedroom House', price: 4500, unit: 'per clean' },
  { category: 'deep', service: 'House Deep Cleaning (Occupied)', label: '5 Bedroom House', price: 5100, unit: 'per clean' },

  // --- EMPTY / MOVE-OUT ---
  { category: 'moveout', service: 'Empty Apartment Deep Cleaning', label: 'Bachelor / Studio – 1 Bedroom', price: 1100, unit: 'per clean' },
  { category: 'moveout', service: 'Empty Apartment Deep Cleaning', label: '2 Bedroom Apartment', price: 1300, unit: 'per clean' },
  { category: 'moveout', service: 'Empty Apartment Deep Cleaning', label: '3 Bedroom Apartment', price: 1500, unit: 'per clean' },
  { category: 'moveout', service: 'Empty House Deep Cleaning', label: '2 Bedroom House', price: 2200, unit: 'per clean' },
  { category: 'moveout', service: 'Empty House Deep Cleaning', label: '3 Bedroom House', price: 3200, unit: 'per clean' },
  { category: 'moveout', service: 'Empty House Deep Cleaning', label: '4 Bedroom House', price: 4200, unit: 'per clean' },
  { category: 'moveout', service: 'Empty House Deep Cleaning', label: '5 Bedroom House', price: 5200, unit: 'per clean' },

  // --- WEEKLY MAID ---
  { category: 'weekly', service: 'Weekly Maid (Incl. Laundry & Ironing)', label: 'Bachelor / Studio – 1 Bedroom', price: 350, unit: 'per week' },
  { category: 'weekly', service: 'Weekly Maid (Incl. Laundry & Ironing)', label: '2 Bedroom Apartment', price: 400, unit: 'per week' },
  { category: 'weekly', service: 'Weekly Maid (Incl. Laundry & Ironing)', label: '3 Bedroom Apartment', price: 450, unit: 'per week' },
  { category: 'weekly', service: 'Cleaning Only (Once a Week)', label: 'Bachelor / Studio – 1 Bedroom', price: 250, unit: 'per week' },
  { category: 'weekly', service: 'Cleaning Only (Once a Week)', label: '2 Bedroom Apartment', price: 300, unit: 'per week' },
  { category: 'weekly', service: 'Cleaning Only (Once a Week)', label: '3 Bedroom Apartment', price: 350, unit: 'per week' },

  // --- UPHOLSTERY ---
  { category: 'upholstery', service: 'Rugs & Carpet Deep Cleaning', label: 'Extra Small Rug', price: 250, unit: 'per item' },
  { category: 'upholstery', service: 'Rugs & Carpet Deep Cleaning', label: 'Small Rug', price: 300, unit: 'per item' },
  { category: 'upholstery', service: 'Rugs & Carpet Deep Cleaning', label: 'Medium Rug', price: 350, unit: 'per item' },
  { category: 'upholstery', service: 'Rugs & Carpet Deep Cleaning', label: 'Large Rug', price: 400, unit: 'per item' },
  { category: 'upholstery', service: 'Rugs & Carpet Deep Cleaning', label: 'XLarge Rug', price: 450, unit: 'per item' },
  { category: 'upholstery', service: 'Rugs & Carpet Deep Cleaning', label: 'Fitted Carpet – Standard Room', price: 500, unit: 'per item' },
  { category: 'upholstery', service: 'Couch Deep Cleaning', label: '1 Seater', price: 250, unit: 'per item' },
  { category: 'upholstery', service: 'Couch Deep Cleaning', label: '2 Seater', price: 450, unit: 'per item' },
  { category: 'upholstery', service: 'Couch Deep Cleaning', label: '3 Seater', price: 550, unit: 'per item' },
  { category: 'upholstery', service: 'Couch Deep Cleaning', label: '4 Seater', price: 650, unit: 'per item' },
  { category: 'upholstery', service: 'Couch Deep Cleaning', label: '5 Seater', price: 700, unit: 'per item' },
  { category: 'upholstery', service: 'Couch Deep Cleaning', label: '6 Seater', price: 800, unit: 'per item' },
  { category: 'upholstery', service: 'L-Couch Deep Cleaning', label: '3 Seater', price: 600, unit: 'per item' },
  { category: 'upholstery', service: 'L-Couch Deep Cleaning', label: '4 Seater', price: 700, unit: 'per item' },
  { category: 'upholstery', service: 'L-Couch Deep Cleaning', label: '5 Seater', price: 800, unit: 'per item' },
  { category: 'upholstery', service: 'L-Couch Deep Cleaning', label: '6 Seater', price: 900, unit: 'per item' },
  { category: 'upholstery', service: 'Mattress Deep Cleaning', label: 'Single Bed', price: 350, unit: 'per item' },
  { category: 'upholstery', service: 'Mattress Deep Cleaning', label: 'Double Bed', price: 500, unit: 'per item' },
  { category: 'upholstery', service: 'Mattress Deep Cleaning', label: 'Queen Bed', price: 550, unit: 'per item' },
  { category: 'upholstery', service: 'Mattress Deep Cleaning', label: 'King Bed', price: 600, unit: 'per item' },
  { category: 'upholstery', service: 'Sleigh Bed Deep Cleaning', label: 'Single', price: 400, unit: 'per item' },
  { category: 'upholstery', service: 'Sleigh Bed Deep Cleaning', label: 'Double', price: 450, unit: 'per item' },
  { category: 'upholstery', service: 'Sleigh Bed Deep Cleaning', label: 'Queen', price: 500, unit: 'per item' },
  { category: 'upholstery', service: 'Sleigh Bed Deep Cleaning', label: 'King', price: 550, unit: 'per item' },
  { category: 'upholstery', service: 'Headboard Deep Cleaning', label: 'Single', price: 200, unit: 'per item' },
  { category: 'upholstery', service: 'Headboard Deep Cleaning', label: 'Double', price: 250, unit: 'per item' },
  { category: 'upholstery', service: 'Headboard Deep Cleaning', label: 'Queen', price: 300, unit: 'per item' },
  { category: 'upholstery', service: 'Headboard Deep Cleaning', label: 'King', price: 350, unit: 'per item' },

  // --- EVENTS ---
  { category: 'events', service: 'Pre & Post Event Cleaning', label: '10–30 guests', price: 1500, unit: 'from' },
  { category: 'events', service: 'Pre & Post Event Cleaning', label: '40–60 guests', price: 2000, unit: 'from' },
  { category: 'events', service: 'Pre & Post Event Cleaning', label: '70+ guests', price: 3500, unit: 'from' },
];

// Use the service name as the serviceId so they are grouped correctly
db.pricing = pricingData.map((item, index) => ({
  id: Date.now().toString() + index,
  category: item.category, 
  serviceId: item.service, 
  label: item.label,
  price: item.price,
  unit: item.unit,
  notes: ''
}));

fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
console.log(`✅ Successfully seeded ${db.pricing.length} pricing items into the database!`);