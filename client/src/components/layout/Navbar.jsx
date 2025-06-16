// client/src/components/layout/Navbar.jsx
import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import SearchBar from '../ui/SearchBar';
import { FiMusic, FiLogIn, FiLogOut, FiUserPlus, FiUploadCloud, FiShield, FiList, FiMenu, FiX } from 'react-icons/fi';

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, isLoading } = useContext(AuthContext);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Theme colors for Navbar
  const theme = {
    navbarBg: '#3949ac',
    linkText: '#ffffff',
    linkHoverBg: '#5d6cc0',
    linkHoverText: '#ffffff',
    usernameText: '#c4c9e9',
    logoText: '#ffffff',
  };

  const onLogout = () => {
    logout();
    navigate('/');
  };

  // Common link classes for consistency
  const commonLinkClasses = "px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors duration-150";

  const authLinks = (
    <>
      {user && user.role === 'admin' && (
        <Link 
          to="/admin-dashboard" 
          className={commonLinkClasses}
          style={{ color: theme.linkText }}
          onMouseOver={e => { e.currentTarget.style.backgroundColor = theme.linkHoverBg; e.currentTarget.style.color = theme.linkHoverText; }}
          onMouseOut={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = theme.linkText; }}
        >
          <FiShield className="mr-1" /> Admin
        </Link>
      )}
      {((user && user.role === 'artist' && user.isVerifiedArtist) || user?.role === 'admin') && (
         <Link 
            to="/upload-song" 
            className={commonLinkClasses}
            style={{ color: theme.linkText }}
            onMouseOver={e => { e.currentTarget.style.backgroundColor = theme.linkHoverBg; e.currentTarget.style.color = theme.linkHoverText; }}
            onMouseOut={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = theme.linkText; }}
          >
           <FiUploadCloud className="mr-1" /> Upload
         </Link>
      )}
      <Link 
        to="/my-playlists" 
        className={commonLinkClasses}
        style={{ color: theme.linkText }}
        onMouseOver={e => { e.currentTarget.style.backgroundColor = theme.linkHoverBg; e.currentTarget.style.color = theme.linkHoverText; }}
        onMouseOut={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = theme.linkText; }}
      >
        <FiList className="mr-1" /> My Playlists
      </Link>
      <span className="px-3 py-2 text-sm font-medium" style={{ color: theme.usernameText }}>
        Hi, {user?.username || user?.artistName}
      </span>
      <button
        onClick={onLogout}
        className={commonLinkClasses}
        style={{ color: theme.linkText }}
        onMouseOver={e => { e.currentTarget.style.backgroundColor = theme.linkHoverBg; e.currentTarget.style.color = theme.linkHoverText; }}
        onMouseOut={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = theme.linkText; }}
      >
        <FiLogOut className="mr-1" /> Logout
      </button>
    </>
  );

  const guestLinks = (
    <>
      <Link 
        to="/register" 
        className={commonLinkClasses}
        style={{ color: theme.linkText }}
        onMouseOver={e => { e.currentTarget.style.backgroundColor = theme.linkHoverBg; e.currentTarget.style.color = theme.linkHoverText; }}
        onMouseOut={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = theme.linkText; }}
      >
        <FiUserPlus className="mr-1" /> Register
      </Link>
      <Link 
        to="/login" 
        className={commonLinkClasses}
        style={{ color: theme.linkText }}
        onMouseOver={e => { e.currentTarget.style.backgroundColor = theme.linkHoverBg; e.currentTarget.style.color = theme.linkHoverText; }}
        onMouseOut={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = theme.linkText; }}
      >
        <FiLogIn className="mr-1" /> Login
      </Link>
    </>
  );

  return (
    <nav style={{ backgroundColor: theme.navbarBg }} className="shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center" style={{ color: theme.logoText }}>
              <FiMusic size={24} className="mr-2" />
              <span className="font-bold text-xl">MusicHub</span>
            </Link>
          </div>

          {/* Search Bar in the middle for wider screens */}
          <div className="hidden md:flex flex-grow justify-center px-4">
            <SearchBar />
          </div>

          {/* Desktop Links (hidden on mobile) */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {isLoading ? null : (isAuthenticated ? authLinks : guestLinks)}
            </div>
          </div>

          {/* Hamburger Button (shown on mobile) */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-label="Open main menu"
            >
              {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
        {/* Mobile SearchBar (your existing implementation) */}
        <div className="md:hidden flex justify-center py-2 border-t" style={{ borderColor: theme.linkHoverBg }}>
            <SearchBar />
        </div>
      </div>
      {/* Mobile Menu Dropdown (conditionally rendered) */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#303a7c] p-4 space-y-2">
          {isLoading ? null : (isAuthenticated ? (
            <div className="space-y-2 flex flex-col">
              {authLinks}
            </div>
          ) : (
            <div className="space-y-2 flex flex-col">
              {guestLinks}
            </div>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;