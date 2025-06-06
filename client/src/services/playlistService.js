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