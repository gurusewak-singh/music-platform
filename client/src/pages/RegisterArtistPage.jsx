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
     <div className="flex flex-col items-center justify-center py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-center text-gray-900">
          Join as an Artist
        </h2>
        {error && <Alert message={error} type="error" onClose={clearErrors} />}
        {passwordError && <Alert message={passwordError} type="error" onClose={() => setPasswordError('')} />}

        <form className="space-y-6" onSubmit={onSubmit}>
          <div>
            <label htmlFor="artistName" className="block text-sm font-medium text-gray-700">Artist Name / Band Name</label>
            <input id="artistName" name="artistName" type="text" required value={artistName} onChange={onChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
            <input id="username" name="username" type="text" required value={username} onChange={onChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
            <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={onChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input id="password" name="password" type="password" required value={password} onChange={onChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input id="confirmPassword" name="confirmPassword" type="password" required value={confirmPassword} onChange={onChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              Register as Artist
              {/* {isLoading ? <Spinner /> : 'Register as Artist'} */}
            </button>
          </div>
        </form>
        <p className="text-sm text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </p>
         <p className="text-sm text-center text-gray-600">
          Register as a regular user?{' '}
          <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterArtistPage;