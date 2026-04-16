import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMedicines, createBill, createMedicine } from '../services/api';
import { TrashIcon, PlusIcon, XMarkIcon, ShoppingCartIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

const CreateBill = () => {
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    customerName: '',
    customerPhone: ''
  });
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMedicineModal, setShowMedicineModal] = useState(false);
  const [newMedicine, setNewMedicine] = useState({
    name: '',
    batchNumber: '',
    expiryDate: '',
    price: '',
    gst: '',
    quantity: '',
    company: ''
  });
  const [addingMedicine, setAddingMedicine] = useState(false);

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const response = await getMedicines();
      setMedicines(response.data);
    } catch (error) {
      console.error('Error fetching medicines:', error);
    }
  };

  // Add single medicine to cart
  const addMedicineToCart = (medicineId, quantity = 1) => {
    const medicine = medicines.find(m => m._id === medicineId);
    if (!medicine) return false;
    
    if (quantity <= 0) {
      alert('Quantity must be at least 1');
      return false;
    }
    
    if (quantity > medicine.quantity) {
      alert(`Only ${medicine.quantity} units available in stock`);
      return false;
    }
    
    const existingItem = cart.find(item => item.medicineId === medicine._id);
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > medicine.quantity) {
        alert(`Only ${medicine.quantity} units available in stock`);
        return false;
      }
      setCart(prevCart => prevCart.map(item =>
        item.medicineId === medicine._id
          ? { ...item, quantity: newQuantity }
          : item
      ));
    } else {
      setCart(prevCart => [...prevCart, {
        medicineId: medicine._id,
        name: medicine.name,
        price: medicine.price,
        gst: medicine.gst,
        quantity: quantity
      }]);
    }
    return true;
  };

  // Add multiple selected medicines to cart at once
  const addMultipleMedicines = () => {
    const medicinesToAdd = selectedMedicines.filter(item => item.medicineId && item.medicineId !== '' && item.quantity > 0);
    
    if (medicinesToAdd.length === 0) {
      alert('Please select at least one medicine with quantity greater than 0');
      return;
    }
    
    let addedCount = 0;
    
    medicinesToAdd.forEach(item => {
      const success = addMedicineToCart(item.medicineId, item.quantity);
      if (success) addedCount++;
    });
    
    if (addedCount > 0) {
      alert(`${addedCount} medicine(s) added to cart!`);
      setSelectedMedicines([]);
    }
  };

  const addMedicineRow = () => {
    setSelectedMedicines([...selectedMedicines, { medicineId: '', quantity: 0 }]);
  };

  const removeMedicineRow = (index) => {
    const newSelected = [...selectedMedicines];
    newSelected.splice(index, 1);
    setSelectedMedicines(newSelected);
  };

  const updateSelectedMedicine = (index, medicineId) => {
    const newSelected = [...selectedMedicines];
    newSelected[index].medicineId = medicineId;
    setSelectedMedicines(newSelected);
  };

  const updateQuantityValue = (index, newQuantity) => {
    if (newQuantity < 0) {
      alert('Quantity cannot be negative');
      return;
    }
    if (newQuantity > 100) {
      alert('Maximum quantity per medicine is 100');
      return;
    }
    const newSelected = [...selectedMedicines];
    newSelected[index].quantity = newQuantity;
    setSelectedMedicines(newSelected);
  };

  const removeFromCart = (medicineId) => {
    setCart(cart.filter(item => item.medicineId !== medicineId));
  };

  const updateCartQuantity = (medicineId, newQuantity) => {
    if (newQuantity < 0) {
      alert('Quantity cannot be negative');
      return;
    }
    if (newQuantity === 0) {
      removeFromCart(medicineId);
      return;
    }
    if (newQuantity > 100) {
      alert('Maximum quantity per medicine is 100');
      return;
    }
    
    const medicine = medicines.find(m => m._id === medicineId);
    if (newQuantity > medicine.quantity) {
      alert(`Only ${medicine.quantity} units available in stock`);
      return;
    }
    setCart(cart.map(item =>
      item.medicineId === medicineId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let totalGst = 0;
    
    cart.forEach(item => {
      const itemTotal = item.price * item.quantity;
      const itemGst = (itemTotal * item.gst) / 100;
      subtotal += itemTotal;
      totalGst += itemGst;
    });
    
    const cgst = totalGst / 2;
    const sgst = totalGst / 2;
    const total = subtotal + totalGst;
    
    return { subtotal, cgst, sgst, total };
  };

  // Generate ONE bill with all medicines in cart
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!customerInfo.customerName) {
      alert('Please enter customer name');
      return;
    }
    
    if (cart.length === 0) {
      alert('Please add items to the bill');
      return;
    }
    
    setLoading(true);
    
    try {
      const billData = {
        customerName: customerInfo.customerName,
        customerPhone: customerInfo.customerPhone,
        items: cart.map(item => ({
          medicineId: item.medicineId,
          quantity: item.quantity
        }))
      };
      
      const response = await createBill(billData);
      navigate(`/invoice/${response.data._id}`);
    } catch (error) {
      console.error('Error creating bill:', error);
      alert(error.response?.data?.message || 'Error creating bill');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewMedicine = async (e) => {
    e.preventDefault();
    
    if (!newMedicine.name.trim()) {
      alert('Please enter medicine name');
      return;
    }
    if (!newMedicine.batchNumber.trim()) {
      alert('Please enter batch number');
      return;
    }
    if (!newMedicine.expiryDate) {
      alert('Please select expiry date');
      return;
    }
    if (!newMedicine.price || parseFloat(newMedicine.price) <= 0) {
      alert('Please enter a valid price');
      return;
    }
    if (!newMedicine.gst || parseFloat(newMedicine.gst) < 0 || parseFloat(newMedicine.gst) > 100) {
      alert('Please enter a valid GST percentage (0-100)');
      return;
    }
    if (!newMedicine.quantity || parseInt(newMedicine.quantity) < 0) {
      alert('Please enter a valid quantity');
      return;
    }
    if (!newMedicine.company.trim()) {
      alert('Please enter company name');
      return;
    }
    
    setAddingMedicine(true);
    
    try {
      const data = {
        ...newMedicine,
        price: parseFloat(newMedicine.price),
        gst: parseFloat(newMedicine.gst),
        quantity: parseInt(newMedicine.quantity)
      };
      
      await createMedicine(data);
      alert('Medicine added successfully!');
      await fetchMedicines();
      setShowMedicineModal(false);
      setNewMedicine({
        name: '',
        batchNumber: '',
        expiryDate: '',
        price: '',
        gst: '',
        quantity: '',
        company: ''
      });
    } catch (error) {
      console.error('Error adding medicine:', error);
      alert(error.response?.data?.message || 'Error adding medicine');
    } finally {
      setAddingMedicine(false);
    }
  };

  const { subtotal, cgst, sgst, total } = calculateTotals();

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Customer Information</h2>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={customerInfo.customerName}
                  onChange={(e) => setCustomerInfo({...customerInfo, customerName: e.target.value})}
                  className="input-field"
                  placeholder="Enter customer name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={customerInfo.customerPhone}
                  onChange={(e) => setCustomerInfo({...customerInfo, customerPhone: e.target.value})}
                  className="input-field"
                  placeholder="Enter phone number"
                />
              </div>
            </div>
          </div>
          
          {/* Add Multiple Medicines Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4 pb-3 border-b">
              <div className="flex items-center space-x-2">
                <ClipboardDocumentListIcon className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-800">Add Medicines</h2>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={addMedicineRow}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200 flex items-center space-x-2 text-sm font-medium"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Add Row</span>
                </button>
                <button
                  onClick={() => setShowMedicineModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center space-x-2 text-sm font-medium"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>New Medicine</span>
                </button>
              </div>
            </div>
            
            {/* Medicine Selection Rows */}
            <div className="space-y-3">
              {selectedMedicines.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-7">
                      <label className="block text-xs text-gray-600 mb-1">Select Medicine</label>
                      <select
                        value={item.medicineId}
                        onChange={(e) => updateSelectedMedicine(index, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="">-- Select Medicine --</option>
                        {medicines.map(medicine => (
                          <option key={medicine._id} value={medicine._id}>
                            {medicine.name} - ₹{medicine.price} (Stock: {medicine.quantity})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-3">
                      <label className="block text-xs text-gray-600 mb-1">Quantity (0-100)</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuantityValue(index, parseInt(e.target.value) || 0)}
                        min="0"
                        max="100"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-gray-600 mb-1">&nbsp;</label>
                      <button
                        onClick={() => removeMedicineRow(index)}
                        className="w-full bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition text-sm font-medium flex items-center justify-center space-x-1"
                      >
                        <TrashIcon className="h-4 w-4" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Add to Cart Button */}
            {selectedMedicines.length > 0 && (
              <div className="mt-4 pt-4 border-t-2 border-dashed border-gray-300">
                <button
                  onClick={addMultipleMedicines}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition flex items-center justify-center space-x-2 font-semibold shadow-md"
                >
                  <ShoppingCartIcon className="h-5 w-5" />
                  <span>Add to Cart ({selectedMedicines.filter(item => item.medicineId && item.medicineId !== '' && item.quantity > 0).length} items)</span>
                </button>
              </div>
            )}
            
            {/* Empty State */}
            {selectedMedicines.length === 0 && (
              <div className="text-center py-8 px-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                <PlusIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-600 font-medium">Click "Add Row" to add medicines</p>
                <p className="text-sm text-gray-500 mt-1">Enter quantity (0-100) for each medicine</p>
                <p className="text-xs text-gray-400 mt-2">All medicines will appear in ONE bill</p>
              </div>
            )}
          </div>
          
          {/* Cart Items - Shows all medicines */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4 pb-3 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                Cart ({cart.length} {cart.length === 1 ? 'item' : 'items'})
              </h2>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Clear All
                </button>
              )}
            </div>
            
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCartIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-500">Cart is empty</p>
                <p className="text-sm text-gray-400 mt-1">Add medicines using the form above</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr className="border-b-2 border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">#</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Medicine</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Price</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Qty</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">GST</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Total</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {cart.map((item, idx) => {
                      const itemTotal = item.price * item.quantity;
                      const itemGst = (itemTotal * item.gst) / 100;
                      const itemTotalWithGst = itemTotal + itemGst;
                      
                      return (
                        <tr key={item.medicineId} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.name}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-600">₹{item.price.toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm text-right">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateCartQuantity(item.medicineId, parseInt(e.target.value))}
                              min="0"
                              max="100"
                              className="w-20 px-2 py-1 border rounded text-center"
                            />
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-600">{item.gst}%</td>
                          <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">₹{itemTotalWithGst.toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm text-center">
                            <button onClick={() => removeFromCart(item.medicineId)} className="text-red-600 hover:text-red-800">
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr className="border-t-2 border-gray-300">
                      <td colSpan="5" className="px-4 py-3 text-right font-bold text-gray-800">Total Amount:</td>
                      <td className="px-4 py-3 text-right text-lg font-bold text-blue-600">₹{total.toFixed(2)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>
        
        {/* Right Column - Bill Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Bill Summary</h2>
            
            {cart.length > 0 && (
              <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-800 font-semibold">
                  ✓ {cart.length} {cart.length === 1 ? 'item' : 'items'} in this bill
                </p>
                <p className="text-xs text-green-600 mt-1">All items will appear on ONE invoice</p>
              </div>
            )}
            
            <div className="space-y-3 mt-4">
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium text-gray-800">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-t border-gray-200">
                <span className="text-gray-600">CGST (2.5%):</span>
                <span className="font-medium text-gray-800">₹{cgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">SGST (2.5%):</span>
                <span className="font-medium text-gray-800">₹{sgst.toFixed(2)}</span>
              </div>
              <div className="border-t-2 border-gray-300 pt-3 mt-2">
                <div className="flex justify-between">
                  <span className="text-lg font-bold text-gray-800">Total Amount:</span>
                  <span className="text-lg font-bold text-blue-600">₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={loading || cart.length === 0}
              className="w-full mt-6 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition disabled:opacity-50 shadow-md"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Bill...
                </span>
              ) : (
                `Generate Bill (${cart.length} item${cart.length === 1 ? '' : 's'})`
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Add New Medicine Modal */}
      {showMedicineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Add New Medicine</h2>
                <p className="text-sm text-gray-500 mt-1">Fill in the medicine details below</p>
              </div>
              <button onClick={() => setShowMedicineModal(false)} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleAddNewMedicine} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Medicine Name *</label>
                <input type="text" value={newMedicine.name} onChange={(e) => setNewMedicine({...newMedicine, name: e.target.value})} className="input-field" required />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Batch Number *</label>
                  <input type="text" value={newMedicine.batchNumber} onChange={(e) => setNewMedicine({...newMedicine, batchNumber: e.target.value})} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                  <input type="text" value={newMedicine.company} onChange={(e) => setNewMedicine({...newMedicine, company: e.target.value})} className="input-field" required />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date *</label>
                  <input type="date" value={newMedicine.expiryDate} onChange={(e) => setNewMedicine({...newMedicine, expiryDate: e.target.value})} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
                  <input type="number" value={newMedicine.quantity} onChange={(e) => setNewMedicine({...newMedicine, quantity: e.target.value})} className="input-field" required />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹) *</label>
                  <input type="number" step="0.01" value={newMedicine.price} onChange={(e) => setNewMedicine({...newMedicine, price: e.target.value})} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">GST (%) *</label>
                  <input type="number" step="0.1" value={newMedicine.gst} onChange={(e) => setNewMedicine({...newMedicine, gst: e.target.value})} className="input-field" required />
                  <p className="text-xs text-gray-500 mt-1">Common rates: 0%, 5%, 12%, 18%</p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
                <button type="button" onClick={() => setShowMedicineModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" disabled={addingMedicine} className="px-6 py-2 bg-blue-600 text-white rounded-lg">Add Medicine</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateBill;