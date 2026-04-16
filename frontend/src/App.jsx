import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import MedicineForm from './components/MedicineForm';
import MedicineList from './components/MedicineList';
import CreateBill from './components/CreateBill';
import InvoicePreview from './components/InvoicePreview';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" />;
  }
  return children;
};

// Admin Route component
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <>
              <Navbar />
              <div className="container mx-auto px-4 py-8">
                <Dashboard />
              </div>
            </>
          </ProtectedRoute>
        } />
        
        <Route path="/medicines" element={
          <ProtectedRoute>
            <>
              <Navbar />
              <div className="container mx-auto px-4 py-8">
                <MedicineList />
              </div>
            </>
          </ProtectedRoute>
        } />
        
        <Route path="/add-medicine" element={
          <AdminRoute>
            <>
              <Navbar />
              <div className="container mx-auto px-4 py-8">
                <MedicineForm />
              </div>
            </>
          </AdminRoute>
        } />
        
        <Route path="/edit-medicine/:id" element={
          <AdminRoute>
            <>
              <Navbar />
              <div className="container mx-auto px-4 py-8">
                <MedicineForm />
              </div>
            </>
          </AdminRoute>
        } />
        
        <Route path="/create-bill" element={
          <ProtectedRoute>
            <>
              <Navbar />
              <div className="container mx-auto px-4 py-8">
                <CreateBill />
              </div>
            </>
          </ProtectedRoute>
        } />
        
        <Route path="/invoice/:id" element={
          <ProtectedRoute>
            <>
              <Navbar />
              <div className="container mx-auto px-4 py-8">
                <InvoicePreview />
              </div>
            </>
          </ProtectedRoute>
        } />
        
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;