import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBill } from '../services/api';
import { generatePDF, printInvoice } from '../services/pdfService';
import { DocumentArrowDownIcon, PrinterIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const InvoicePreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBill = useCallback(async () => {
    try {
      const response = await getBill(id);
      setBill(response.data);
    } catch (error) {
      console.error('Error fetching bill:', error);
      alert('Bill not found');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchBill();
  }, [fetchBill]);

  const handlePrint = () => {
    printInvoice('invoice-content');
  };

  const handleDownloadPDF = () => {
    generatePDF('invoice-content', `invoice-${bill?.billNumber}.pdf`);
  };

  // Fixed numberToWords function - no constant reassignment
  const numberToWords = (num) => {
    if (!num || num === 0) return 'Zero';
    
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    
    function convertLessThanThousand(n) {
      if (n === 0) return '';
      if (n < 10) return ones[n];
      if (n < 20) return teens[n - 10];
      if (n < 100) {
        const tensDigit = Math.floor(n / 10);
        const onesDigit = n % 10;
        return tens[tensDigit] + (onesDigit ? ' ' + ones[onesDigit] : '');
      }
      const hundredsDigit = Math.floor(n / 100);
      const remainder = n % 100;
      return ones[hundredsDigit] + ' Hundred' + (remainder ? ' ' + convertLessThanThousand(remainder) : '');
    }
    
    let amount = Math.floor(num);
    const paiseAmount = Math.round((num - amount) * 100);
    
    let result = '';
    
    // Crores
    if (amount >= 10000000) {
      const crores = Math.floor(amount / 10000000);
      result += convertLessThanThousand(crores) + ' Crore ';
      amount %= 10000000;
    }
    
    // Lakhs
    if (amount >= 100000) {
      const lakhs = Math.floor(amount / 100000);
      result += convertLessThanThousand(lakhs) + ' Lakh ';
      amount %= 100000;
    }
    
    // Thousands
    if (amount >= 1000) {
      const thousands = Math.floor(amount / 1000);
      result += convertLessThanThousand(thousands) + ' Thousand ';
      amount %= 1000;
    }
    
    // Hundreds
    if (amount >= 100) {
      const hundreds = Math.floor(amount / 100);
      result += convertLessThanThousand(hundreds) + ' Hundred ';
      amount %= 100;
    }
    
    // Tens and ones
    if (amount > 0) {
      result += convertLessThanThousand(amount);
    }
    
    result = result.trim();
    if (result === '') result = 'Zero';
    
    // Add paise
    if (paiseAmount > 0) {
      result += ' and ' + convertLessThanThousand(paiseAmount) + ' Paise';
    }
    
    return result;
  };

  // Calculate ETA if not present in bill
  const getETA = () => {
    if (bill?.eta) return bill.eta;
    if (bill?.createdAt) {
      const etaDate = new Date(new Date(bill.createdAt).getTime() + 30 * 60000);
      return etaDate.toLocaleTimeString();
    }
    return 'N/A';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loader"></div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Bill not found</p>
        <button onClick={() => navigate('/dashboard')} className="btn-primary mt-4">
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center no-print">
        <button
          onClick={() => navigate('/create-bill')}
          className="btn-secondary flex items-center space-x-2"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span>Back</span>
        </button>
        <div className="flex space-x-3">
          <button
            onClick={handlePrint}
            className="btn-secondary flex items-center space-x-2"
          >
            <PrinterIcon className="h-5 w-5" />
            <span>Print</span>
          </button>
          <button
            onClick={handleDownloadPDF}
            className="btn-primary flex items-center space-x-2"
          >
            <DocumentArrowDownIcon className="h-5 w-5" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>
      
      {/* Invoice Content */}
      <div id="invoice-content" className="bg-white rounded-lg shadow-md p-8 max-w-4xl mx-auto" style={{ fontFamily: 'Arial, sans-serif' }}>
        {/* Header */}
        <div className="text-center border-b-2 border-gray-300 pb-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">MEDICAL STORE</h1>
          <p className="text-gray-600 mt-2">Kunal Patilt</p>
          <p className="text-gray-600">Sadoli khalasa| Phone: +91 9570069396</p>

          <div className="mt-4 inline-block bg-blue-50 px-6 py-2 rounded-lg">
            <p className="text-xl font-bold text-blue-800">TAX INVOICE</p>
          </div>
        </div>
        
        {/* Bill Details */}
        <div className="flex justify-between mb-6 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-sm"><strong className="text-gray-700">Bill No:</strong> <span className="text-blue-600 font-semibold">{bill.billNumber}</span></p>
            <p className="text-sm mt-1"><strong className="text-gray-700">Date:</strong> {new Date(bill.createdAt).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm"><strong className="text-gray-700">Customer Name:</strong> {bill.customerName}</p>
            {bill.customerPhone && <p className="text-sm mt-1"><strong className="text-gray-700">Phone:</strong> {bill.customerPhone}</p>}
          </div>
        </div>
        
      
        {/* Items Table */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 border-b-2 border-gray-300">SL No</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 border-b-2 border-gray-300">Medicine Name</th>
                <th className="px-4 py-3 text-right text-sm font-bold text-gray-700 border-b-2 border-gray-300">Qty</th>
                <th className="px-4 py-3 text-right text-sm font-bold text-gray-700 border-b-2 border-gray-300">Rate (₹)</th>
                <th className="px-4 py-3 text-right text-sm font-bold text-gray-700 border-b-2 border-gray-300">GST (%)</th>
                <th className="px-4 py-3 text-right text-sm font-bold text-gray-700 border-b-2 border-gray-300">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {bill.items && bill.items.length > 0 ? (
                bill.items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{item.name}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600">{item.quantity}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600">₹{item.price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600">{item.gst}%</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-gray-800">₹{item.total.toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">No items found</td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50">
                <td colSpan="5" className="px-4 py-3 text-right font-bold text-gray-700">Total Items: {bill.items?.length || 0}</td>
                <td className="px-4 py-3 text-right font-bold text-gray-800">
                  ₹{bill.items?.reduce((sum, item) => sum + item.total, 0).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        {/* Totals */}
        <div className="flex justify-end mt-6">
          <div className="w-96">
            <div className="flex justify-between py-2">
              <span className="font-medium text-gray-700">Subtotal:</span>
              <span className="text-gray-800">₹{bill.subtotal?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-medium text-gray-700">CGST (2.5%):</span>
              <span className="text-gray-800">₹{bill.cgst?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-medium text-gray-700">SGST (2.5%):</span>
              <span className="text-gray-800">₹{bill.sgst?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between py-3 mt-2 border-t-2 border-gray-300 bg-blue-50 px-4 rounded-lg">
              <span className="font-bold text-lg text-gray-800">Net Amount:</span>
              <span className="font-bold text-xl text-blue-600">₹{bill.totalAmount?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        </div>
        
        {/* Amount in Words */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <strong>Amount in Words:</strong> Rupees {numberToWords(bill.totalAmount)} Only
          </p>
        </div>
        
        {/* Footer */}
        <div className="border-t-2 border-gray-300 mt-8 pt-6">
         
          <div className="flex justify-between mt-6 pt-4">
            <div className="text-left">
              <p className="text-xs text-gray-500">Authorized Signature</p>
              <div className="mt-8 border-t-2 border-gray-300 w-40"></div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">For MEDICAL STORE</p>
              <div className="mt-8 border-t-2 border-gray-300 w-40"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;