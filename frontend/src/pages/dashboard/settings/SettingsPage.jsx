// src/pages/dashboard/settings/SettingsPage.jsx
import React, { useState } from 'react';
import { useGetSettingsQuery, useUpdateSettingsMutation } from '../../../redux/features/settings/settingsApi';
import Swal from 'sweetalert2';
import LoadingSkeleton from '../../../components/LoadingSkeleton';

const SettingsPage = () => {
  const { data, isLoading } = useGetSettingsQuery();
  const [updateSettings, { isLoading: isUpdating }] = useUpdateSettingsMutation();
  
  const [formData, setFormData] = useState({
    siteName: '',
    siteDescription: '',
    currency: 'USD',
    timezone: 'UTC',
    emailNotifications: true,
    paymentMethods: ['COD', 'CREDIT_CARD'],
  });

  React.useEffect(() => {
    if (data?.data) {
      setFormData(data.data);
    }
  }, [data]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handlePaymentMethodChange = (method) => {
    setFormData(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.includes(method)
        ? prev.paymentMethods.filter(m => m !== method)
        : [...prev.paymentMethods, method],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateSettings(formData).unwrap();
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Settings updated successfully',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error?.data?.message || 'Failed to update settings',
      });
    }
  };

  if (isLoading) {
    return <LoadingSkeleton type="page" />;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your bookstore settings</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        {/* Site Settings */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Site Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Name
              </label>
              <input
                type="text"
                name="siteName"
                value={formData.siteName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Description
              </label>
              <textarea
                name="siteDescription"
                value={formData.siteDescription}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>
        </div>

        {/* General Settings */}
        <div>
          <h2 className="text-xl font-semibold mb-4">General Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="VND">VND</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timezone
              </label>
              <select
                name="timezone"
                value={formData.timezone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York</option>
                <option value="Europe/London">Europe/London</option>
                <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Notification Settings</h2>
          <div className="flex items-center">
            <input
              type="checkbox"
              name="emailNotifications"
              checked={formData.emailNotifications}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Enable Email Notifications
            </label>
          </div>
        </div>

        {/* Payment Methods */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Payment Methods</h2>
          <div className="space-y-2">
            {['COD', 'CREDIT_CARD', 'PAYPAL', 'STRIPE'].map((method) => (
              <div key={method} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.paymentMethods.includes(method)}
                  onChange={() => handlePaymentMethodChange(method)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  {method.replace('_', ' ')}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isUpdating}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isUpdating ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;

