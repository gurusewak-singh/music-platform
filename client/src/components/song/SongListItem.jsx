// client/src/components/song/SongListItem.jsx
import React, { useContext, useState, memo } from 'react';
import { PlayerContext } from '../../context/PlayerContext';
import { AuthContext } from '../../context/AuthContext';
import AuthPromptModal from '../ui/AuthPromptModal';
import { FiPlay, FiPause, FiPlusSquare, FiMusic } from 'react-icons/fi';

const SongListItem = memo((props) => {
  const { song, onPlay, onAddToPlaylist, isPlayingThisSong } = props;
  const { isAuthenticated } = useContext(AuthContext);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Theme Colors
  const theme = {
    primary: '#3949ac',
    secondary: '#5d6cc0',
    accent: '#7b88cc',
    lightAccent: '#a0a8da',
    lightest: '#c4c9e9',
    textOnPrimary: '#ffffff',
    textOnSecondary: '#ffffff',
    placeholderIcon: '#a0a8da',
    placeholderIconHover: '#ffffff',
    placeholderBgHover: '#5d6cc0',
    iconDefault: '#7b88cc',
    iconHover: '#3949ac',
    iconActive: '#c4c9e9',
  };

  const handlePlayAttempt = () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    if (onPlay) {
      onPlay();
    }
  };

  const handleAddToPlaylistAttempt = () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    if (onAddToPlaylist) {
      onAddToPlaylist();
    }
  };

  const coverArt = song && song.coverArtPath ? song.coverArtPath : null;
  const titleText = song ? song.title : 'Untitled';
  const artistText = song ? song.artist : 'Unknown Artist';
  const genreText = song ? song.genre : '';

  // Dynamic styles
  const itemStyle = {
    backgroundColor: isPlayingThisSong
      ? theme.primary
      : isHovered
      ? theme.secondary
      : 'transparent',
    color: isPlayingThisSong || isHovered ? theme.textOnPrimary : 'inherit',
    cursor: 'pointer',
    borderRadius: 12,
    padding: 12,
    display: 'flex',
    alignItems: 'center',
    transition: 'background 0.15s, color 0.15s',
  };

  const artistAndGenreStyle = {
    color: isPlayingThisSong || isHovered ? theme.lightAccent : '#6b7280',
  };

  const addIconStyle = {
    color: isPlayingThisSong ? theme.iconActive : (isHovered ? theme.textOnPrimary : theme.iconDefault),
    backgroundColor: isHovered && !isPlayingThisSong ? theme.lightest : (isPlayingThisSong ? 'rgba(255,255,255,0.1)' : 'transparent'),
    borderRadius: '9999px',
    padding: 8,
    marginLeft: 24,
    transition: 'color 0.15s, background 0.15s',
    outline: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <>
      <div
        style={itemStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        title={isPlayingThisSong ? 'Pause' : 'Play'}
        onClick={handlePlayAttempt}
      >
        <div
          className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center mr-4 rounded overflow-hidden bg-transparent group"
          style={{ width: 48, height: 48, marginRight: 16, borderRadius: 8 }}
        >
          {coverArt ? (
            <img src={coverArt} alt={titleText} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: isHovered && !isPlayingThisSong ? theme.placeholderBgHover : '#e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
                transition: 'background 0.15s',
              }}
            >
              <FiMusic
                size={24}
                style={{
                  color: isPlayingThisSong ? theme.lightest : (isHovered ? theme.placeholderIconHover : theme.placeholderIcon),
                  transition: 'color 0.15s',
                }}
              />
            </div>
          )}
          {/* Overlay */}
          <div
            className="absolute inset-0 flex items-center justify-center rounded transition-all duration-150"
            style={{
              pointerEvents: 'none',
              borderRadius: 8,
              background:
                isPlayingThisSong
                  ? 'rgba(57,73,172,0.7)' // theme.primary with 0.7 opacity
                  : isHovered
                  ? 'rgba(57,73,172,0.3)' // theme.primary with 0.3 opacity
                  : 'transparent',
              transition: 'background 0.15s',
            }}
          >
            {isPlayingThisSong ? (
              <FiPause size={28} className="text-white" />
            ) : (
              <FiPlay size={28} className={`text-white ${isHovered ? 'opacity-100' : 'opacity-0'} transition-opacity duration-150`} />
            )}
          </div>
        </div>

        <div className="flex-grow min-w-0">
          <p className="font-semibold truncate" style={{ color: isPlayingThisSong || isHovered ? theme.textOnPrimary : '#1f2937', fontSize: 18 }}>
            {titleText}
          </p>
          <p className="text-sm truncate" style={{ ...artistAndGenreStyle, fontSize: 15 }}>
            {artistText}
          </p>
          {genreText && (
            <p className="text-xs truncate" style={{ ...artistAndGenreStyle, fontSize: 13 }}>
              {genreText}
            </p>
          )}
        </div>

        {onAddToPlaylist && (
            <button
                onClick={e => { e.stopPropagation(); handleAddToPlaylistAttempt(); }}
                title="Add to playlist"
                style={addIconStyle}
                onMouseEnter={e => {
                    if (!isPlayingThisSong) e.currentTarget.style.color = theme.iconHover;
                    if (!isPlayingThisSong && !isHovered) e.currentTarget.style.backgroundColor = theme.lightest;
                }}
                onMouseLeave={e => {
                    if (!isPlayingThisSong) e.currentTarget.style.color = addIconStyle.color;
                    if (!isPlayingThisSong && !isHovered) e.currentTarget.style.backgroundColor = 'transparent';
                }}
            >
                <FiPlusSquare size={20} />
            </button>
        )}
      </div>

      <AuthPromptModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        message="Please log in or register to perform this action."
      />
    </>
  );
});

export default SongListItem;