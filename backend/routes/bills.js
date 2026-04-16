const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');
const Medicine = require('../models/Medicine');

// Generate bill number
async function generateBillNumber() {
  const lastBill = await Bill.findOne().sort({ createdAt: -1 });
  if (!lastBill) return 'BILL-0001';
  
  const lastNumber = parseInt(lastBill.billNumber.split('-')[1]);
  const newNumber = (lastNumber + 1).toString().padStart(4, '0');
  return `BILL-${newNumber}`;
}

// Create new bill
router.post('/', async (req, res) => {
  try {
    const { customerName, customerPhone, items, eta } = req.body;
    
    console.log('Received items:', items); // Debug log
    
    // Check stock and calculate totals
    let subtotal = 0;
    let totalGst = 0;
    const processedItems = [];
    
    for (const item of items) {
      const medicine = await Medicine.findById(item.medicineId);
      if (!medicine) {
        return res.status(404).json({ message: `Medicine not found: ${item.medicineId}` });
      }
      
      if (medicine.quantity < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${medicine.name}. Available: ${medicine.quantity}` 
        });
      }
      
      const itemTotal = medicine.price * item.quantity;
      const itemGst = (itemTotal * medicine.gst) / 100;
      const itemTotalWithGst = itemTotal + itemGst;
      
      subtotal += itemTotal;
      totalGst += itemGst;
      
      processedItems.push({
        medicineId: medicine._id,
        name: medicine.name,
        quantity: item.quantity,
        price: medicine.price,
        gst: medicine.gst,
        total: itemTotalWithGst
      });
      
      // Update stock
      medicine.quantity -= item.quantity;
      await medicine.save();
    }
    
    const cgst = totalGst / 2;
    const sgst = totalGst / 2;
    const totalAmount = subtotal + totalGst;
    
    const billNumber = await generateBillNumber();
    
    const bill = new Bill({
      billNumber,
      customerName,
      customerPhone,
      eta: eta || undefined,
      items: processedItems,
      subtotal,
      cgst,
      sgst,
      totalAmount
    });
    
    const savedBill = await bill.save();
    console.log('Saved bill with items:', savedBill.items.length); // Debug log
    res.status(201).json(savedBill);
    
  } catch (error) {
    console.error('Error creating bill:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get all bills
router.get('/', async (req, res) => {
  try {
    const bills = await Bill.find().sort({ createdAt: -1 });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single bill
router.get('/:id', async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    res.json(bill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE bill
router.delete('/:id', async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    
    // Restore stock for each item in the bill
    for (const item of bill.items) {
      const medicine = await Medicine.findById(item.medicineId);
      if (medicine) {
        medicine.quantity += item.quantity;
        await medicine.save();
      }
    }
    
    // Delete the bill
    await Bill.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Bill deleted successfully and stock restored' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;