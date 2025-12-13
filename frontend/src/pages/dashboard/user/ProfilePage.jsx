import React, { useState, useEffect } from 'react';
import { useGetUserProfileQuery, useUpdateUserProfileMutation, useChangePasswordMutation } from '../../redux/features/users/usersApi';
import { useGetOrderByEmailQuery } from '../../redux/features/orders/ordersApi';
import { useAuth } from '../../context/AuthContext';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { HiUser, HiPhone, HiEnvelope, HiLockClosed, HiShoppingBag } from 'react-icons/hi2';

const ProfilePage = () => {
  const { currentUser } = useAuth();
  const { data: profile, isLoading: isLoadingProfile, refetch } = useGetUserProfileQuery();
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateUserProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();
  const { data: orders = [] } = useGetOrderByEmailQuery(currentUser?.email);

  const [activeTab, setActiveTab] = useState('profile');
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const { register: registerProfile, handleSubmit: handleSubmitProfile, setValue, formState: { errors: profileErrors } } = useForm();
  const { register: registerPassword, handleSubmit: handleSubmitPassword, reset: resetPassword, formState: { errors: passwordErrors } } = useForm();

  // Load profile data into form
  useEffect(() => {
    if (profile) {
      setValue('name', profile.name || '');
      setValue('phone', profile.phone || '');
    }
  }, [profile, setValue]);

  const onProfileSubmit = async (data) => {
    try {
      await updateProfile(data).unwrap();
      Swal.fire('Success!', 'Profile updated successfully.', 'success');
      refetch();
      // Update localStorage user
      const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...savedUser, ...data }));
    } catch (error) {
      Swal.fire('Error!', error?.data?.message || 'Failed to update profile.', 'error');
    }
  };

  const onPasswordSubmit = async (data) => {
    try {
      await changePassword(data).unwrap();
      Swal.fire('Success!', 'Password changed successfully.', 'success');
      resetPassword();
      setShowPasswordForm(false);
    } catch (error) {
      Swal.fire('Error!', error?.data?.message || 'Failed to change password.', 'error');
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PAID: 'bg-blue-100 text-blue-800',
      SHIPPED: 'bg-purple-100 text-purple-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-8 animate-pulse"></div>
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-6 animate-pulse">
            <div className="h-6 bg-gray-300 rounded w-1/3"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-300 rounded w-1/6"></div>
              <div className="h-10 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-1/6"></div>
              <div className="h-10 bg-gray-300 rounded"></div>
            </div>
            <div className="h-10 bg-gray-300 rounded w-32"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'profile'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Profile Information
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'orders'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Order History ({orders.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
              
              <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <HiEnvelope className="inline h-4 w-4 mr-1" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile?.email || ''}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <HiUser className="inline h-4 w-4 mr-1" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    {...registerProfile('name', { required: 'Name is required' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  {profileErrors.name && (
                    <p className="text-red-500 text-sm mt-1">{profileErrors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <HiPhone className="inline h-4 w-4 mr-1" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    {...registerProfile('phone')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>

            {/* Change Password Section */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Password</h2>
                <button
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                >
                  {showPasswordForm ? 'Cancel' : 'Change Password'}
                </button>
              </div>

              {showPasswordForm && (
                <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <HiLockClosed className="inline h-4 w-4 mr-1" />
                      Current Password
                    </label>
                    <input
                      type="password"
                      {...registerPassword('currentPassword', { required: 'Current password is required' })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    {passwordErrors.currentPassword && (
                      <p className="text-red-500 text-sm mt-1">{passwordErrors.currentPassword.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      {...registerPassword('newPassword', {
                        required: 'New password is required',
                        minLength: { value: 6, message: 'Password must be at least 6 characters' },
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    {passwordErrors.newPassword && (
                      <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isChangingPassword ? 'Changing...' : 'Change Password'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Order History</h2>
            
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <HiShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">You have no orders yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-semibold text-gray-900">Order #{order._id}</span>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusBadge(order.status)}`}>
                            {order.status}
                          </span>
                          {order.paymentStatus && (
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusBadge(order.paymentStatus)}`}>
                              Payment: {order.paymentStatus}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          Date: {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          Items: {order.productIds?.length || 0} item(s)
                        </p>
                        <p className="text-sm text-gray-600">
                          Address: {order.address?.city}, {order.address?.state || ''} {order.address?.zipcode || ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">${(Number(order.totalPrice) || 0).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;

