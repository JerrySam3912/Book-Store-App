import React, { useState } from 'react';
import { useGetAllOrdersQuery, useUpdateOrderStatusMutation } from '../../../redux/features/orders/ordersApi';
import { HiMagnifyingGlass } from 'react-icons/hi2';
import { HiOutlineEye } from 'react-icons/hi';
import Swal from 'sweetalert2';

const ManageOrders = () => {
  const [filters, setFilters] = useState({
    status: '',
    paymentStatus: '',
    search: '',
    page: 1,
    limit: 10,
  });

  const { data, isLoading, isError, refetch } = useGetAllOrdersQuery(filters);
  const [updateStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();

  const orders = data?.orders || [];
  const totalPages = data?.totalPages || 0;
  const currentPage = data?.page || 1;

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleStatusUpdate = async (orderId, newStatus, paymentStatus = null) => {
    try {
      const result = await Swal.fire({
        title: 'Update Order Status?',
        text: `Change status to ${newStatus}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, update it!',
      });

      if (result.isConfirmed) {
        await updateStatus({ id: orderId, status: newStatus, paymentStatus }).unwrap();
        Swal.fire('Updated!', 'Order status has been updated.', 'success');
        refetch();
      }
    } catch (error) {
      Swal.fire('Error!', error?.data?.message || 'Failed to update order status.', 'error');
    }
  };

  const handlePaymentStatusUpdate = async (orderId, newPaymentStatus) => {
    try {
      const result = await Swal.fire({
        title: 'Update Payment Status?',
        text: `Change payment status to ${newPaymentStatus}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, update it!',
      });

      if (result.isConfirmed) {
        await updateStatus({ id: orderId, paymentStatus: newPaymentStatus }).unwrap();
        Swal.fire('Updated!', 'Payment status has been updated.', 'success');
        refetch();
      }
    } catch (error) {
      Swal.fire('Error!', error?.data?.message || 'Failed to update payment status.', 'error');
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

  const getPaymentStatusBadge = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PAID: 'bg-green-100 text-green-800',
      REFUNDED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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
        Error loading orders. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Manage Orders</h1>
          <p className="text-gray-600 mt-1">View and manage all customer orders</p>
        </div>
        <div className="text-sm text-gray-600">
          Total: <span className="font-semibold">{data?.total || 0}</span> orders
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
              placeholder="Search by email, name, phone..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="SHIPPED">Shipped</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          {/* Payment Status Filter */}
          <select
            value={filters.paymentStatus}
            onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Payment Status</option>
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="REFUNDED">Refunded</option>
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

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">#{order._id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{order.name}</div>
                      <div className="text-sm text-gray-500">{order.email}</div>
                      <div className="text-sm text-gray-500">{order.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {order.items?.length || 0} item(s)
                      </div>
                      {order.items && order.items.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {order.items.slice(0, 2).map((item, idx) => (
                            <div key={idx}>
                              {item.title} (x{item.quantity})
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <div>+{order.items.length - 2} more</div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        ${(Number(order.totalPrice) || 0).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                        disabled={isUpdating}
                        className={`text-xs font-medium px-2 py-1 rounded-full border-0 ${getStatusBadge(order.status)} cursor-pointer`}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="PAID">Paid</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.paymentStatus}
                        onChange={(e) => handlePaymentStatusUpdate(order._id, e.target.value)}
                        disabled={isUpdating}
                        className={`text-xs font-medium px-2 py-1 rounded-full border-0 ${getPaymentStatusBadge(order.paymentStatus)} cursor-pointer`}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="PAID">Paid</option>
                        <option value="REFUNDED">Refunded</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          Swal.fire({
                            title: `Order #${order._id}`,
                            html: `
                              <div class="text-left">
                                <p><strong>Customer:</strong> ${order.name}</p>
                                <p><strong>Email:</strong> ${order.email}</p>
                                <p><strong>Phone:</strong> ${order.phone}</p>
                                <p><strong>Address:</strong> ${order.address?.city}, ${order.address?.state || ''} ${order.address?.zipcode || ''}</p>
                                <p><strong>Total:</strong> $${(Number(order.totalPrice) || 0).toFixed(2)}</p>
                                <hr class="my-2">
                                <p><strong>Items:</strong></p>
                                <ul class="list-disc list-inside">
                                  ${order.items?.map(item => `<li>${item.title} x${item.quantity} - $${(Number(item.totalPrice) || 0).toFixed(2)}</li>`).join('') || 'No items'}
                                </ul>
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

export default ManageOrders;

