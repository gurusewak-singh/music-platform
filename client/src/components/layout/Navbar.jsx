// client/src/components/layout/Navbar.jsx
import React, { useContext, Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FiMusic, FiUser, FiLogIn, FiLogOut, FiUserPlus, FiUploadCloud, FiShield, FiList } from 'react-icons/fi'; // Example icons

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, isLoading } = useContext(AuthContext);

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  const authLinks = (
    <>
      {user && user.role === 'admin' && (
        <Link to="/admin-dashboard" className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-indigo-500 hover:text-white flex items-center">
          <FiShield className="mr-1" /> Admin
        </Link>
      )}
      {(user && (user.role === 'artist' && user.isVerifiedArtist) || user?.role === 'admin') && (
         <Link to="/upload-song" className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-indigo-500 hover:text-white flex items-center">
           <FiUploadCloud className="mr-1" /> Upload
         </Link>
      )}
      <Link to="/my-playlists" className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-indigo-500 hover:text-white flex items-center">
        <FiList className="mr-1" /> My Playlists
      </Link>
      <span className="px-3 py-2 text-sm font-medium text-indigo-200">
        Hi, {user?.username || user?.artistName}
      </span>
      <button
        onClick={onLogout}
        className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-indigo-500 hover:text-white flex items-center"
      >
        <FiLogOut className="mr-1" /> Logout
      </button>
    </>
  );

  const guestLinks = (
    <>
      <Link to="/register" className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-indigo-500 hover:text-white flex items-center">
        <FiUserPlus className="mr-1" /> Register
      </Link>
      <Link to="/login" className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-indigo-500 hover:text-white flex items-center">
        <FiLogIn className="mr-1" /> Login
      </Link>
    </>
  );

  return (
    <nav className="bg-indigo-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 text-white flex items-center">
              <FiMusic size={24} className="mr-2" />
              <span className="font-bold text-xl">MusicHub</span>
            </Link>
            {/* Future Nav Links like Home, Browse can go here */}
            {/* <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link to="/" className="text-gray-300 hover:bg-indigo-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Home</Link>
              </div>
            </div> */}
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {isLoading ? null : (isAuthenticated ? authLinks : guestLinks)}
            </div>
          </div>
          {/* Mobile menu button (can implement later) */}
          {/* <div className="-mr-2 flex md:hidden">
             ...
          </div> */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;