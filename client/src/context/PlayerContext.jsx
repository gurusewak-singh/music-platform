// client/src/context/PlayerContext.js
import React, { createContext, useReducer, useRef, useEffect, useContext } from 'react';

// Initial State (make sure audioRef is not part of serializable state if you reset to initialState)
const initialPlayerState = {
  currentSong: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.75,
  isMuted: false,
  queue: [],
  currentQueueIndex: -1,
  repeatMode: 'none',
  isShuffling: false,
};

// Action Types
export const PLAY_SONG = 'PLAY_SONG';
export const PAUSE_SONG = 'PAUSE_SONG';
export const RESUME_SONG = 'RESUME_SONG';
export const SET_CURRENT_TIME = 'SET_CURRENT_TIME';
export const SET_DURATION = 'SET_DURATION';
export const SET_VOLUME = 'SET_VOLUME';
export const TOGGLE_MUTE = 'TOGGLE_MUTE';
export const NEXT_SONG = 'NEXT_SONG';
export const PREV_SONG = 'PREV_SONG';
export const SET_QUEUE = 'SET_QUEUE'; // To set a new queue and optionally start playing
export const ADD_TO_QUEUE = 'ADD_TO_QUEUE';
export const REMOVE_FROM_QUEUE = 'REMOVE_FROM_QUEUE'; // (More advanced)
export const CLEAR_QUEUE = 'CLEAR_QUEUE';
export const SET_REPEAT_MODE = 'SET_REPEAT_MODE';
export const TOGGLE_SHUFFLE = 'TOGGLE_SHUFFLE';
export const SONG_ENDED = 'SONG_ENDED';

// Reducer
const playerReducer = (state, action) => {
  switch (action.type) {
    case PLAY_SONG: // Payload is the song object to play
      return {
        ...state,
        currentSong: action.payload.song,
        isPlaying: true,
        currentTime: 0, // Reset time when a new song plays
        duration: 0,    // Reset duration, will be updated by audio element
        queue: action.payload.queue || [action.payload.song], // Set queue if provided, else queue is just this song
        currentQueueIndex: action.payload.queue ? action.payload.queue.findIndex(s => s._id === action.payload.song._id) : 0,
      };
    case PAUSE_SONG:
      return { ...state, isPlaying: false };
    case RESUME_SONG:
      return { ...state, isPlaying: true };
    case SET_CURRENT_TIME:
      return { ...state, currentTime: action.payload };
    case SET_DURATION:
      return { ...state, duration: action.payload };
    case SET_VOLUME:
      return { ...state, volume: action.payload, isMuted: action.payload === 0 ? true : state.isMuted && action.payload > 0 ? false : state.isMuted };
    case TOGGLE_MUTE:
      return { ...state, isMuted: !state.isMuted };
    case SET_QUEUE: // Payload: { songs: [], startIndex: 0 (optional) }
      return {
        ...state,
        queue: action.payload.songs,
        currentSong: action.payload.songs[action.payload.startIndex || 0] || null,
        currentQueueIndex: action.payload.startIndex || 0,
        isPlaying: action.payload.songs.length > 0 ? (action.payload.playOnSet !== undefined ? action.payload.playOnSet : true) : false, // Optionally start playing
        currentTime: 0,
      };
    case ADD_TO_QUEUE: // Payload: song object
      return {
        ...state,
        queue: [...state.queue, action.payload],
      };
    case NEXT_SONG: {
      if (state.queue.length === 0 || state.currentQueueIndex === -1) return state;
      let nextIndex = state.currentQueueIndex + 1;
      if (nextIndex >= state.queue.length) {
        if (state.repeatMode === 'all') {
          nextIndex = 0;
        } else {
          return { ...state, isPlaying: false, currentSong: null, currentQueueIndex: -1 }; // End of queue
        }
      }
      return {
        ...state,
        currentSong: state.queue[nextIndex],
        currentQueueIndex: nextIndex,
        isPlaying: true,
        currentTime: 0,
      };
    }
    case PREV_SONG: {
      if (state.queue.length === 0 || state.currentQueueIndex === -1) return state;
      let prevIndex = state.currentQueueIndex - 1;
      if (prevIndex < 0) {
        // Optional: if at the beginning, restart current song or go to end if repeat all
        // For now, just stop or stay at first song.
         prevIndex = 0; // Or simply don't change if you want it to stop at the first song
      }
      return {
        ...state,
        currentSong: state.queue[prevIndex],
        currentQueueIndex: prevIndex,
        isPlaying: true,
        currentTime: 0,
      };
    }
    case SONG_ENDED: {
        if (state.repeatMode === 'one' && state.currentSong) {
            return { ...state, currentTime: 0, isPlaying: true }; // Restart current song
        }
        // Logic for 'all' repeat or advancing to next song (similar to NEXT_SONG)
        let nextIndex = state.currentQueueIndex + 1;
        if (nextIndex >= state.queue.length) {
            if (state.repeatMode === 'all') {
                nextIndex = 0;
            } else {
                // End of queue, not repeating all
                return { ...state, isPlaying: false, currentSong: state.queue[state.currentQueueIndex], currentTime: state.duration };
            }
        }
        if (state.queue.length === 0) return {...state, isPlaying: false};

        return {
            ...state,
            currentSong: state.queue[nextIndex],
            currentQueueIndex: nextIndex,
            isPlaying: state.queue.length > 0, // Only play if queue is not empty
            currentTime: 0,
        };
    }
    case SET_REPEAT_MODE: // payload: 'none', 'one', 'all'
      return { ...state, repeatMode: action.payload };
    case TOGGLE_SHUFFLE:
      // Basic shuffle: just toggle. Real shuffle would reorder queue.
      // For a real shuffle, you'd copy state.queue to originalQueue, shuffle state.queue,
      // and find the new index of currentSong.
      return { ...state, isShuffling: !state.isShuffling };
    case CLEAR_QUEUE:
      // Explicitly pause and clear src of the HTML audio element
      if (state.audioRef && state.audioRef.current) {
        state.audioRef.current.pause();
        state.audioRef.current.removeAttribute('src');
        state.audioRef.current.load();
      }
      return {
        ...initialPlayerState,
        audioRef: state.audioRef, // Preserve the audioRef
      };
    default:
      return state;
  }
};

// Create Context
export const PlayerContext = createContext({
  ...initialPlayerState,
  audioRef: { current: null },
  playSong: () => {},
  pause: () => {},
  resume: () => {},
  seekTime: () => {},
  setVolume: () => {},
  toggleMute: () => {},
  nextSong: () => {},
  prevSong: () => {},
  setQueue: () => {},
  addToQueue: () => {},
  clearQueue: () => {},
  setRepeatMode: () => {},
  toggleShuffle: () => {},
});

export const usePlayer = () => useContext(PlayerContext);

// Provider Component
export const PlayerProvider = ({ children }) => {
  const audioRef = useRef(null);
  const [state, dispatch] = useReducer(playerReducer, { ...initialPlayerState, audioRef });

  // --- Audio Element Event Handlers ---
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => dispatch({ type: 'SET_CURRENT_TIME', payload: audio.currentTime });
    const handleDurationChange = () => dispatch({ type: 'SET_DURATION', payload: audio.duration });
    const handleLoadedMetadata = () => {
      if (audio.duration && audio.duration !== Infinity) {
        dispatch({ type: 'SET_DURATION', payload: audio.duration });
      }
    };
    const handleEnded = () => dispatch({ type: 'SONG_ENDED' });
    const handlePlay = () => { if (!state.isPlaying) dispatch({type: 'RESUME_SONG'}); };
    const handlePause = () => { if (state.isPlaying) dispatch({type: 'PAUSE_SONG'}); };
    const handleError = (e) => {
      console.error("Audio Error:", e);
      dispatch({ type: CLEAR_QUEUE });
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
    };
  }, [state.isPlaying]);

  // --- Effects to control <audio> element based on state ---
  useEffect(() => {
    if (audioRef.current && state.currentSong && state.currentSong.filePath) {
      if (audioRef.current.src !== state.currentSong.filePath) {
        audioRef.current.src = state.currentSong.filePath;
        audioRef.current.load();
      }
      if (state.isPlaying) {
        audioRef.current.play().catch(error => console.warn("Audio play failed:", error));
      } else {
        audioRef.current.pause();
      }
    } else if (audioRef.current && !state.currentSong) {
      audioRef.current.pause();
      if (audioRef.current.src) {
        audioRef.current.removeAttribute('src');
        audioRef.current.load();
      }
    }
  }, [state.isPlaying, state.currentSong]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = state.isMuted ? 0 : state.volume;
    }
  }, [state.volume, state.isMuted]);

  // --- Player Actions (dispatchers) ---
  const playSong = (song, queue) => dispatch({ type: 'PLAY_SONG', payload: { song, queue } });
  const pause = () => dispatch({ type: 'PAUSE_SONG' });
  const resume = () => dispatch({ type: 'RESUME_SONG' });
  const seekTime = (time) => {
    if (audioRef.current) audioRef.current.currentTime = time;
    dispatch({ type: 'SET_CURRENT_TIME', payload: time });
  };
  const setVolume = (volume) => dispatch({ type: 'SET_VOLUME', payload: volume });
  const toggleMute = () => dispatch({ type: 'TOGGLE_MUTE' });
  const nextSong = () => dispatch({ type: 'NEXT_SONG' });
  const prevSong = () => dispatch({ type: 'PREV_SONG' });
  const setQueueAction = (songs, startIndex = 0, playOnSet = true) => dispatch({ type: 'SET_QUEUE', payload: { songs, startIndex, playOnSet } });
  const addToQueue = (song) => dispatch({ type: 'ADD_TO_QUEUE', payload: song });
  const clearQueue = () => dispatch({type: CLEAR_QUEUE});
  const setRepeatMode = (mode) => dispatch({ type: 'SET_REPEAT_MODE', payload: mode });
  const toggleShuffle = () => dispatch({ type: 'TOGGLE_SHUFFLE' });

  return (
    <PlayerContext.Provider
      value={{
        ...state,
        playSong,
        pause,
        resume,
        seekTime,
        setVolume,
        toggleMute,
        nextSong,
        prevSong,
        setQueue: setQueueAction,
        addToQueue,
        clearQueue,
        setRepeatMode,
        toggleShuffle
      }}
    >
      {/* The actual HTML audio element */}
      <audio ref={audioRef} />
      {children}
    </PlayerContext.Provider>
  );
};