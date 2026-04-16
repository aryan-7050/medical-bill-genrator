import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMedicines, getLowStockMedicines, getBills, deleteBill } from '../services/api';
import { 
  CubeIcon, 
  CurrencyRupeeIcon, 
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ShoppingCartIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalMedicines: 0,
    totalStock: 0,
    totalBills: 0,
    totalRevenue: 0
  });
  const [lowStockMedicines, setLowStockMedicines] = useState([]);
  const [recentBills, setRecentBills] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [medicinesRes, lowStockRes, billsRes] = await Promise.all([
        getMedicines(),
        getLowStockMedicines(),
        getBills()
      ]);
      
      const medicines = medicinesRes.data;
      const bills = billsRes.data;
      
      const totalStock = medicines.reduce((sum, med) => sum + med.quantity, 0);
      const totalRevenue = bills.reduce((sum, bill) => sum + bill.totalAmount, 0);
      
      setStats({
        totalMedicines: medicines.length,
        totalStock: totalStock,
        totalBills: bills.length,
        totalRevenue: totalRevenue
      });
      
      setLowStockMedicines(lowStockRes.data);
      setRecentBills(bills.slice(0, 10)); // Show 10 recent bills
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const handleDeleteBill = async (billId, billNumber) => {
    if (window.confirm(`Are you sure you want to delete Bill ${billNumber}? This will restore the stock.`)) {
      try {
        await deleteBill(billId);
        alert('Bill deleted successfully and stock restored!');
        fetchDashboardData(); // Refresh data
      } catch (error) {
        console.error('Error deleting bill:', error);
        alert('Error deleting bill');
      }
    }
  };

  const statCards = [
    { title: 'Total Medicines', value: stats.totalMedicines, icon: CubeIcon, color: 'bg-blue-500' },
    { title: 'Total Stock', value: stats.totalStock, icon: CubeIcon, color: 'bg-green-500' },
    { title: 'Total Bills', value: stats.totalBills, icon: ShoppingCartIcon, color: 'bg-purple-500' },
    { title: 'Total Revenue', value: `₹${stats.totalRevenue.toFixed(2)}`, icon: CurrencyRupeeIcon, color: 'bg-yellow-500' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{stat.title}</p>
                <p className="text-2xl font-bold mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-full`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>
      
    
      
      {/* Recent Bills with Delete Option */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Bills</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bill Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentBills.map((bill) => (
                <tr key={bill._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {bill.billNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {bill.customerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(bill.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{bill.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => navigate(`/invoice/${bill._id}`)}
                      className="text-blue-600 hover:text-blue-900"
                      title="View Bill"
                    >
                      <EyeIcon className="h-5 w-5 inline" />
                    </button>
                    <button
                      onClick={() => handleDeleteBill(bill._id, bill.billNumber)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete Bill"
                    >
                      <TrashIcon className="h-5 w-5 inline" />
                    </button>
                   </td>
                 </tr>
              ))}
              {recentBills.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">
                    No bills found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;