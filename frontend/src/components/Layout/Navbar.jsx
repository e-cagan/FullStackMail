import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import UserDropdown from './UserDropdown';

const Navbar = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link to="/" className="font-bold text-xl">IsMailSpam</Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            {currentUser ? (
              <>
                <Link to="/dashboard" className="hover:text-blue-200">Dashboard</Link>
                <Link to="/compose" className="hover:text-blue-200">Compose</Link>
                <UserDropdown currentUser={currentUser} handleLogout={logout} />
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-blue-200">Login</Link>
                <Link to="/register" className="hover:text-blue-200">Register</Link>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="focus:outline-none">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden pb-4">
            {currentUser ? (
              <>
                <Link to="/dashboard" className="block py-2 hover:text-blue-200">Dashboard</Link>
                <Link to="/compose" className="block py-2 hover:text-blue-200">Compose</Link>
                <Link to="/change-password" className="block py-2 hover:text-blue-200">Change Password</Link>
                <Link to="/settings" className="block py-2 hover:text-blue-200">Settings</Link>
                <button 
                  onClick={handleLogout} 
                  className="block w-full text-left py-2 hover:text-blue-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2 hover:text-blue-200">Login</Link>
                <Link to="/register" className="block py-2 hover:text-blue-200">Register</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;