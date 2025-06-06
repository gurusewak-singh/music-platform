// client/src/routes/ProtectedRoutes.jsx
import React, { useContext } from 'react';
import { Navigate, Outlet, useLocation, Link } from 'react-router-dom'; // Added Link
import { AuthContext } from '../context/AuthContext';
import Spinner from '../components/ui/Spinner';

// Add a new prop 'requiresVerifiedArtist'
const ProtectedRoute = ({ allowedRoles, requiresVerifiedArtist = false }) => {
  const { isAuthenticated, isLoading, user } = useContext(AuthContext);
  const location = useLocation();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" state={{ from: location }} replace />; // Or an unauthorized page
  }

  // New check for verified artist status
  if (requiresVerifiedArtist && user && user.role === 'artist' && !user.isVerifiedArtist) {
    // Redirect to a page informing them their artist account is pending verification
    // Or show a message directly. For simplicity, let's redirect to a simple message page or home.
    return (
      <div className="flex flex-col items-center justify-center text-center py-10">
        <h2 className="text-2xl font-semibold mb-4">Verification Pending</h2>
        <p className="mb-6 text-gray-600">
          Your artist account is awaiting verification by an admin.
          You'll be able to upload music once verified.
        </p>
        <Link to="/" className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
          Go to Homepage
        </Link>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;