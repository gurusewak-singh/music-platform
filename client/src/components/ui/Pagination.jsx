import React from 'react';

const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex justify-center mt-6 space-x-2">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
      >
        Prev
      </button>
      <span className="px-2 py-1">Page {page} of {totalPages}</span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
