import React, { useState, useEffect } from 'react';
import { useGetAllUsersQuery, useUpdateUserStatusMutation, useUpdateUserByAdminMutation } from '../../../redux/features/users/usersApi';
import { useAuth } from '../../../context/AuthContext';
import { HiMagnifyingGlass } from 'react-icons/hi2';
import { HiOutlineEye } from 'react-icons/hi';
import { HiArrowDownTray } from 'react-icons/hi2';
import Swal from 'sweetalert2';
import { exportUsers } from '../../../utils/exportUtils';

const ManageUsers = () => {
  const { currentUser } = useAuth(); // Get current admin user
  const [filters, setFilters] = useState({
    role: '',
    search: '',
    isActive: '',
    page: 1,
    limit: 10,
  });

  const { data, isLoading, isError, error, refetch } = useGetAllUsersQuery(filters);
  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateUserStatusMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserByAdminMutation();

  const users = data?.users || [];
  const totalPages = data?.totalPages || 0;
  const currentPage = data?.page || 1;

  // Debug: Log data để kiểm tra
  useEffect(() => {
    if (data) {
      // Debug logs (remove in production)
      // console.log('✅ Users API Response:', data);
      // console.log('📊 Total users:', data.total);
      // console.log('👥 Users array:', data.users);
    }
    if (error) {
      // Error already handled by RTK Query
      // console.error('❌ Users API Error:', error);
      // console.error('Error details:', error?.data || error);
    }
  }, [data, error]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleStatusToggle = async (userId, currentStatus, userRole) => {
    // Prevent banning admin accounts
    if (userRole === 'ADMIN') {
      Swal.fire({
        title: 'Cannot Ban Admin',
        text: 'Admin accounts cannot be banned. Admin accounts are protected.',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }

    try {
      const result = await Swal.fire({
        title: currentStatus ? 'Ban User?' : 'Activate User?',
        text: currentStatus 
          ? 'This user will be banned and cannot login.' 
          : 'This user will be activated and can login again.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: currentStatus ? '#d33' : '#3085d6',
        cancelButtonColor: '#6c757d',
        confirmButtonText: currentStatus ? 'Yes, ban it!' : 'Yes, activate!',
      });

      if (result.isConfirmed) {
        await updateStatus({ id: userId, isActive: !currentStatus }).unwrap();
        Swal.fire(
          'Updated!',
          `User has been ${!currentStatus ? 'activated' : 'banned'}.`,
          'success'
        );
        refetch();
      }
    } catch (error) {
      Swal.fire('Error!', error?.data?.message || 'Failed to update user status.', 'error');
    }
  };

  const handleRoleChange = async (userId, newRole, currentRole) => {
    // Prevent downgrading admin to user
    if (currentRole === 'ADMIN' && newRole === 'USER') {
      Swal.fire({
        title: 'Cannot Change Role',
        text: 'Admin accounts cannot be downgraded to user. Admin accounts are protected.',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }

    try {
      const result = await Swal.fire({
        title: 'Change User Role?',
        text: `Change role to ${newRole}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, change it!',
      });

      if (result.isConfirmed) {
        await updateUser({ id: userId, role: newRole }).unwrap();
        Swal.fire('Updated!', 'User role has been updated.', 'success');
        refetch();
      }
    } catch (error) {
      Swal.fire('Error!', error?.data?.message || 'Failed to update user role.', 'error');
    }
  };

  const getRoleBadge = (role) => {
    return role === 'ADMIN' 
      ? 'bg-purple-100 text-purple-800' 
      : 'bg-blue-100 text-blue-800';
  };

  const getStatusBadge = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-300 rounded w-1/4 animate-pulse"></div>
        <div className="bg-white rounded-lg shadow-sm p-4 space-y-4 animate-pulse">
          <div className="h-10 bg-gray-300 rounded"></div>
          <div className="h-10 bg-gray-300 rounded"></div>
        </div>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200"></div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 border-b border-gray-200">
                <div className="px-6 py-4 flex gap-4">
                  <div className="h-4 bg-gray-300 rounded flex-1"></div>
                  <div className="h-4 bg-gray-300 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p className="font-semibold">Error loading users</p>
        <p className="text-sm mt-1">
          {error?.data?.message || error?.message || 'Please check your connection and try again.'}
        </p>
        <button
          onClick={() => refetch()}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Manage Users</h1>
          <p className="text-gray-600 mt-1">View and manage all registered users</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            Total: <span className="font-semibold">{data?.total || 0}</span> users
          </div>
          <button
            onClick={() => exportUsers(users)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <HiArrowDownTray className="h-5 w-5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <HiMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by email, name, username..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Role Filter */}
          <select
            value={filters.role}
            onChange={(e) => handleFilterChange('role', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Roles</option>
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>

          {/* Status Filter */}
          <select
            value={filters.isActive}
            onChange={(e) => handleFilterChange('isActive', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Banned</option>
          </select>

          {/* Limit */}
          <select
            value={filters.limit}
            onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="10">10 per page</option>
            <option value="20">20 per page</option>
            <option value="50">50 per page</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">#{user.id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{user.name || user.username}</div>
                      <div className="text-sm text-gray-500">@{user.username}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{user.email}</div>
                      {user.phone && (
                        <div className="text-sm text-gray-500">{user.phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.role === 'ADMIN' ? (
                        // Admin accounts: chỉ hiển thị text, không cho chỉnh
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${getRoleBadge(user.role)}`}>
                          Admin
                        </span>
                      ) : (
                        // User accounts: có thể chỉnh thành Admin
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value, user.role)}
                          disabled={isUpdating}
                          className={`text-xs font-medium px-2 py-1 rounded-full border-0 ${getRoleBadge(user.role)} cursor-pointer`}
                        >
                          <option value="USER">User</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.role === 'ADMIN' ? (
                        // Admin accounts: chỉ hiển thị status, không cho ban
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusBadge(user.isActive)}`}>
                          {user.isActive ? 'Active' : 'Banned'}
                        </span>
                      ) : (
                        // User accounts: có thể ban/unban
                        <button
                          onClick={() => handleStatusToggle(user.id, user.isActive, user.role)}
                          disabled={isUpdatingStatus}
                          className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusBadge(user.isActive)} hover:opacity-80 transition-opacity disabled:opacity-50`}
                        >
                          {user.isActive ? 'Active' : 'Banned'}
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          Swal.fire({
                            title: `User #${user.id}`,
                            html: `
                              <div class="text-left">
                                <p><strong>Username:</strong> @${user.username}</p>
                                <p><strong>Name:</strong> ${user.name || 'N/A'}</p>
                                <p><strong>Email:</strong> ${user.email}</p>
                                <p><strong>Phone:</strong> ${user.phone || 'N/A'}</p>
                                <p><strong>Role:</strong> ${user.role}</p>
                                <p><strong>Status:</strong> ${user.isActive ? 'Active' : 'Banned'}</p>
                                <p><strong>Created:</strong> ${new Date(user.createdAt).toLocaleString()}</p>
                                <p><strong>Updated:</strong> ${new Date(user.updatedAt).toLocaleString()}</p>
                              </div>
                            `,
                            icon: 'info',
                            confirmButtonText: 'Close',
                          });
                        }}
                        className="text-purple-600 hover:text-purple-900 flex items-center gap-1"
                      >
                        <HiOutlineEye className="h-5 w-5" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing page <span className="font-medium">{currentPage}</span> of{' '}
              <span className="font-medium">{totalPages}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setFilters(prev => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;

