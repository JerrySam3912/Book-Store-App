import React, { useState } from 'react'
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiMapPin } from 'react-icons/hi2'
import { useGetAddressesQuery, useCreateAddressMutation, useUpdateAddressMutation, useDeleteAddressMutation, useSetDefaultAddressMutation } from '../../redux/features/addresses/addressesApi'
import Swal from 'sweetalert2'
import Loading from '../../components/Loading'

// Address Form Component
const AddressForm = ({ address, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        fullName: address?.fullName || '',
        phone: address?.phone || '',
        line1: address?.line1 || '',
        city: address?.city || '',
        state: address?.state || '',
        country: address?.country || 'Vietnam',
        zipcode: address?.zipcode || '',
        isDefault: address?.isDefault || false,
    });

    const [createAddress, { isLoading: isCreating }] = useCreateAddressMutation();
    const [updateAddress, { isLoading: isUpdating }] = useUpdateAddressMutation();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (address) {
                // Update
                await updateAddress({ id: address._id, ...formData }).unwrap();
                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Address updated successfully!",
                    showConfirmButton: false,
                    timer: 1500
                });
            } else {
                // Create
                await createAddress(formData).unwrap();
                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Address added successfully!",
                    showConfirmButton: false,
                    timer: 1500
                });
            }
            onSuccess();
            onClose();
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error?.data?.message || "Failed to save address",
            });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">
                            {address ? 'Edit Address' : 'Add New Address'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 text-2xl"
                        >
                            ×
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Full Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Nguyen Van A"
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone *
                                </label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="0123456789"
                                />
                            </div>
                        </div>

                        {/* Address Line 1 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Street Address *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.line1}
                                onChange={(e) => setFormData({ ...formData, line1: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="123 Main Street, Ward 1"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* City */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    City *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Ho Chi Minh City"
                                />
                            </div>

                            {/* State */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    State/Province
                                </label>
                                <input
                                    type="text"
                                    value={formData.state}
                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="District 1"
                                />
                            </div>

                            {/* Zipcode */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Zipcode
                                </label>
                                <input
                                    type="text"
                                    value={formData.zipcode}
                                    onChange={(e) => setFormData({ ...formData, zipcode: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="70000"
                                />
                            </div>
                        </div>

                        {/* Country */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Country *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.country}
                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Vietnam"
                            />
                        </div>

                        {/* Is Default */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="isDefault"
                                checked={formData.isDefault}
                                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            />
                            <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
                                Set as default address
                            </label>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={isCreating || isUpdating}
                                className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                            >
                                {isCreating || isUpdating ? 'Saving...' : (address ? 'Update Address' : 'Add Address')}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// Address Card Component
const AddressCard = ({ address, onEdit }) => {
    const [deleteAddress, { isLoading: isDeleting }] = useDeleteAddressMutation();
    const [setDefaultAddress, { isLoading: isSettingDefault }] = useSetDefaultAddressMutation();

    const handleDelete = async () => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await deleteAddress(address._id).unwrap();
                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Address deleted!",
                    showConfirmButton: false,
                    timer: 1500
                });
            } catch (error) {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: error?.data?.message || "Failed to delete address",
                });
            }
        }
    };

    const handleSetDefault = async () => {
        try {
            await setDefaultAddress(address._id).unwrap();
            Swal.fire({
                position: "top-end",
                icon: "success",
                title: "Default address updated!",
                showConfirmButton: false,
                timer: 1500
            });
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error?.data?.message || "Failed to set default address",
            });
        }
    };

    return (
        <div className={`bg-white rounded-lg border-2 p-6 transition-all ${
            address.isDefault 
                ? 'border-indigo-500 bg-indigo-50' 
                : 'border-gray-200 hover:border-gray-300'
        }`}>
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                    <HiMapPin className="w-5 h-5 text-indigo-600" />
                    {address.isDefault && (
                        <span className="px-2 py-1 bg-indigo-600 text-white text-xs font-semibold rounded-full">
                            Default
                        </span>
                    )}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => onEdit(address)}
                        className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit"
                    >
                        <HiOutlinePencil className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete"
                    >
                        <HiOutlineTrash className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="space-y-2 text-gray-700">
                <p className="font-semibold text-lg">{address.fullName}</p>
                <p className="text-gray-600">{address.phone}</p>
                <p className="text-gray-600">
                    {address.line1}
                </p>
                <p className="text-gray-600">
                    {[address.city, address.state, address.country].filter(Boolean).join(', ')}
                    {address.zipcode && ` ${address.zipcode}`}
                </p>
            </div>

            {!address.isDefault && (
                <button
                    onClick={handleSetDefault}
                    disabled={isSettingDefault}
                    className="mt-4 w-full py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors disabled:opacity-50"
                >
                    {isSettingDefault ? 'Setting...' : 'Set as Default'}
                </button>
            )}
        </div>
    );
};

// Main Addresses Page
const AddressesPage = () => {
    const { data: addresses = [], isLoading, refetch } = useGetAddressesQuery();
    const [showForm, setShowForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);

    const handleAddNew = () => {
        setEditingAddress(null);
        setShowForm(true);
    };

    const handleEdit = (address) => {
        setEditingAddress(address);
        setShowForm(true);
    };

    const handleFormClose = () => {
        setShowForm(false);
        setEditingAddress(null);
    };

    const handleFormSuccess = () => {
        refetch();
    };

    if (isLoading) return <Loading />;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">My Addresses</h1>
                    <p className="text-gray-600">
                        Manage your delivery addresses ({addresses.length} {addresses.length === 1 ? 'address' : 'addresses'})
                    </p>
                </div>
                <button
                    onClick={handleAddNew}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                    <HiOutlinePlus className="w-5 h-5" />
                    Add New Address
                </button>
            </div>

            {/* Addresses Grid */}
            {addresses.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-lg">
                    <HiMapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-600 mb-2">No addresses yet</h3>
                    <p className="text-gray-500 mb-6">
                        Add your first address to get started
                    </p>
                    <button
                        onClick={handleAddNew}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                    >
                        Add Address
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {addresses.map((address) => (
                        <AddressCard
                            key={address._id}
                            address={address}
                            onEdit={handleEdit}
                            onDelete={() => refetch()}
                            onSetDefault={() => refetch()}
                        />
                    ))}
                </div>
            )}

            {/* Form Modal */}
            {showForm && (
                <AddressForm
                    address={editingAddress}
                    onClose={handleFormClose}
                    onSuccess={handleFormSuccess}
                />
            )}
        </div>
    );
};

export default AddressesPage;

