// client/src/components/song/SongUploadForm.jsx
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/api'; // Or import specific upload service if created
import { AuthContext } from '../../context/AuthContext'; // To disable form if global loading
import Alert from '../ui/Alert';
// GlobalSpinner will handle loading state via AuthContext or a dedicated UploadContext if complex

const SongUploadForm = () => {
  const navigate = useNavigate();
  const { isLoading: isAuthLoading } = useContext(AuthContext); // Use global loading state

  const [formData, setFormData] = useState({
    title: '',
    artist: '', // This will be the display artist name
    album: '',
    genre: '',
  });
  const [audioFile, setAudioFile] = useState(null);
  const [coverArtFile, setCoverArtFile] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isUploading, setIsUploading] = useState(false); // Local uploading state for this form

  const { title, artist, album, genre } = formData;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAudioFileChange = (e) => {
    setAudioFile(e.target.files[0]);
  };

  const handleCoverArtFileChange = (e) => {
    setCoverArtFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !audioFile) {
      setError('Title and Audio File are required.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    const uploadData = new FormData();
    uploadData.append('title', title);
    uploadData.append('artist', artist); // Display artist name
    uploadData.append('album', album);
    uploadData.append('genre', genre);
    uploadData.append('audioFile', audioFile);
    if (coverArtFile) {
      uploadData.append('coverArtFile', coverArtFile);
    }

    try {
      // We use apiClient directly here. The token is already in its headers via AuthContext.
      const response = await apiClient.post('/songs/upload', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setSuccess('Song uploaded successfully! Redirecting...');
        setFormData({ title: '', artist: '', album: '', genre: '' });
        setAudioFile(null);
        setCoverArtFile(null);
        // Clear file input visually (a bit tricky, often requires resetting the form or key prop)
        e.target.reset(); // Resets form fields including file inputs
        setTimeout(() => {
          navigate('/'); // Or to the artist's dashboard, or the new song page
        }, 2000);
      } else {
        setError(response.data.message || 'Upload failed. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  // Combine global auth loading with local form uploading state
  const currentlyProcessing = isAuthLoading || isUploading;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <Alert message={error} type="error" onClose={() => setError(null)} />}
      {success && <Alert message={success} type="success" />}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Song Title <span className="text-red-500">*</span></label>
        <input type="text" name="title" id="title" value={title} onChange={handleInputChange} required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          disabled={currentlyProcessing} />
      </div>

      <div>
        <label htmlFor="artist" className="block text-sm font-medium text-gray-700">Display Artist Name (defaults to your name if empty)</label>
        <input type="text" name="artist" id="artist" value={artist} onChange={handleInputChange}
          placeholder="e.g., Your Band Name, or leave empty"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          disabled={currentlyProcessing} />
      </div>

      <div>
        <label htmlFor="album" className="block text-sm font-medium text-gray-700">Album (Optional)</label>
        <input type="text" name="album" id="album" value={album} onChange={handleInputChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          disabled={currentlyProcessing} />
      </div>

      <div>
        <label htmlFor="genre" className="block text-sm font-medium text-gray-700">Genre (Optional)</label>
        <input type="text" name="genre" id="genre" value={genre} onChange={handleInputChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          disabled={currentlyProcessing} />
      </div>

      <div>
        <label htmlFor="audioFile" className="block text-sm font-medium text-gray-700">Audio File (MP3, WAV, etc.) <span className="text-red-500">*</span></label>
        <input type="file" name="audioFile" id="audioFile" onChange={handleAudioFileChange} required accept="audio/*"
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50"
          disabled={currentlyProcessing} />
        {audioFile && <p className="text-xs text-gray-500 mt-1">Selected: {audioFile.name}</p>}
      </div>

      <div>
        <label htmlFor="coverArtFile" className="block text-sm font-medium text-gray-700">Cover Art (Optional - JPG, PNG)</label>
        <input type="file" name="coverArtFile" id="coverArtFile" onChange={handleCoverArtFileChange} accept="image/jpeg,image/png,image/gif"
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-50"
          disabled={currentlyProcessing} />
        {coverArtFile && <p className="text-xs text-gray-500 mt-1">Selected: {coverArtFile.name}</p>}
      </div>

      <button type="submit" disabled={currentlyProcessing || !title || !audioFile}
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-75 disabled:cursor-not-allowed">
        {isUploading ? 'Uploading...' : 'Upload Song'}
      </button>
    </form>
  );
};

export default SongUploadForm;