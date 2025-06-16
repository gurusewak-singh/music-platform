// client/src/App.js (or App.jsx)
import React, { useContext } from 'react';
import AppRouter from './routes/AppRouter';
import { AuthContext } from './context/AuthContext'; // Import AuthContext
import GlobalSpinner from './components/ui/GlobalSpinner'; // Import GlobalSpinner
import { ToastContainer } from 'react-toastify'; // Import ToastContainer
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const { isLoading: isAuthLoading } = useContext(AuthContext); // Get isLoading from AuthContext

  // You might have other loading states from other contexts in the future.
  // For now, we'll just use the auth loading state.
  const showGlobalSpinner = isAuthLoading;

  return (
    <> {/* Use a Fragment to avoid an unnecessary div */}
      <AppRouter />
      <GlobalSpinner isLoading={showGlobalSpinner} /> {/* Render GlobalSpinner conditionally */}
      <ToastContainer // Add ToastContainer here
        position="top-right"
        autoClose={4000} // Auto close after 4 seconds
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored" // Or "light", "dark"
      />
    </>
  );
}

export default App;