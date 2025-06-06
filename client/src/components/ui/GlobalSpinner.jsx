// client/src/components/ui/GlobalSpinner.jsx
import React from 'react';

const GlobalSpinner = ({ isLoading }) => {
  if (!isLoading) {
    return null; // Don't render anything if not loading
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-50 backdrop-blur-sm transition-opacity duration-300 ease-in-out">
      {/* 
        - `fixed inset-0`: Covers the entire viewport.
        - `z-50`: Ensures it's on top of other content.
        - `flex items-center justify-center`: Centers the spinner.
        - `bg-black bg-opacity-50`: Semi-transparent black background.
        - `backdrop-blur-sm`: Applies a blur effect to content behind it (browser support varies, but good fallback with opacity).
        - `transition-opacity duration-300 ease-in-out`: For smooth fade-in/out if you manage visibility with CSS transitions (optional).
      */}
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      {/* You can make the spinner larger or use a more complex SVG spinner */}
    </div>
  );
};

export default GlobalSpinner;