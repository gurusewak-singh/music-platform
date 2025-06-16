// client/src/services/userService.js
import apiClient from './api';

export const getPublicUserProfile = async (userId) => { // Renamed function
    try {
        // Your NEW backend endpoint for public profiles should be used here.
        // Based on my last backend suggestion, it was: /api/users/public-profile/:userId
        const response = await apiClient.get(`/users/public-profile/${userId}`); // Use the correct public profile endpoint
        return response.data; 
    } catch (error) {
        console.error(`Error fetching public user profile for ${userId}:`, error.response?.data || error.message);
        throw error.response?.data || new Error('Failed to fetch public user profile');
    }
};