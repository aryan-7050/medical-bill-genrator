import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

const LogoutButton = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition duration-200"
    >
      <ArrowRightOnRectangleIcon className="h-5 w-5" />
      <span>Logout</span>
    </button>
  );
};

export default LogoutButton;