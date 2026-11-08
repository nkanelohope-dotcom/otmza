const express = require('express');
const store = require('../data/store');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

// PUBLIC
router.get('/', (req, res) => {
  res.json(store.getSettings());
});

// ADMIN
router.put('/', authMiddleware, (req, res) => {
  const updated = store.updateSettings(req.body);
  res.json(updated);
});

module.exports = router;
