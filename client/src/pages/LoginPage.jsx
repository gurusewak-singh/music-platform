// client/src/pages/LoginPage.jsx
import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Alert from '../components/ui/Alert';
// GlobalSpinner will be handled by App.js, so we don't need local Spinner here if using global one for auth
// import Spinner from '../components/ui/Spinner';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, error, isLoading, clearErrors } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { email, password } = formData;

  useEffect(() => {
    if (isAuthenticated && !isLoading) { // Ensure not loading before redirect
      navigate('/'); // Redirect if already logged in and not in an intermediate loading state
    }
    // No need to return clearErrors from here unless you specifically want it on unmount for this page
  }, [isAuthenticated, isLoading, navigate]);

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      // Basic client-side check, though backend handles robust validation
      // You could set a local error state here if desired for "Please fill all fields"
      return;
    }
    clearErrors(); // Clear previous server errors
    login({ email, password });
  };

  return (
    // This div centers the form within the <main> content area from AppRouter
    // py-12 adds vertical padding. Adjust as needed for your design.
    // sm:px-6 lg:px-8 adds horizontal padding for different screen sizes.
    <div className="flex flex-col items-center justify-center py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md"> {/* Increased shadow */}
        <h2 className="text-3xl font-bold text-center text-gray-900">
          Login to Your Account
        </h2>

        {/* Display server errors */}
        {error && <Alert message={error} type="error" onClose={clearErrors} />}

        <form className="space-y-6" onSubmit={onSubmit}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={onChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              disabled={isLoading} // Disable input while loading
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={onChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              disabled={isLoading} // Disable input while loading
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading} // Button is disabled by isLoading from AuthContext
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {/* Text remains, global spinner handles visual loading state */}
              Sign in
            </button>
            {/* Debugging <p> tags removed for cleaner UI, use React DevTools or console.log for state inspection */}
          </div>
        </form>

        <div className="text-sm text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign up
            </Link>
          </p>
          <p className="mt-2 text-gray-600">
            Are you an Artist?{' '}
            <Link to="/register-artist" className="font-medium text-indigo-600 hover:text-indigo-500">
              Join here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;