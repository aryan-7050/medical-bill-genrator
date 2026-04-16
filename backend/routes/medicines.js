const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');

// Get all medicines
router.get('/', async (req, res) => {
  try {
    const medicines = await Medicine.find().sort({ createdAt: -1 });
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get low stock medicines (quantity < 10)
router.get('/low-stock', async (req, res) => {
  try {
    const medicines = await Medicine.find({ quantity: { $lt: 10 } });
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single medicine
router.get('/:id', async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    res.json(medicine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new medicine
router.post('/', async (req, res) => {
  try {
    const medicine = new Medicine(req.body);
    const savedMedicine = await medicine.save();
    res.status(201).json(savedMedicine);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update medicine
router.put('/:id', async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    res.json(medicine);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete medicine
router.delete('/:id', async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndDelete(req.params.id);
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    res.json({ message: 'Medicine deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update stock
router.patch('/:id/stock', async (req, res) => {
  try {
    const { quantity } = req.body;
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    
    medicine.quantity = quantity;
    await medicine.save();
    res.json(medicine);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;