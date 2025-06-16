// client/src/pages/UploadSongPage.jsx
import React from 'react';
import SongUploadForm from '../components/song/SongUploadForm';

const UploadSongPage = () => {
  return (
    <div className="py-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Upload Your Music</h1>
      <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-2xl mx-4">
        <SongUploadForm />
      </div>
    </div>
  );
};

export default UploadSongPage;