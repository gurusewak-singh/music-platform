// client/src/components/ui/AuthPromptModal.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiAlertTriangle, FiLogIn, FiUserPlus, FiX } from 'react-icons/fi';

const AuthPromptModal = ({ isOpen, onClose, message, redirectTo = '/login', fromPath }) => {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Delay showing the modal slightly to allow animation to play on mount
      const timer = setTimeout(() => setShow(true), 50); // Small delay for entry animation
      return () => clearTimeout(timer);
    } else {
      setShow(false); // This will trigger exit animation if configured
    }
  }, [isOpen]);

  const handleNavigate = (path) => {
    onClose(); // Close modal first
    navigate(path, { state: { from: fromPath || window.location.pathname + window.location.search } });
  };

  if (!isOpen && !show) { // Ensure modal is fully unmounted after exit animation (if any) or if not open
      return null;
  }

  // Tailwind classes for transition (opacity and scale)
  const modalTransition = show
    ? 'opacity-100 scale-100'
    : 'opacity-0 scale-95';

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ease-out ${show ? 'bg-black bg-opacity-75 backdrop-blur-sm' : 'bg-opacity-0 pointer-events-none'}`}
      onClick={onClose} // Close on backdrop click
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 ease-out overflow-y-auto max-h-[80vh]"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <div className="p-6 text-center">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
            aria-label="Close modal"
          >
            <FiX size={20} />
          </button>

          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white mb-5 shadow-lg">
            <FiAlertTriangle size={32} />
          </div>

          <h3 className="text-2xl font-semibold text-gray-800 mb-3">
            Authentication Required
          </h3>
          <p className="text-gray-600 mb-6 px-4">
            {message || 'You need to be logged in to access this feature.'}
          </p>

          <div className="space-y-3 sm:space-y-0 sm:flex sm:space-x-4 justify-center">
            <button
              onClick={() => handleNavigate('/login')}
              className="w-full sm:w-auto flex items-center justify-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <FiLogIn className="mr-2 -ml-1" /> Login
            </button>
            <button
              onClick={() => handleNavigate('/register')}
              className="w-full sm:w-auto flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <FiUserPlus className="mr-2 -ml-1" /> Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPromptModal;