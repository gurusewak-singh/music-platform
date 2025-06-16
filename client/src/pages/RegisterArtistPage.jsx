// client/src/pages/RegisterArtistPage.jsx
import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Alert from '../components/ui/Alert';
// import Spinner from '../components/ui/Spinner';


const RegisterArtistPage = () => {
  const navigate = useNavigate();
  const { registerArtist, isAuthenticated, error, isLoading, clearErrors } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    artistName: '',
  });

  const { username, email, password, confirmPassword, artistName } = formData;
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/'); // Redirect if already logged in
    }
    // Handle error display or clearing
  }, [isAuthenticated, navigate]);

  // Theme colors
  const theme = {
    primary: '#3949ac',
    secondary: '#5d6cc0',
    accent: '#7b88cc', // For focus rings perhaps
    buttonText: '#ffffff',
    link: '#5d6cc0', // Secondary color for links
    linkHover: '#3949ac', // Primary color for link hover
    inputFocusBorder: '#3949ac', // Primary for input border focus
    inputFocusRing: '#7b88cc',   // Accent for input ring focus
  };

  // Helper for input classes (to avoid repetition)
  const inputClasses = `
    mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
    focus:outline-none 
    focus:border-[${theme.inputFocusBorder}] 
    focus:ring-1 focus:ring-[${theme.inputFocusRing}]
  `;

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
    if (!artistName.trim()) {
      // You can use a proper alert for this
      setPasswordError('Artist name is required');
      return;
    }
    setPasswordError('');
    clearErrors();
    registerArtist({ username, email, password, artistName });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8">
      <div className="max-w-md w-full bg-white p-6 sm:p-8 rounded-xl shadow-2xl mx-4">
        <h2 className="text-3xl font-bold text-center text-gray-800">
          Join as an <span style={{ color: theme.primary }}>Artist</span>
        </h2>
        {error && <Alert message={error} type="error" onClose={clearErrors} />}
        {passwordError && <Alert message={passwordError} type="error" onClose={() => setPasswordError('')} />}

        <form className="space-y-6" onSubmit={onSubmit}>
          <div>
            <label htmlFor="artistName" className="block text-sm font-medium text-gray-700">Artist Name / Band Name <span className="text-red-500">*</span></label>
            <input id="artistName" name="artistName" type="text" required value={artistName} onChange={onChange}
              className={inputClasses} 
              disabled={isLoading}/>
          </div>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username <span className="text-red-500">*</span></label>
            <input id="username" name="username" type="text" required value={username} onChange={onChange}
              className={inputClasses} 
              disabled={isLoading}/>
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address <span className="text-red-500">*</span></label>
            <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={onChange}
              className={inputClasses} 
              disabled={isLoading}/>
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password <span className="text-red-500">*</span></label>
            <input id="password" name="password" type="password" required value={password} onChange={onChange}
              className={inputClasses} 
              disabled={isLoading}/>
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password <span className="text-red-500">*</span></label>
            <input id="confirmPassword" name="confirmPassword" type="password" required value={confirmPassword} onChange={onChange}
              className={inputClasses} 
              disabled={isLoading}/>
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
              {isLoading ? 'Processing...' : 'Register as Artist'}
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
            Register as a regular user?{' '}
            <Link 
              to="/register" 
              className="font-medium transition-colors"
              style={{ color: theme.link }}
              onMouseOver={e => e.currentTarget.style.color = theme.linkHover}
              onMouseOut={e => e.currentTarget.style.color = theme.link}
            >
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterArtistPage;