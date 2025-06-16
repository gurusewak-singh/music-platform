import React, { memo } from 'react';
import SongListItem from '../song/SongListItem';

const SongList = memo(({ songs, currentSong, isPlaying, onPlaySong, isOwner, onRemoveSong, isRemovingSong }) => {
  return (
    <div className="bg-white rounded-lg shadow-xl p-2 sm:p-4">
      {songs.length > 0 ? songs.map((song, index) => {
        const isThisSongPlaying = currentSong?._id === song._id && isPlaying;
        return (
          <SongListItem
            key={song._id}
            song={song}
            index={index}
            isPlaying={isThisSongPlaying}
            onPlay={() => onPlaySong(song, index)}
            isOwner={isOwner}
            onRemove={() => onRemoveSong && onRemoveSong(song._id)}
            isRemoving={isRemovingSong === song._id}
          />
        );
      }) : (
        <p className="text-gray-600 text-center py-10">This playlist is empty. <a href="/" className="text-indigo-600 hover:underline">Discover songs</a> to add!</p>
      )}
    </div>
  );
});

export default SongList;
