// client/src/components/ui/Alert.jsx
import React from 'react';

const Alert = ({ message, type = 'error', onClose }) => {
  const baseClasses = "p-4 mb-4 text-sm rounded-lg relative";
  let typeClasses = "";

  switch (type) {
    case 'error':
      typeClasses = "bg-red-100 text-red-700 dark:bg-red-200 dark:text-red-800";
      break;
    case 'success':
      typeClasses = "bg-green-100 text-green-700 dark:bg-green-200 dark:text-green-800";
      break;
    case 'warning':
      typeClasses = "bg-yellow-100 text-yellow-700 dark:bg-yellow-200 dark:text-yellow-800";
      break;
    default:
      typeClasses = "bg-blue-100 text-blue-700 dark:bg-blue-200 dark:text-blue-800";
  }

  if (!message) return null;

  return (
    <div className={`${baseClasses} ${typeClasses}`} role="alert">
      <span className="font-medium">{type.charAt(0).toUpperCase() + type.slice(1)}!</span> {message}
      {onClose && (
        <button
          type="button"
          className="absolute top-0 bottom-0 right-0 px-4 py-3"
          onClick={onClose}
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
        </button>
      )}
    </div>
  );
};

export default Alert;