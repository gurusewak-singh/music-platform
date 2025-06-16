// client/src/pages/admin/UserManagementTab.jsx
import React, { useState, useEffect, useCallback, Fragment } from 'react';
import {
    getAllUsers,
    verifyArtistByAdmin,
    updateUserByAdmin,
    deleteUserByAdmin
} from '../../services/adminService';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import ConfirmationModal from '../../components/ui/ConfirmationModal'; // Import the new modal
import { FiCheckCircle, FiXCircle, FiEdit3, FiTrash2, FiKey, FiUserCheck, FiUserX, FiShield, FiUser, FiHelpCircle } from 'react-icons/fi';
import { Menu, Transition } from '@headlessui/react'; // For dropdowns
import { notifySuccess, notifyError } from '../../utils/notifications'; // Import helpers

const UserManagementTab = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // Stores the function to call on confirm
  const [confirmModalProps, setConfirmModalProps] = useState({}); // Title, message etc for modal
  // No pagination state for now, as backend getAllUsers doesn't support it yet

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllUsers(); // Assuming no pagination for now
      if (data.success) {
        setUsers(data.users);
      } else {
        setError(data.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError(err.message || 'Error fetching users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openConfirmation = (action, props) => {
    setConfirmAction(() => action); // Store the function itself
    setConfirmModalProps(props);
    setIsConfirmModalOpen(true);
  };

  const handleVerifyArtist = (userId, username) => {
     openConfirmation(
         async () => { // This is the action to confirm
             try {
                 setLoading(true);
                 await verifyArtistByAdmin(userId);
                 notifySuccess(`Artist "${username}" verified successfully!`); // Use toast
                 fetchUsers();
             } catch (err) {
                 notifyError(err.message || 'Failed to verify artist.'); // Use toast
                 setError(err.message || 'Failed to verify artist.'); // Still set local error if needed
             } finally {
                 setLoading(false);
             }
         },
         { // Props for the modal
             title: "Verify Artist",
             message: `Are you sure you want to verify artist "${username}"? Their role will be set to 'Artist' if it isn't already.`,
             confirmText: "Verify",
             icon: FiUserCheck,
             iconColorClass: "text-green-500",
             confirmButtonColorClass: "bg-green-600 hover:bg-green-700 focus:ring-green-500"
         }
     );
  };

  const handleRoleChange = async (userId, username, newRole) => {
     openConfirmation(
         async () => {
             try {
                 setLoading(true);
                 await updateUserByAdmin(userId, { role: newRole });
                 notifySuccess(`Role for "${username}" updated to ${newRole}.`); // Use toast
                 fetchUsers();
             } catch (err) {
                 notifyError(err.message || 'Failed to update role.'); // Use toast
                 setError(err.message || 'Failed to update role.');
             } finally {
                 setLoading(false);
             }
         },
         {
             title: "Change User Role",
             message: `Are you sure you want to change the role of ${username} to ${newRole}?`,
             confirmText: `Set to ${newRole.charAt(0).toUpperCase() + newRole.slice(1)}`,
             icon: FiShield, // Or FiUser, FiUserCheck based on newRole
             iconColorClass: "text-[#5d6cc0]", // Using your theme secondary color
             confirmButtonColorClass: "bg-[#3949ac] hover:bg-[#5d6cc0] focus:ring-[#5d6cc0]" // Using your theme primary/secondary
         }
     );
  };

  const handleDeleteUser = async (userId, username) => {
     openConfirmation(
         async () => {
             try {
                 setLoading(true);
                 await deleteUserByAdmin(userId);
                 notifySuccess(`User "${username}" deleted successfully!`); // Use toast
                 fetchUsers();
             } catch (err) {
                 notifyError(err.message || 'Failed to delete user.'); // Use toast
                 setError(err.message || 'Failed to delete user.');
             } finally {
                 setLoading(false);
             }
         },
         {
             title: "Delete User",
             message: `Are you sure you want to DELETE user ${username}? This action cannot be undone.`,
             confirmText: "Delete User",
             icon: FiTrash2, // FiAlertTriangle is default, explicitly setting for clarity
             iconColorClass: "text-red-500",
             confirmButtonColorClass: "bg-red-600 hover:bg-red-700 focus:ring-red-500"
         }
     );
  };

  if (loading && users.length === 0) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (error) return <Alert message={error} type="error" onClose={() => setError(null)} />;

  const roleColors = {
     admin: 'bg-red-100 text-red-700',
     artist: 'bg-sky-100 text-sky-700', // Using a theme-similar blue
     user: 'bg-gray-100 text-gray-700'
  };
  const verifiedColor = 'bg-green-100 text-green-700';
  const pendingColor = 'bg-yellow-100 text-yellow-700';


  return (
    <div>
      {loading && users.length > 0 && <div className="absolute top-4 right-4"><Spinner size="sm"/></div>}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Artist Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.username}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                  {user.artistName && <div className="text-xs text-[#5d6cc0]">Artist: {user.artistName}</div>}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${roleColors[user.role] || roleColors.user}`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {user.role === 'artist' ? (
                    user.isVerifiedArtist ? (
                      <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${verifiedColor}`}>
                        <FiUserCheck className="mr-1 -ml-0.5" /> Verified
                      </span>
                    ) : (
                      <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${pendingColor}`}>
                        <FiUserX className="mr-1 -ml-0.5" /> Pending
                      </span>
                    )
                  ) : (
                    <span className="text-gray-400 text-xs">N/A</span>
                  )}
                </td>
                 <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                     {new Date(user.createdAt).toLocaleDateString()}
                 </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                  <Menu as="div" className="relative inline-block text-left">
                    <div>
                      <Menu.Button className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-3 py-1.5 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5d6cc0]">
                        Actions
                        <FiEdit3 className="-mr-1 ml-2 h-4 w-4" aria-hidden="true" />
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
                        <div className="py-1">
                          {user.role === 'artist' && !user.isVerifiedArtist && (
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() => handleVerifyArtist(user._id, user.username)}
                                  className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} group flex rounded-md items-center w-full px-3 py-2 text-sm`}
                                >
                                  <FiKey className="mr-3 h-4 w-4 text-green-500" aria-hidden="true" />
                                  Verify Artist
                                </button>
                              )}
                            </Menu.Item>
                          )}
                          {/* Removed "Edit User (Future)" for now to focus on role change */}
                          <div className="px-3 py-2 text-xs text-gray-500">Change Role to:</div>
                          {['user', 'artist', 'admin'].map(role => (
                            user.role !== role &&
                            <Menu.Item key={role}>
                              {({ active }) => (
                                <button
                                  onClick={() => handleRoleChange(user._id, user.username, role)}
                                  className={`${active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} group flex rounded-md items-center w-full px-3 py-2 text-sm`}
                                >
                                 {role === 'admin' && <FiShield className="mr-3 h-4 w-4 text-red-500" aria-hidden="true" />}
                                 {role === 'artist' && <FiUserCheck className="mr-3 h-4 w-4 text-sky-500" aria-hidden="true" />}
                                 {role === 'user' && <FiUser className="mr-3 h-4 w-4 text-gray-500" aria-hidden="true" />}
                                  Set as {role.charAt(0).toUpperCase() + role.slice(1)}
                                </button>
                              )}
                            </Menu.Item>
                          ))}
                          <div className="border-t border-gray-100 my-1"></div>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() => handleDeleteUser(user._id, user.username)}
                                className={`${active ? 'bg-red-100 text-red-700' : 'text-red-600'} group flex rounded-md items-center w-full px-3 py-2 text-sm font-medium hover:text-red-700 hover:bg-red-50`}
                              >
                                <FiTrash2 className="mr-3 h-4 w-4" aria-hidden="true" />
                                Delete User
                              </button>
                            )}
                          </Menu.Item>
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && !loading && (
          <p className="text-center text-gray-500 py-10">No users found or an error occurred.</p>
        )}
      </div>
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmAction} // The function to call when "Confirm" is clicked
        title={confirmModalProps.title}
        message={confirmModalProps.message}
        confirmText={confirmModalProps.confirmText}
        cancelText={confirmModalProps.cancelText} // Can set default in ConfirmationModal
        icon={confirmModalProps.icon}
        iconColorClass={confirmModalProps.iconColorClass}
        confirmButtonColorClass={confirmModalProps.confirmButtonColorClass}
      />
    </div>
  );
};

export default UserManagementTab;