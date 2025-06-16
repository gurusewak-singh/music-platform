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
export const searchSongs = async (query, page = 1, limit = 20) => { // Default limit to 20 for search
  try {
    // Assuming backend endpoint is /api/songs?search=term or /api/songs/search?q=term
    // Adjust the endpoint and query parameter name as per your backend.
    const response = await apiClient.get('/songs', {
      params: { search: query, page, pageSize: limit }, // Using existing params from getAllSongs
    });
    return response.data; // Expects { success: true, songs: [], page, pages, count }
  } catch (error) {
    console.error('Error searching songs:', error.response?.data?.message || error.message);
    throw error.response?.data || new Error('Failed to search songs');
  }
};

export const getSongsByArtist = async (artistId, page = 1, limit = 10) => {
    try {
        // OPTION B: If you create a dedicated backend endpoint (RECOMMENDED)
        const response = await apiClient.get(`/songs/artist/${artistId}`, {
             params: { page, pageSize: limit }, // Assuming backend supports pagination
        });
        return response.data; // Expects { success: true, songs: [], page, pages, count }
    } catch (error) {
        console.error(`Error fetching songs for artist ${artistId}:`, error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to fetch artist songs');
    }
};

// We might not call /songs/stream directly if using Cloudinary URLs.
// But if you were proxying, you'd have a service for it.
// For now, song.filePath from the song object will be used in the <audio> tag.