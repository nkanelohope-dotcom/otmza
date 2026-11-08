const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const store = require('../data/store');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const uuidv4 = () => crypto.randomUUID();

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
const WEBSITE_IMAGES_DIR = path.join(__dirname, '..', '..', 'website', 'images');

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

/*
 * These are the pictures already displayed in website/gallery.html.
 * They are exposed through the same API as newly uploaded pictures, so
 * the admin can manage both old and new gallery items.
 */
const LEGACY_CATEGORIES = {
  cleaning: ['image2.jpeg', 'image3.jpeg', 'image13.jpeg', 'image14.jpeg', 'image17.jpeg', 'image21.jpeg', 'image22.jpeg', 'image28.jpeg', 'image34.jpeg'],
  packing: ['image1.jpeg', 'image4.jpeg', 'image6.jpeg', 'image7.jpeg', 'image9.jpeg', 'image15.jpeg'],
  moving: ['image10.jpeg', 'image11.jpeg', 'image12.jpeg', 'image16.jpeg', 'image18.jpeg', 'image23.jpeg', 'image24.jpeg', 'image25.jpeg', 'image26.jpeg', 'image27.jpeg', 'image30.jpeg', 'image36.jpeg', 'image37.jpeg'],
  events: ['image31.jpeg', 'image29.jpeg'],
  results: ['image8.jpeg', 'image19.jpeg', 'image20.jpeg', 'image32.jpeg', 'image5.mp4']
};

const LEGACY_FILES = new Map();
for (const [category, filenames] of Object.entries(LEGACY_CATEGORIES)) {
  for (const filename of filenames) LEGACY_FILES.set(filename, category);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${uuidv4().slice(0, 8)}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.webm']);
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedMime = file.mimetype.startsWith('image/') ||
    ['video/mp4', 'video/webm'].includes(file.mimetype);

  if (allowedExtensions.has(ext) && allowedMime) return cb(null, true);
  cb(new Error('Only JPG, PNG, GIF, WEBP, MP4 and WEBM files are allowed'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 }
});

// PUBLIC: list legacy website images and backend uploads together.
router.get('/', (req, res) => {
  const legacyItems = [];

  for (const [filename, category] of LEGACY_FILES.entries()) {
    const fullPath = path.join(WEBSITE_IMAGES_DIR, filename);
    if (!fs.existsSync(fullPath)) continue;

    legacyItems.push({
      id: `legacy-${filename}`,
      filename,
      originalName: filename,
      url: `/images/${encodeURIComponent(filename)}`,
      category,
      isLegacy: true
    });
  }

  res.json([...legacyItems, ...store.getGallery()]);
});

// ADMIN: upload a new image/video into the selected category.
router.post('/upload', authMiddleware, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const allowedCategories = new Set(['cleaning', 'packing', 'moving', 'events', 'results']);
  const category = allowedCategories.has(req.body.category) ? req.body.category : 'cleaning';

  const item = store.addGalleryItem({
    filename: req.file.filename,
    originalName: req.file.originalname,
    caption: req.body.caption || '',
    category
  });

  res.status(201).json(item);
});

// ADMIN: delete an uploaded item OR an existing hardcoded website gallery image.
router.delete('/:id', authMiddleware, (req, res) => {
  const id = String(req.params.id || '');

  if (id.startsWith('legacy-')) {
    const filename = id.slice('legacy-'.length);

    // Only files explicitly listed in the legacy gallery can be removed.
    if (!LEGACY_FILES.has(filename)) {
      return res.status(404).json({ error: 'Existing gallery image not found' });
    }

    const fullPath = path.resolve(WEBSITE_IMAGES_DIR, filename);
    if (path.dirname(fullPath) !== path.resolve(WEBSITE_IMAGES_DIR)) {
      return res.status(400).json({ error: 'Invalid file path' });
    }

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'Image file no longer exists' });
    }

    try {
      fs.unlinkSync(fullPath);
      return res.json({ success: true, deleted: filename });
    } catch (error) {
      console.error('Could not delete legacy gallery file:', error);
      return res.status(500).json({ error: 'Could not delete the image file' });
    }
  }

  const item = store.deleteGalleryItem(id);
  if (!item) return res.status(404).json({ error: 'Item not found' });

  const filePath = path.resolve(UPLOAD_DIR, item.filename);
  if (path.dirname(filePath) === path.resolve(UPLOAD_DIR) && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (error) {
      console.warn('Could not delete uploaded file:', error.message);
    }
  }

  res.json({ success: true });
});

module.exports = router;
