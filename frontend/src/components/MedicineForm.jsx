import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMedicine, createMedicine, updateMedicine } from '../services/api';

const MedicineForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    batchNumber: '',
    expiryDate: '',
    price: '',
    gst: '',
    quantity: '',
    company: ''
  });

  useEffect(() => {
    if (id) {
      fetchMedicine();
    }
  }, [id]);

  const fetchMedicine = async () => {
    try {
      const response = await getMedicine(id);
      const medicine = response.data;
      setFormData({
        name: medicine.name,
        batchNumber: medicine.batchNumber,
        expiryDate: medicine.expiryDate.split('T')[0],
        price: medicine.price,
        gst: medicine.gst,
        quantity: medicine.quantity,
        company: medicine.company
      });
    } catch (error) {
      console.error('Error fetching medicine:', error);
      alert('Error fetching medicine details');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      alert('Please enter medicine name');
      return false;
    }
    if (!formData.batchNumber.trim()) {
      alert('Please enter batch number');
      return false;
    }
    if (!formData.expiryDate) {
      alert('Please select expiry date');
      return false;
    }
    const expiryDateObj = new Date(formData.expiryDate);
    const today = new Date();
    if (expiryDateObj < today) {
      alert('Expiry date cannot be in the past');
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      alert('Please enter a valid price');
      return false;
    }
    if (!formData.gst || parseFloat(formData.gst) < 0 || parseFloat(formData.gst) > 100) {
      alert('Please enter a valid GST percentage (0-100)');
      return false;
    }
    if (!formData.quantity || parseInt(formData.quantity) < 0) {
      alert('Please enter a valid quantity');
      return false;
    }
    if (!formData.company.trim()) {
      alert('Please enter company name');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price),
        gst: parseFloat(formData.gst),
        quantity: parseInt(formData.quantity)
      };
      
      if (id) {
        await updateMedicine(id, data);
        alert('Medicine updated successfully!');
      } else {
        await createMedicine(data);
        alert('Medicine added successfully!');
      }
      navigate('/medicines');
    } catch (error) {
      console.error('Error saving medicine:', error);
      alert(error.response?.data?.message || 'Error saving medicine');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          {id ? 'Edit Medicine' : 'Add New Medicine'}
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Medicine Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="Enter medicine name"
              autoFocus
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Batch Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="batchNumber"
                value={formData.batchNumber}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="Enter batch number"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="Enter company name"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                required
                className="input-field"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                min="0"
                step="1"
                className="input-field"
                placeholder="Enter quantity"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="input-field"
                placeholder="Enter price"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GST (%) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="gst"
                value={formData.gst}
                onChange={handleChange}
                required
                min="0"
                max="100"
                step="0.1"
                className="input-field"
                placeholder="Enter GST percentage"
              />
              <p className="text-xs text-gray-500 mt-1">Common GST rates: 0%, 5%, 12%, 18%</p>
            </div>
          </div>
          
          {/* Preview Section */}
          {formData.price && formData.gst && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Price Preview:</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Base Price:</span>
                  <span>₹{parseFloat(formData.price || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST Amount ({formData.gst}%):</span>
                  <span>₹{((parseFloat(formData.price || 0) * parseFloat(formData.gst || 0)) / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold pt-1 border-t">
                  <span>Selling Price:</span>
                  <span className="text-blue-600">
                    ₹{(parseFloat(formData.price || 0) + (parseFloat(formData.price || 0) * parseFloat(formData.gst || 0)) / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/medicines')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                id ? 'Update Medicine' : 'Add Medicine'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MedicineForm;