// client/src/pages/UserProfilePage.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPublicUserProfile } from '../services/userService'; // For other users
import { getMyPlaylists, getUserPublicPlaylists } from '../services/playlistService'; // For playlists
import PlaylistListItem from '../components/playlist/PlaylistListItem';
import SkeletonPlaylistListItem from '../components/playlist/SkeletonPlaylistListItem';
import Spinner from '../components/ui/Spinner';
import Alert from '../components/ui/Alert';
import { AuthContext } from '../context/AuthContext';
import { FiUser, FiList, FiEdit3, FiUploadCloud, FiCalendar, FiMusic } from 'react-icons/fi';

// Theme colors (could be imported)
const theme = {
    primary: '#3949ac',
    secondary: '#5d6cc0',
    accent: '#7b88cc',
    textOnPrimary: '#ffffff',
};

const UserProfilePage = () => {
    const { userId: routeUserId } = useParams();
    const { user: authUser, isAuthenticated, isLoading: authIsLoading } = useContext(AuthContext);
    const navigate = useNavigate();

    const [profileData, setProfileData] = useState(null);
    const [userPlaylists, setUserPlaylists] = useState([]);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [loadingPlaylists, setLoadingPlaylists] = useState(true);
    const [error, setError] = useState(null);

    const isOwnProfileRoute = routeUserId === 'me';
    // Determine the actual userId to fetch. If 'me', wait for authUser.
    const userIdToFetch = isOwnProfileRoute ? (authUser?._id) : routeUserId;

    useEffect(() => {
        // If 'me' route and auth is still loading, wait.
        if (isOwnProfileRoute && authIsLoading) {
            setLoadingProfile(true); // Indicate loading until authUser is resolved
            return;
        }

        // If 'me' route but not authenticated (after auth check), redirect.
        if (isOwnProfileRoute && !authUser && !authIsLoading) {
            navigate('/login', { state: { from: `/profile/me`, message: "Please log in to view your profile." } });
            return;
        }

        // If no effective userIdToFetch (e.g., 'me' but authUser is null, or routeUserId is invalid)
        if (!userIdToFetch) {
            if (!isOwnProfileRoute) setError("User ID is missing or invalid.");
            // For 'me' route, this state (no userIdToFetch but authIsLoading is false) should be handled by the redirect above.
            setLoadingProfile(false);
            setLoadingPlaylists(false);
            return;
        }

        const fetchAllData = async () => {
            setLoadingProfile(true);
            setLoadingPlaylists(true);
            setError(null);

            try {
                // Fetch Profile Data
                let fetchedProfile;
                if (isOwnProfileRoute && authUser) {
                    // For own profile, use the data from AuthContext
                    // You might want to ensure the shape matches what getPublicUserProfile returns
                    fetchedProfile = {
                        _id: authUser._id,
                        username: authUser.username,
                        email: authUser.email, // Show email for own profile
                        role: authUser.role,
                        artistName: authUser.artistName,
                        isVerifiedArtist: authUser.isVerifiedArtist,
                        createdAt: authUser.createdAt,
                        // bio: authUser.bio // if you add a bio
                    };
                } else {
                    // For other user's profile, call the public endpoint
                    const profileResult = await getPublicUserProfile(userIdToFetch);
                    if (profileResult.success && profileResult.user) {
                        fetchedProfile = profileResult.user;
                    } else {
                        throw new Error(profileResult.message || 'User profile not found.');
                    }
                }
                setProfileData(fetchedProfile);
                setLoadingProfile(false);

                // Fetch Playlists
                const playlistsResult = isOwnProfileRoute
                    ? await getMyPlaylists() // Fetches all (public/private) for logged-in user
                    : await getUserPublicPlaylists(userIdToFetch); // Fetches only public for other users

                if (playlistsResult.success) {
                    setUserPlaylists(playlistsResult.playlists);
                } else {
                    console.warn("Could not fetch user playlists:", playlistsResult.message);
                    setUserPlaylists([]);
                }

            } catch (err) {
                setError(err.message || 'Failed to load page data.');
                setProfileData(null);
                setUserPlaylists([]);
            } finally {
                setLoadingProfile(false);
                setLoadingPlaylists(false);
            }
        };

        fetchAllData();

    }, [userIdToFetch, isOwnProfileRoute, authUser, authIsLoading, navigate]);


    if (loadingProfile || (isOwnProfileRoute && authIsLoading)) {
        return <div className="flex justify-center items-center h-screen"><Spinner spinnerColor={theme.primary} /></div>;
    }

    if (error && !profileData) { // If profile failed to load, show main error
        return <div className="container mx-auto px-4 py-8"><Alert message={error} type="error" /></div>;
    }
    if (!profileData) { // Fallback if no error but profile still not set (e.g. user navigated away)
        return <div className="container mx-auto px-4 py-8 text-center text-gray-500">User data is unavailable.</div>;
    }

    const isArtistRole = profileData.role === 'artist';

    return (
        <div className="container mx-auto px-4 py-8">
            {/* User Profile Header */}
            <div className="mb-12 p-6 sm:p-8 rounded-xl shadow-2xl" style={{ background: `linear-gradient(135deg, ${theme.secondary} 0%, ${theme.accent} 100%)` }}>
                <div className="flex flex-col sm:flex-row items-center sm:space-x-6">
                    <div className="mb-4 sm:mb-0 p-3 bg-white/20 rounded-full">
                        {/* Generic User Icon or Placeholder for future Profile Picture */}
                        <FiUser className="text-white" size={70} />
                    </div>
                    <div className="text-center sm:text-left">
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
                            {profileData.username}
                        </h1>
                        {isArtistRole && profileData.artistName && (
                            <p className="text-xl text-indigo-100 mt-1">
                                Artist: <Link to={`/artist/${profileData._id}`} className="font-semibold hover:underline">{profileData.artistName}</Link>
                            </p>
                        )}
                        {isOwnProfileRoute && profileData.email && (
                             <p className="text-sm text-indigo-200 mt-0.5">{profileData.email}</p>
                        )}
                        <p className="text-sm text-indigo-200 mt-2 flex items-center justify-center sm:justify-start">
                            <FiCalendar size={14} className="mr-1.5 opacity-80"/> Joined: {new Date(profileData.createdAt).toLocaleDateString()}
                        </p>

                        {isOwnProfileRoute && (
                            <div className="mt-4 flex flex-wrap gap-3 justify-center sm:justify-start">
                                <button className="px-4 py-2 text-xs font-medium text-gray-700 bg-white rounded-md hover:bg-gray-100 shadow-sm flex items-center">
                                    <FiEdit3 className="mr-1.5" /> Edit Profile (Future)
                                </button>
                                {isArtistRole && ( // Show "My Uploads" only if they have artist role
                                    <Link to="/upload-song" className="px-4 py-2 text-xs font-medium text-white rounded-md shadow-sm flex items-center"
                                          style={{backgroundColor: theme.primary}}
                                          onMouseOver={e => e.currentTarget.style.backgroundColor = theme.secondary}
                                          onMouseOut={e => e.currentTarget.style.backgroundColor = theme.primary}>
                                        <FiUploadCloud className="mr-1.5" /> My Uploads
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* User's Playlists Section */}
            <h2 className="text-2xl font-bold text-gray-700 mb-6 flex items-center">
                <FiList className="mr-2 opacity-70" style={{color: theme.primary}}/>
                {isOwnProfileRoute ? "My Playlists" : `Public Playlists by ${profileData.username}`}
            </h2>
            {loadingPlaylists && (
                <div className="bg-white shadow-xl rounded-lg p-2 md:p-4 space-y-1 px-2 sm:px-4">
                    {Array.from({ length: 4 }).map((_, idx) => (
                        <SkeletonPlaylistListItem key={idx} />
                    ))}
                </div>
            )}
            {!loadingPlaylists && userPlaylists.length === 0 && (
                <p className="text-gray-500">
                    {isOwnProfileRoute ? "You haven't" : `${profileData.username} hasn't`} created any {isOwnProfileRoute ? "" : "public "}playlists yet.
                </p>
            )}
            {userPlaylists.length > 0 && (
                <div className="bg-white shadow-xl rounded-lg p-2 md:p-4 space-y-1 px-2 sm:px-4">
                    {userPlaylists.map(playlist => (
                        <PlaylistListItem key={playlist._id} playlist={playlist} />
                    ))}
                </div>
            )}
            {/* TODO: Pagination for playlists if many */}

            {/* Display non-critical errors (e.g., playlist fetch fail after profile success) */}
            {error && profileData && !loadingProfile && (
                <div className="mt-8">
                    <Alert message={error} type="warning" onClose={() => setError(null)} />
                </div>
            )}
        </div>
    );
};

export default UserProfilePage;