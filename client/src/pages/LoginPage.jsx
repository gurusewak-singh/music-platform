// client/src/pages/LoginPage.jsx
import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Alert from '../components/ui/Alert';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, error, isLoading, clearErrors } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [redirectMessage, setRedirectMessage] = useState('');

  const { email, password } = formData;

  // Theme colors
  const theme = {
    primary: '#3949ac',
    secondary: '#5d6cc0',
    accent: '#7b88cc',
    buttonText: '#ffffff',
    link: '#5d6cc0',
    linkHover: '#3949ac',
    inputFocusBorder: '#3949ac',
    inputFocusRing: '#7b88cc',
  };

  // Helper for input classes
  const inputClasses = `
    mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400
    focus:outline-none
    focus:border-[${theme.inputFocusBorder}]
    focus:ring-1 focus:ring-[${theme.inputFocusRing}]
    sm:text-sm
  `;

  useEffect(() => {
    // Check for redirect message from location state
    if (location.state && location.state.message) {
      setRedirectMessage(location.state.message);
      // Clear the message from location state to prevent it from showing again on refresh/re-navigation
      // This replaces the history entry without the state.
      navigate(location.pathname, { replace: true, state: {} });
    }

    if (isAuthenticated && !isLoading) {
      // If there was a 'from' path in state (where user was before redirect), go there
      // Otherwise, go to home.
      const fromPath = location.state?.from || '/';
      navigate(fromPath, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, location]);

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return;
    }
    clearErrors();
    setRedirectMessage(''); // Clear redirect message on new login attempt
    login({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8">
      <div className="max-w-md w-full bg-white p-6 sm:p-8 rounded-xl shadow-2xl mx-4">
        <h2 className="text-3xl font-bold text-center text-gray-900">
          Login to Your Account
        </h2>

        {/* Display redirect message if it exists */}
        {redirectMessage && <Alert message={redirectMessage} type="info" onClose={() => setRedirectMessage('')} />}

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
              className={inputClasses}
              disabled={isLoading}
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
              className={inputClasses}
              disabled={isLoading}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              style={{
                backgroundColor: isLoading ? theme.accent : theme.primary,
                color: theme.buttonText,
                borderColor: isLoading ? theme.accent : theme.primary,
                '--tw-ring-color': theme.accent,
              }}
              onMouseOver={e => { if (!isLoading) e.currentTarget.style.backgroundColor = theme.secondary; }}
              onMouseOut={e => { if (!isLoading) e.currentTarget.style.backgroundColor = theme.primary; }}
            >
              {isLoading ? 'Processing...' : 'Sign in'}
            </button>
          </div>
        </form>

        <div className="text-sm text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-medium transition-colors"
              style={{ color: theme.link }}
              onMouseOver={e => e.currentTarget.style.color = theme.linkHover}
              onMouseOut={e => e.currentTarget.style.color = theme.link}
            >
              Sign up
            </Link>
          </p>
          <p className="mt-2 text-gray-600">
            Are you an Artist?{' '}
            <Link
              to="/register-artist"
              className="font-medium transition-colors"
              style={{ color: theme.link }}
              onMouseOver={e => e.currentTarget.style.color = theme.linkHover}
              onMouseOut={e => e.currentTarget.style.color = theme.link}
            >
              Join here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;