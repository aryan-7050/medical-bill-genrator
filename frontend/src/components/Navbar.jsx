import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  HomeIcon, 
  PlusCircleIcon, 
  ShoppingCartIcon, 
  DocumentTextIcon,
  BeakerIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Get user from localStorage
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Medicines', href: '/medicines', icon: BeakerIcon },
    { name: 'Add Medicine', href: '/add-medicine', icon: PlusCircleIcon, adminOnly: true },
    { name: 'Create Bill', href: '/create-bill', icon: ShoppingCartIcon },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <nav className="bg-blue-700 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo Section */}
            <div className="flex items-center space-x-2">
              <DocumentTextIcon className="h-8 w-8" />
              <span className="font-bold text-xl">MediBill Pro</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {navigation.map((item) => {
                if (item.adminOnly && user?.role !== 'admin') return null;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition duration-200 ${
                      isActive
                        ? 'bg-blue-800 text-white'
                        : 'text-blue-100 hover:bg-blue-600'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              {/* User Info & Logout - Desktop */}
              <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-blue-500">
                <div className="flex items-center space-x-2">
                  <UserCircleIcon className="h-6 w-6" />
                  <span className="text-sm">{user?.name || 'User'}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-red-300 hover:text-red-100 transition duration-200"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
            
            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-3">
              {/* User Icon for Mobile */}
              <UserCircleIcon className="h-6 w-6" />
              <button
                onClick={toggleMobileMenu}
                className="text-white focus:outline-none"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-blue-800 border-t border-blue-600 animate-slideDown">
            <div className="container mx-auto px-4 py-3 space-y-2">
              {/* Navigation Links */}
              {navigation.map((item) => {
                if (item.adminOnly && user?.role !== 'admin') return null;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition duration-200 ${
                      isActive
                        ? 'bg-blue-900 text-white'
                        : 'text-blue-100 hover:bg-blue-700'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              {/* Divider */}
              <div className="border-t border-blue-600 my-2"></div>
              
              {/* User Info & Logout - Mobile */}
              <div className="px-3 py-2">
                <div className="flex items-center space-x-2 mb-3">
                  <UserCircleIcon className="h-6 w-6 text-blue-200" />
                  <div>
                    <p className="text-sm font-medium">{user?.name || 'User'}</p>
                    <p className="text-xs text-blue-200">{user?.email || ''}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition duration-200"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default Navbar;