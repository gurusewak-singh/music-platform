// client/src/services/playlistService.js
import apiClient from './api';

export const createPlaylist = async (playlistData) => {
  try {
    const response = await apiClient.post('/playlists', playlistData);
    return response.data; // { success: true, playlist: {...} }
  } catch (error) {
    throw error.response?.data || new Error('Failed to create playlist');
  }
};

export const getMyPlaylists = async () => {
  try {
    const response = await apiClient.get('/playlists/me');
    return response.data; // { success: true, count, playlists: [] }
  } catch (error) {
    throw error.response?.data || new Error('Failed to fetch user playlists');
  }
};

export const getPlaylistById = async (playlistId) => {
  try {
    const response = await apiClient.get(`/playlists/${playlistId}`);
    return response.data; // { success: true, playlist: {...} }
  } catch (error) {
    throw error.response?.data || new Error('Failed to fetch playlist details');
  }
};

export const updatePlaylistDetails = async (playlistId, playlistData) => {
  try {
    const response = await apiClient.put(`/playlists/${playlistId}`, playlistData);
    return response.data; // { success: true, playlist: {...} }
  } catch (error) {
    throw error.response?.data || new Error('Failed to update playlist');
  }
};

export const addSongToPlaylist = async (playlistId, songId) => {
  try {
    const response = await apiClient.put(`/playlists/${playlistId}/add-song`, { songId });
    return response.data; // { success: true, playlist: {...} }
  } catch (error) {
    throw error.response?.data || new Error('Failed to add song to playlist');
  }
};

export const removeSongFromPlaylist = async (playlistId, songId) => {
  try {
    const response = await apiClient.put(`/playlists/${playlistId}/remove-song`, { songId });
    return response.data; // { success: true, playlist: {...} }
  } catch (error) {
    throw error.response?.data || new Error('Failed to remove song from playlist');
  }
};

export const deletePlaylist = async (playlistId) => {
  try {
    const response = await apiClient.delete(`/playlists/${playlistId}`);
    return response.data; // { success: true, message: '...' }
  } catch (error) {
    throw error.response?.data || new Error('Failed to delete playlist');
  }
};

// Optional: for playlist cover image
export const updatePlaylistCover = async (playlistId, coverImageData) => {
    try {
        const response = await apiClient.put(`/playlists/${playlistId}/cover`, coverImageData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || new Error('Failed to update playlist cover');
    }
};
export const searchPlaylists = async (query, page = 1, limit = 20) => {
  try {
    // Assuming backend endpoint is /api/playlists/search?q=term or /api/playlists?search=term
    // Adjust the endpoint and query parameter name as per your backend.
    const response = await apiClient.get('/playlists/search', { // Example endpoint
      params: { q: query, page, limit },
    });
    return response.data; // Expects { success: true, playlists: [], page, pages, count }
  } catch (error) {
    console.error('Error searching playlists:', error.response?.data?.message || error.message);
    throw error.response?.data || new Error('Failed to search playlists');
  }
};

export const getUserPublicPlaylists = async (userId, page = 1, limit = 10) => {
    try {
        // Assumes backend endpoint GET /api/playlists/user/:userId
        const response = await apiClient.get(`/playlists/user/${userId}`, {
            params: { page, pageSize: limit } // Ensure backend uses pageSize or adjust
        });
        return response.data; // Expects { success: true, playlists: [], page, pages, count }
    } catch (error) {
        console.error(`Error fetching public playlists for user ${userId}:`, error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to fetch user public playlists');
    }
};