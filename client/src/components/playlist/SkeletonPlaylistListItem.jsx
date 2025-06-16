// client/src/components/playlist/SkeletonPlaylistListItem.jsx
import React from 'react';

const SkeletonPlaylistListItem = () => (
  <div className="animate-pulse flex items-center space-x-4 p-3 border-b border-gray-100">
    <div className="w-12 h-12 bg-gray-200 rounded-md" />
    <div className="flex-1">
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
      <div className="h-3 bg-gray-100 rounded w-1/3" />
    </div>
  </div>
);

export default SkeletonPlaylistListItem;
