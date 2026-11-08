require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'otmza-secret-key-2026';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Prevent caching for API routes
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});

// Ensure upload directories exist
const uploadDirs = ['uploads/services', 'uploads/gallery'];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve the Admin Dashboard (from the 'public' folder)
app.use('/admin', express.static(path.join(__dirname, 'public')));
// Also serve it at the root just in case (e.g. localhost:3000/admin.html)
app.use(express.static(path.join(__dirname, 'public')));

// Serve the public website (HTML, CSS, JS, images)
app.use(express.static(path.join(__dirname, '..', 'website')));

// JSON Database Helper
const DB_FILE = './database.json';
const getDB = () => {
  if (!fs.existsSync(DB_FILE)) {
    const initialData = { services: [], pricing: [], gallery: [], settings: {} };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
};
const saveDB = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

// Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (req.path.includes('gallery')) cb(null, 'uploads/gallery');
    else cb(null, 'uploads/services');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
  }
});
const upload = multer({ storage });

// Auth
const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'password123'; 

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.get('/api/auth/me', authenticateToken, (req, res) => res.json({ user: req.user }));

// Services
app.get('/api/services', (req, res) => {
  const db = getDB();
  const services = req.query.all === '1' ? db.services : db.services.filter(s => s.active !== false);
  res.json(services.sort((a, b) => (a.order || 99) - (b.order || 99)));
});

app.post('/api/services', authenticateToken, upload.single('image'), (req, res) => {
  const db = getDB();
  const newService = {
    id: Date.now().toString(),
    name: req.body.name,
    shortDescription: req.body.shortDescription,
    description: req.body.description,
    category: req.body.category,
    features: JSON.parse(req.body.features || '[]'),
    active: req.body.active === 'true',
    order: Number(req.body.order) || db.services.length + 1,
    image: req.file ? `/uploads/services/${req.file.filename}` : null
  };
  db.services.push(newService);
  saveDB(db);
  res.status(201).json(newService);
});

app.put('/api/services/:id', authenticateToken, upload.single('image'), (req, res) => {
  const db = getDB();
  const index = db.services.findIndex(s => s.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Service not found' });

  const existing = db.services[index];
  db.services[index] = {
    ...existing,
    name: req.body.name,
    shortDescription: req.body.shortDescription,
    description: req.body.description,
    category: req.body.category,
    features: JSON.parse(req.body.features || '[]'),
    active: req.body.active === 'true',
    order: Number(req.body.order) || existing.order,
    image: req.file ? `/uploads/services/${req.file.filename}` : existing.image
  };
  saveDB(db);
  res.json(db.services[index]);
});

app.delete('/api/services/:id', authenticateToken, (req, res) => {
  const db = getDB();
  db.services = db.services.filter(s => s.id !== req.params.id);
  db.pricing = db.pricing.filter(p => p.serviceId !== req.params.id);
  saveDB(db);
  res.json({ success: true });
});

// Pricing
app.get('/api/pricing', (req, res) => res.json(getDB().pricing));

app.post('/api/pricing', authenticateToken, (req, res) => {
  const db = getDB();
  const newPricing = { id: Date.now().toString(), ...req.body };
  db.pricing.push(newPricing);
  saveDB(db);
  res.status(201).json(newPricing);
});

app.put('/api/pricing/:id', authenticateToken, (req, res) => {
  const db = getDB();
  const index = db.pricing.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Not found' });
  db.pricing[index] = { ...db.pricing[index], ...req.body };
  saveDB(db);
  res.json(db.pricing[index]);
});

app.delete('/api/pricing/:id', authenticateToken, (req, res) => {
  const db = getDB();
  db.pricing = db.pricing.filter(p => p.id !== req.params.id);
  saveDB(db);
  res.json({ success: true });
});

// Gallery
app.get('/api/gallery', (req, res) => res.json(getDB().gallery));

app.post('/api/gallery/upload', authenticateToken, upload.single('file'), (req, res) => {
  const db = getDB();
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  
  const newImage = {
    id: Date.now().toString(),
    filename: req.file.filename,
    originalName: req.file.originalname,
    url: `/uploads/gallery/${req.file.filename}`,
    category: req.body.category || 'cleaning',
    isLegacy: false
  };
  db.gallery.push(newImage);
  saveDB(db);
  res.status(201).json(newImage);
});

app.delete('/api/gallery/:id', authenticateToken, (req, res) => {
  const db = getDB();
  const image = db.gallery.find(g => g.id === req.params.id);
  if (image) {
    const filePath = path.join(__dirname, image.url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
  db.gallery = db.gallery.filter(g => g.id !== req.params.id);
  saveDB(db);
  res.json({ success: true });
});

// Settings
app.get('/api/settings', (req, res) => res.json(getDB().settings));
app.put('/api/settings', authenticateToken, (req, res) => {
  const db = getDB();
  db.settings = { ...db.settings, ...req.body };
  saveDB(db);
  res.json(db.settings);
});

// Health Check for Render
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', time: new Date().toISOString() });
});

// Fallback for website (must be last)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, '..', 'website', 'index.html'));
});

app.listen(PORT, () => {
  console.log('═══════════════════════════════════════════');
  console.log(`  On The Move ZA – Backend running`);
  console.log(`  → Website : http://localhost:${PORT}`);
  console.log(`  → Admin   : http://localhost:${PORT}/admin.html`);
  console.log('═══════════════════════════════════════════');
});