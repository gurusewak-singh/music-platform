// client/src/components/ui/SearchBar.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import _debounce from 'lodash/debounce';

const SearchBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Helper to get query from URL
  const getQueryFromUrl = () => new URLSearchParams(location.search).get('q') || '';

  const [inputValue, setInputValue] = useState(getQueryFromUrl());

  // Effect to sync inputValue with URL q param, e.g. on browser back/forward
  useEffect(() => {
    const currentUrlQuery = getQueryFromUrl();
    if (currentUrlQuery !== inputValue) {
      setInputValue(currentUrlQuery);
    }
  }, [location.search]); // Only re-run if the search part of the URL changes

  // Debounced navigation function
  const debouncedNavigate = useCallback(
    _debounce((query) => {
      if (query.trim()) {
        navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      } else {
        // If search term is cleared, and we are on search page, clear the query param
        if (location.pathname === '/search') {
          navigate('/search'); // Navigates to /search without query param
        }
        // If on another page and search is cleared, do nothing (or navigate to home, etc.)
      }
    }, 500), // 500ms debounce delay
    [navigate, location.pathname] // Dependencies for useCallback
  );

  const handleInputChange = (e) => {
    const newQuery = e.target.value;
    setInputValue(newQuery); // Update input field immediately
    debouncedNavigate(newQuery); // Call debounced navigation
  };

  // Handle explicit form submission (e.g., pressing Enter)
  const handleSubmit = (e) => {
    e.preventDefault();
    debouncedNavigate.cancel(); // Cancel any pending debounced call
    const trimmedQuery = inputValue.trim();
    if (trimmedQuery) {
      navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    } else if (location.pathname === '/search') {
      // If on search page and submitted empty, clear the query
      navigate('/search');
    }
    // If not on search page and submitted empty, do nothing
  };

  // Define theme colors for use here (or import from a central theme file)
  const theme = {
    searchBarBg: '#5d6cc0', // Secondary color for background
    searchBarFocusBg: '#3949ac', // Primary color for focused background
    searchBarPlaceholderText: '#c4c9e9', // Lightest for placeholder text
    searchBarText: '#ffffff', // White text in search bar
    searchBarIcon: '#c4c9e9', // Lightest for icon
    searchBarFocusRing: '#7b88cc', // Accent for focus ring
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex items-center">
      <input
        type="search"
        placeholder="Search songs, artists, playlists..."
        value={inputValue}
        onChange={handleInputChange}
        className="py-2 pl-10 pr-4 rounded-md text-sm w-64 md:w-80 transition-all duration-300 focus:outline-none"
        style={{
          backgroundColor: theme.searchBarBg,
          color: theme.searchBarText,
        }}
        onFocus={e => {
          e.target.style.backgroundColor = theme.searchBarFocusBg;
          e.target.style.setProperty('--tw-ring-color', theme.searchBarFocusRing);
        }}
        onBlur={e => {
          e.target.style.backgroundColor = theme.searchBarBg;
        }}
        aria-label="Search"
      />
      <style jsx global>{`
        input[type="search"]::placeholder {
          color: ${theme.searchBarPlaceholderText};
          opacity: 1;
        }
        input[type="search"]:-ms-input-placeholder {
          color: ${theme.searchBarPlaceholderText};
        }
        input[type="search"]::-ms-input-placeholder {
          color: ${theme.searchBarPlaceholderText};
        }
      `}</style>
      <FiSearch
        className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 pointer-events-none"
        style={{ color: theme.searchBarIcon }}
      />
      <button type="submit" className="hidden">Search</button>
    </form>
  );
};

export default SearchBar;