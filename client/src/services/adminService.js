// client/src/services/adminService.js
import apiClient from './api';

// --- User Management ---
export const getAllUsers = async (page = 1, limit = 20) => { // Add pagination params
    try {
        // Assuming backend GET /api/admin/users supports pagination
        const response = await apiClient.get('/admin/users', { params: { page, limit } });
        return response.data; // Expects { success: true, count, users, page, pages }
    } catch (error) {
        console.error('Error fetching users for admin:', error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to fetch users');
    }
};

export const verifyArtistByAdmin = async (userId) => {
    try {
        const response = await apiClient.put(`/admin/users/${userId}/verify-artist`);
        return response.data; // Expects { success: true, user, message }
    } catch (error) {
        console.error('Error verifying artist:', error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to verify artist');
    }
};

export const updateUserByAdmin = async (userId, userData) => {
    // userData example: { role: 'newRole' } or { isVerifiedArtist: true/false, artistName: 'New Name' }
    try {
        const response = await apiClient.put(`/admin/users/${userId}`, userData);
        return response.data; // Expects { success: true, user, message }
    } catch (error) {
        console.error('Error updating user by admin:', error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to update user');
    }
};

export const deleteUserByAdmin = async (userId) => {
    try {
        const response = await apiClient.delete(`/admin/users/${userId}`);
        return response.data; // Expects { success: true, message }
    } catch (error) {
        console.error('Error deleting user by admin:', error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to delete user');
    }
};

// --- Playlist Management (Admin) ---
// (Requires backend endpoint /api/admin/playlists/:playlistId to be active)
export const deletePlaylistByAdmin = async (playlistId) => {
    try {
        const response = await apiClient.delete(`/admin/playlists/${playlistId}`);
        return response.data; // Expects { success: true, message }
    } catch (error) {
        console.error('Error deleting playlist by admin:', error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to delete playlist by admin');
    }
};

// --- Song Management (Admin) ---
// Admin can typically use the existing songService.deleteSong(songId)
// as the backend controller for song deletion likely checks for admin role.
// If a dedicated admin endpoint for song deletion exists, add it here.

// --- Optional: Get all songs/playlists for admin view (if different from public) ---
/*
export const getAllSongsAdmin = async (page = 1, limit = 20) => {
    try {
        const response = await apiClient.get('/admin/songs', { params: { page, limit } });
        return response.data;
    } catch (error) {
        throw error.response?.data || new Error('Failed to fetch all songs for admin');
    }
};

export const getAllPlaylistsAdmin = async (page = 1, limit = 20) => {
    try {
        const response = await apiClient.get('/admin/playlists', { params: { page, limit } });
        return response.data;
    } catch (error) {
        throw error.response?.data || new Error('Failed to fetch all playlists for admin');
    }
};
*/