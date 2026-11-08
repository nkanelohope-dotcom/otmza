const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const uuidv4 = () => crypto.randomUUID();

const DATA_DIR = path.join(__dirname);
const DB_FILE = path.join(DATA_DIR, 'db.json');

const defaultData = {
  services: [
    {
      id: 'svc-standard',
      name: 'Standard Cleaning',
      shortDescription: 'Regular maintenance cleaning for apartments and houses.',
      description: 'Regular maintenance cleaning for apartments and houses — kitchens, bathrooms, living areas, bedrooms and more. Ideal for weekly or bi-weekly upkeep.',
      category: 'cleaning',
      priceFrom: 300,
      priceUnit: 'ZAR',
      image: null,
      features: ['Kitchen & bathrooms', 'Living areas & bedrooms', 'Dusting & vacuuming', 'Bin emptying'],
      active: true,
      order: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'svc-deep',
      name: 'Deep Cleaning',
      shortDescription: 'Thorough deep cleans including appliances, cupboards and carpets.',
      description: 'Thorough deep cleans including cupboards, appliances, walls, ovens, carpets and hard-to-reach areas. Perfect for move-in/move-out or seasonal refresh.',
      category: 'cleaning',
      priceFrom: 1100,
      priceUnit: 'ZAR',
      image: null,
      features: ['Cupboards & appliances', 'Ovens & fridges', 'Walls & skirting', 'Carpets & floors'],
      active: true,
      order: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'svc-spring',
      name: 'Spring Cleaning',
      shortDescription: 'Comprehensive seasonal clean with organisation and full property refresh.',
      description: 'Comprehensive seasonal clean with organisation of cupboards, appliances and a full property refresh.',
      category: 'cleaning',
      priceFrom: 600,
      priceUnit: 'ZAR',
      image: null,
      features: ['Full property refresh', 'Cupboard organisation', 'Appliance interiors', 'Seasonal deep clean'],
      active: true,
      order: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'svc-event',
      name: 'Pre & Post Event Cleaning',
      shortDescription: 'Make hosting easier — we handle the clean-up!',
      description: 'Professional pre and post event cleaning and event assistance. Perfect for weddings, lobola, birthdays, church functions, funerals and corporate events. We bring our own cleaning chemicals & equipment.',
      category: 'events',
      priceFrom: 1500,
      priceUnit: 'ZAR',
      image: null,
      features: ['Event preparation assistance', 'Full venue cleaning', 'Dishwashing', 'Tidying and putting everything in order', 'Rubbish collection and removal'],
      active: true,
      order: 4,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'svc-moving',
      name: 'Packing & Moving',
      shortDescription: 'Professional packing, loading, transport and unpacking.',
      description: 'Professional packing, loading, transport and unpacking services for homes and offices. From packed to perfectly placed.',
      category: 'moving',
      priceFrom: 1500,
      priceUnit: 'ZAR',
      image: null,
      features: ['Packing materials available', 'Careful loading & transport', 'Unpacking assistance', 'Furniture placement'],
      active: true,
      order: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'svc-carpet',
      name: 'Carpet & Upholstery Cleaning',
      shortDescription: 'Professional carpet, rug and upholstery cleaning.',
      description: 'Deep cleaning for carpets, rugs, couches and mattresses. Removes dirt, stains and allergens for a fresh, healthy home.',
      category: 'special',
      priceFrom: 250,
      priceUnit: 'ZAR',
      image: null,
      features: ['Carpets & rugs', 'Couches & sofas', 'Mattresses', 'Stain treatment'],
      active: true,
      order: 6,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'svc-maid',
      name: 'Weekly Maid Service',
      shortDescription: 'Reliable weekly domestic cleaning support.',
      description: 'Consistent weekly maid service for busy households. Same cleaner where possible, flexible scheduling.',
      category: 'cleaning',
      priceFrom: 250,
      priceUnit: 'ZAR',
      image: null,
      features: ['Weekly schedule', 'Trusted cleaners', 'Flexible days', 'Home maintenance clean'],
      active: true,
      order: 7,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'svc-empty',
      name: 'Empty Property / Move-Out Clean',
      shortDescription: 'Full clean for empty apartments and houses.',
      description: 'Complete clean of empty properties for tenants, landlords and estate agents. Ideal for handovers and inspections.',
      category: 'cleaning',
      priceFrom: 1100,
      priceUnit: 'ZAR',
      image: null,
      features: ['Empty unit deep clean', 'Kitchen & bathrooms', 'Windows & floors', 'Inspection-ready finish'],
      active: true,
      order: 8,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  pricing: [
    { id: 'p1', serviceId: 'svc-standard', label: 'Bachelor / Studio', price: 300, unit: 'per clean', notes: '', order: 1 },
    { id: 'p2', serviceId: 'svc-standard', label: '1 Bedroom Apartment', price: 400, unit: 'per clean', notes: '', order: 2 },
    { id: 'p3', serviceId: 'svc-standard', label: '2 Bedroom Apartment', price: 500, unit: 'per clean', notes: '', order: 3 },
    { id: 'p4', serviceId: 'svc-standard', label: '3 Bedroom House', price: 700, unit: 'per clean', notes: '', order: 4 },
    { id: 'p5', serviceId: 'svc-deep', label: 'Bachelor / Studio Deep', price: 1100, unit: 'per clean', notes: '', order: 1 },
    { id: 'p6', serviceId: 'svc-deep', label: '1 Bedroom Deep', price: 1400, unit: 'per clean', notes: '', order: 2 },
    { id: 'p7', serviceId: 'svc-deep', label: '2 Bedroom Deep', price: 1800, unit: 'per clean', notes: '', order: 3 },
    { id: 'p8', serviceId: 'svc-deep', label: '3 Bedroom House Deep', price: 2500, unit: 'per clean', notes: '', order: 4 },
    { id: 'p9', serviceId: 'svc-spring', label: 'Bachelor Spring Clean', price: 600, unit: 'per clean', notes: '', order: 1 },
    { id: 'p10', serviceId: 'svc-spring', label: '1 Bedroom Spring', price: 800, unit: 'per clean', notes: '', order: 2 },
    { id: 'p11', serviceId: 'svc-spring', label: '2 Bedroom Spring', price: 1000, unit: 'per clean', notes: '', order: 3 },
    { id: 'p12', serviceId: 'svc-event', label: '10–30 guests', price: 1500, unit: 'from', notes: '', order: 1 },
    { id: 'p13', serviceId: 'svc-event', label: '40–60 guests', price: 2000, unit: 'from', notes: '', order: 2 },
    { id: 'p14', serviceId: 'svc-event', label: '70+ guests', price: 3500, unit: 'from', notes: '', order: 3 },
    { id: 'p15', serviceId: 'svc-carpet', label: 'Single couch / seat', price: 250, unit: 'from', notes: '', order: 1 },
    { id: 'p16', serviceId: 'svc-carpet', label: '3-seater couch', price: 450, unit: 'from', notes: '', order: 2 },
    { id: 'p17', serviceId: 'svc-carpet', label: 'Carpet (per room)', price: 350, unit: 'from', notes: '', order: 3 },
    { id: 'p18', serviceId: 'svc-carpet', label: 'Mattress (single/double)', price: 300, unit: 'from', notes: '', order: 4 },
    { id: 'p19', serviceId: 'svc-maid', label: 'Half day (4 hrs)', price: 250, unit: 'per visit', notes: '', order: 1 },
    { id: 'p20', serviceId: 'svc-maid', label: 'Full day (8 hrs)', price: 450, unit: 'per visit', notes: '', order: 2 },
    { id: 'p21', serviceId: 'svc-empty', label: 'Bachelor / Studio empty', price: 1100, unit: 'per clean', notes: '', order: 1 },
    { id: 'p22', serviceId: 'svc-empty', label: '1–2 Bedroom empty', price: 1500, unit: 'per clean', notes: '', order: 2 },
    { id: 'p23', serviceId: 'svc-empty', label: '3+ Bedroom empty', price: 2200, unit: 'per clean', notes: '', order: 3 },
    { id: 'p24', serviceId: 'svc-moving', label: 'Studio / Bachelor move', price: 1500, unit: 'from', notes: '', order: 1 },
    { id: 'p25', serviceId: 'svc-moving', label: '1–2 Bedroom move', price: 2500, unit: 'from', notes: '', order: 2 },
    { id: 'p26', serviceId: 'svc-moving', label: '3+ Bedroom / House move', price: 4000, unit: 'from', notes: '', order: 3 }
  ],
  gallery: [],
  settings: {
    siteName: 'On The Move ZA',
    tagline: 'From Packed to Perfectly Placed',
    phone: '074 353 8569',
    phone2: '',
    whatsapp: '27743538569',
    email: 'onthemove.zao@gmail.com',
    instagram: '@onthemove_sa',
    tiktok: '@onthemove_za',
    facebook: '@onthemove_sa',
    areas: 'Johannesburg · Pretoria · Sandton · Surrounding Areas',
    calloutFee: 'R100 call-out fee applies for distances under 10 km'
  }
};

function ensureDb() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2));
    console.log('✓ Database seeded with default data');
  }
}
function readDb() { ensureDb(); return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); }
function writeDb(data) { ensureDb(); fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2)); }

function getServices(includeInactive = false) {
  let list = readDb().services;
  if (!includeInactive) list = list.filter(s => s.active !== false);
  return list.sort((a, b) => (a.order || 0) - (b.order || 0));
}
function getServiceById(id) { return readDb().services.find(s => s.id === id) || null; }

function createService(payload) {
  const db = readDb();
  const service = {
    id: 'svc-' + uuidv4().slice(0, 8),
    name: payload.name,
    shortDescription: payload.shortDescription || '',
    description: payload.description || '',
    category: payload.category || 'cleaning',
    priceFrom: Number(payload.priceFrom) || 0,
    priceUnit: payload.priceUnit || 'ZAR',
    image: payload.image || null,
    features: Array.isArray(payload.features) ? payload.features : (payload.features ? String(payload.features).split('\n').map(f => f.trim()).filter(Boolean) : []),
    active: payload.active !== false && payload.active !== 'false',
    order: payload.order != null ? Number(payload.order) : (db.services.length + 1),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.services.push(service);
  writeDb(db);
  return service;
}

function updateService(id, payload) {
  const db = readDb();
  const idx = db.services.findIndex(s => s.id === id);
  if (idx === -1) return null;
  const current = db.services[idx];
  let features = current.features || [];
  if (payload.features !== undefined) {
    features = Array.isArray(payload.features) ? payload.features : String(payload.features).split('\n').map(f => f.trim()).filter(Boolean);
  }
  db.services[idx] = {
    ...current,
    name: payload.name !== undefined ? payload.name : current.name,
    shortDescription: payload.shortDescription !== undefined ? payload.shortDescription : current.shortDescription,
    description: payload.description !== undefined ? payload.description : current.description,
    category: payload.category !== undefined ? payload.category : current.category,
    priceFrom: payload.priceFrom !== undefined ? Number(payload.priceFrom) : current.priceFrom,
    priceUnit: payload.priceUnit !== undefined ? payload.priceUnit : current.priceUnit,
    image: payload.image !== undefined ? payload.image : current.image,
    features,
    active: payload.active !== undefined ? (payload.active !== false && payload.active !== 'false') : current.active,
    order: payload.order !== undefined ? Number(payload.order) : current.order,
    id,
    updatedAt: new Date().toISOString()
  };
  writeDb(db);
  return db.services[idx];
}

function deleteService(id) {
  const db = readDb();
  const before = db.services.length;
  db.services = db.services.filter(s => s.id !== id);
  db.pricing = db.pricing.filter(p => p.serviceId !== id);
  writeDb(db);
  return before !== db.services.length;
}

function getPricing(serviceId = null) {
  let items = readDb().pricing;
  if (serviceId) items = items.filter(p => p.serviceId === serviceId);
  return items.sort((a, b) => (a.order || 0) - (b.order || 0));
}
function createPricing(payload) {
  const db = readDb();
  const item = {
    id: 'p-' + uuidv4().slice(0, 8),
    serviceId: payload.serviceId,
    label: payload.label,
    price: Number(payload.price) || 0,
    unit: payload.unit || 'per clean',
    notes: payload.notes || '',
    order: payload.order != null ? Number(payload.order) : (db.pricing.length + 1)
  };
  db.pricing.push(item);
  writeDb(db);
  return item;
}
function updatePricing(id, payload) {
  const db = readDb();
  const idx = db.pricing.findIndex(p => p.id === id);
  if (idx === -1) return null;
  db.pricing[idx] = { ...db.pricing[idx], ...payload, price: payload.price !== undefined ? Number(payload.price) : db.pricing[idx].price, id };
  writeDb(db);
  return db.pricing[idx];
}
function deletePricing(id) {
  const db = readDb();
  const before = db.pricing.length;
  db.pricing = db.pricing.filter(p => p.id !== id);
  writeDb(db);
  return before !== db.pricing.length;
}

function getGallery() { return readDb().gallery || []; }
function addGalleryItem(item) {
  const db = readDb();
  if (!db.gallery) db.gallery = [];
  const entry = {
    id: 'gal-' + uuidv4().slice(0, 8),
    filename: item.filename,
    originalName: item.originalName || item.filename,
    url: '/uploads/' + item.filename,
    caption: item.caption || '',
    category: item.category || 'general',
    createdAt: new Date().toISOString()
  };
  db.gallery.push(entry);
  writeDb(db);
  return entry;
}
function deleteGalleryItem(id) {
  const db = readDb();
  const item = (db.gallery || []).find(g => g.id === id);
  if (!item) return null;
  db.gallery = db.gallery.filter(g => g.id !== id);
  writeDb(db);
  return item;
}

function getSettings() { return readDb().settings; }
function updateSettings(payload) {
  const db = readDb();
  db.settings = { ...db.settings, ...payload };
  writeDb(db);
  return db.settings;
}

module.exports = {
  ensureDb,
  getServices, getServiceById, createService, updateService, deleteService,
  getPricing, createPricing, updatePricing, deletePricing,
  getGallery, addGalleryItem, deleteGalleryItem,
  getSettings, updateSettings
};
