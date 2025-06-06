// client/src/services/songService.js
import apiClient from './api'; // Your configured Axios instance

export const getAllSongs = async (page = 1, pageSize = 10, search = '') => {
  try {
    const response = await apiClient.get('/songs', {
      params: { page, pageSize, search },
    });
    return response.data; // Expects { success: true, songs: [], page, pages, count }
  } catch (error) {
    console.error('Error fetching songs:', error.response?.data?.message || error.message);
    throw error.response?.data || new Error('Failed to fetch songs');
  }
};

export const getSongById = async (songId) => {
    try {
        const response = await apiClient.get(`/songs/${songId}`);
        return response.data; // Expects { success: true, song: {...} }
    } catch (error) {
        console.error(`Error fetching song ${songId}:`, error.response?.data?.message || error.message);
        throw error.response?.data || new Error('Failed to fetch song details');
    }
};

// We might not call /songs/stream directly if using Cloudinary URLs.
// But if you were proxying, you'd have a service for it.
// For now, song.filePath from the song object will be used in the <audio> tag.