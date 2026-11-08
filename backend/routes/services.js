const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const store = require('../data/store');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `svc-${Date.now()}-${crypto.randomUUID().slice(0, 8)}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (/^image\//.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files allowed'));
  }
});

// PUBLIC – active services only
router.get('/', (req, res) => {
  const includeAll = req.query.all === '1' && req.headers.authorization;
  // If admin token present and ?all=1, return everything
  if (includeAll) {
    try {
      const jwt = require('jsonwebtoken');
      jwt.verify(req.headers.authorization.slice(7), process.env.JWT_SECRET);
      return res.json(store.getServices(true));
    } catch (e) { /* fall through */ }
  }
  res.json(store.getServices(false));
});

router.get('/:id', (req, res) => {
  const service = store.getServiceById(req.params.id);
  if (!service) return res.status(404).json({ error: 'Service not found' });
  res.json(service);
});

// ADMIN – create (with optional image)
router.post('/', authMiddleware, upload.single('image'), (req, res) => {
  try {
    const body = req.body;
    if (!body.name) return res.status(400).json({ error: 'Name is required' });
    if (req.file) body.image = '/uploads/' + req.file.filename;
    // features may arrive as JSON string from FormData
    if (typeof body.features === 'string' && body.features.startsWith('[')) {
      try { body.features = JSON.parse(body.features); } catch (e) {}
    }
    const service = store.createService(body);
    res.status(201).json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN – update (with optional image)
router.put('/:id', authMiddleware, upload.single('image'), (req, res) => {
  try {
    const body = { ...req.body };
    if (req.file) body.image = '/uploads/' + req.file.filename;
    if (typeof body.features === 'string' && body.features.startsWith('[')) {
      try { body.features = JSON.parse(body.features); } catch (e) {}
    }
    if (body.active === 'true') body.active = true;
    if (body.active === 'false') body.active = false;
    const updated = store.updateService(req.params.id, body);
    if (!updated) return res.status(404).json({ error: 'Service not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authMiddleware, (req, res) => {
  const ok = store.deleteService(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Service not found' });
  res.json({ success: true });
});

module.exports = router;
