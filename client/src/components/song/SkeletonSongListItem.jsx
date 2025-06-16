// client/src/components/song/SkeletonSongListItem.jsx
import React from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css'; // Import base CSS

const SkeletonSongListItem = () => {
  // Use your theme colors for the skeleton if desired
  const baseColor = "#e0e0e0"; // Light gray
  const highlightColor = "#f5f5f5"; // Lighter gray for highlight

  return (
    <SkeletonTheme baseColor={baseColor} highlightColor={highlightColor}>
      <div className="flex items-center p-3 rounded-lg">
        <div className="relative w-12 h-12 flex-shrink-0 mr-4">
          <Skeleton circle={false} height={48} width={48} style={{ borderRadius: '0.25rem' }} />
        </div>
        <div className="flex-grow min-w-0">
          <Skeleton height={18} width={`80%`} style={{ marginBottom: '0.25rem' }} />
          <Skeleton height={14} width={`60%`} />
        </div>
        <div className="ml-4 p-2">
          <Skeleton circle height={20} width={20} />
        </div>
      </div>
    </SkeletonTheme>
  );
};
export default SkeletonSongListItem;