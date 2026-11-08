const express = require('express');
const store = require('../data/store');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

// PUBLIC – get all pricing or filter by serviceId
router.get('/', (req, res) => {
  const { serviceId } = req.query;
  const items = store.getPricing(serviceId || null);
  res.json(items);
});

// ADMIN – create pricing item
router.post('/', authMiddleware, (req, res) => {
  const { serviceId, label, price, unit, notes, order } = req.body;
  if (!serviceId || !label) {
    return res.status(400).json({ error: 'serviceId and label are required' });
  }
  const item = store.createPricing({ serviceId, label, price, unit, notes, order });
  res.status(201).json(item);
});

// ADMIN – update pricing item
router.put('/:id', authMiddleware, (req, res) => {
  const updated = store.updatePricing(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Pricing item not found' });
  res.json(updated);
});

// ADMIN – delete pricing item
router.delete('/:id', authMiddleware, (req, res) => {
  const ok = store.deletePricing(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Pricing item not found' });
  res.json({ success: true });
});

module.exports = router;
