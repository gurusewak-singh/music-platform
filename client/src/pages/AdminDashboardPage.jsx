// client/src/pages/AdminDashboardPage.jsx
import React, { useState } from 'react';
import UserManagementTab from './admin/UserManagementTab'; // We'll create this next
// import SongManagementTab from './admin/SongManagementTab'; // Optional
// import PlaylistManagementTab from './admin/PlaylistManagementTab'; // Optional
import { FiUsers, FiMusic, FiList, FiBarChart2 } from 'react-icons/fi';

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('users'); // Default tab

  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagementTab />;
      // case 'songs':
      //   return <SongManagementTab />;
      // case 'playlists':
      //   return <PlaylistManagementTab />;
      // case 'stats':
      //   return <div>Statistics / Overview (Future)</div>;
      default:
        return <UserManagementTab />;
    }
  };

  // Using your theme colors
  const activeTabClass = 'border-[#3949ac] text-[#3949ac] bg-[#e0e3fc]'; // Using a light variant of primary for active bg
  const inactiveTabClass = 'border-transparent text-gray-500 hover:text-[#5d6cc0] hover:border-gray-300';

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
         <h1 className="text-4xl font-extrabold text-gray-800 ">
             Admin <span style={{ color: '#3949ac' }}>Dashboard</span>
         </h1>
         <p className="text-lg text-gray-500 mt-1">Manage users, content, and platform settings.</p>
      </div>


      <div className="mb-8 border-b border-gray-300 overflow-x-auto">
        <nav className="-mb-px flex space-x-2 sm:space-x-4 justify-center flex-nowrap overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100" aria-label="Tabs">
          {/*
          <button
            onClick={() => setActiveTab('overview')}
            className={`whitespace-nowrap py-3 px-3 sm:px-4 border-b-2 font-semibold text-sm rounded-t-md flex items-center
                        ${activeTab === 'overview' ? activeTabClass : inactiveTabClass}`}
          >
            <FiBarChart2 className="mr-2 text-base sm:text-lg" /> Overview
          </button>
          */}
          <button
            onClick={() => setActiveTab('users')}
            className={`whitespace-nowrap py-3 px-3 sm:px-4 border-b-2 font-semibold text-sm rounded-t-md flex items-center
                        ${activeTab === 'users' ? activeTabClass : inactiveTabClass}`}
          >
            <FiUsers className="mr-2 text-base sm:text-lg" /> User Management
          </button>
          {/*
          <button
            onClick={() => setActiveTab('songs')}
            className={`whitespace-nowrap py-3 px-3 sm:px-4 border-b-2 font-semibold text-sm rounded-t-md flex items-center
                        ${activeTab === 'songs' ? activeTabClass : inactiveTabClass}`}
          >
            <FiMusic className="mr-2 text-base sm:text-lg" /> Song Management
          </button>
          <button
            onClick={() => setActiveTab('playlists')}
            className={`whitespace-nowrap py-3 px-3 sm:px-4 border-b-2 font-semibold text-sm rounded-t-md flex items-center
                        ${activeTab === 'playlists' ? activeTabClass : inactiveTabClass}`}
          >
            <FiList className="mr-2 text-base sm:text-lg" /> Playlist Management
          </button>
          */}
        </nav>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-2xl min-h-[300px]">
         {renderTabContent()}
      </div>
    </div>
  );
};

export default AdminDashboardPage;