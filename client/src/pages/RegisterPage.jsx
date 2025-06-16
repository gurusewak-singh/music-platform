// client/src/pages/RegisterPage.jsx
import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Alert from '../components/ui/Alert';
// import Spinner from '../components/ui/Spinner';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, error, isLoading, clearErrors } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const { username, email, password, confirmPassword } = formData;
  const [passwordError, setPasswordError] = useState('');

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
  `;

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/'); // Redirect if already logged in
    }
     if (error) {
      // console.log(error);
    }
  }, [isAuthenticated, navigate, error]);

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    setPasswordError('');
    clearErrors();
    register({ username, email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8">
      <div className="max-w-md w-full bg-white p-6 sm:p-8 rounded-xl shadow-2xl mx-4">
        <h2 className="text-3xl font-bold text-center text-gray-900">
          Create Your Account
        </h2>
        {error && <Alert message={error} type="error" onClose={clearErrors} />}
        {passwordError && <Alert message={passwordError} type="error" onClose={() => setPasswordError('')} />}

        <form className="space-y-6" onSubmit={onSubmit}>
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <input
              id="username" name="username" type="text" required value={username} onChange={onChange}
              className={inputClasses}
              disabled={isLoading}
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email address
            </label>
            <input
              id="email" name="email" type="email" autoComplete="email" required value={email} onChange={onChange}
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
              id="password" name="password" type="password" required value={password} onChange={onChange}
              className={inputClasses}
              disabled={isLoading}
            />
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword" name="confirmPassword" type="password" required value={confirmPassword} onChange={onChange}
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
              {isLoading ? 'Processing...' : 'Sign up'}
            </button>
          </div>
        </form>
        <div className="text-sm text-center space-y-2 mt-6">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium transition-colors"
              style={{ color: theme.link }}
              onMouseOver={e => e.currentTarget.style.color = theme.linkHover}
              onMouseOut={e => e.currentTarget.style.color = theme.link}
            >
              Sign in
            </Link>
          </p>
          <p className="text-gray-600">
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

export default RegisterPage;