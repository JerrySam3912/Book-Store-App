// src/pages/dashboard/analytics/AnalyticsPage.jsx
import React, { useMemo } from 'react';
import {
  useGetAnalyticsSummaryQuery,
  useGetSalesByCategoryQuery,
  useGetRevenueTrendsQuery,
  useGetUserGrowthQuery,
  useGetOrderStatusDistributionQuery,
  useGetTopCustomersQuery,
  useGetTopSellingBooksQuery,
} from '../../../redux/features/analytics/analyticsApi';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import LoadingSkeleton from '../../../components/LoadingSkeleton';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AnalyticsPage = () => {
  const { data: summary, isLoading: summaryLoading } = useGetAnalyticsSummaryQuery();
  const { data: salesByCategory, isLoading: categoryLoading } = useGetSalesByCategoryQuery();
  const { data: revenueTrends, isLoading: trendsLoading } = useGetRevenueTrendsQuery();
  const { data: userGrowth, isLoading: growthLoading } = useGetUserGrowthQuery();
  const { data: orderStatus, isLoading: statusLoading } = useGetOrderStatusDistributionQuery();
  const { data: topCustomers, isLoading: customersLoading } = useGetTopCustomersQuery(10);
  const { data: topBooks, isLoading: booksLoading } = useGetTopSellingBooksQuery(10);

  if (summaryLoading) {
    return <LoadingSkeleton type="page" />;
  }

  const summaryData = summary?.data || {};

  // Sales by Category Chart
  const categoryChartData = {
    labels: salesByCategory?.data?.map(item => item.category) || [],
    datasets: [
      {
        label: 'Revenue',
        data: salesByCategory?.data?.map(item => item.revenue) || [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Revenue Trends Chart
  const trendsChartData = {
    labels: revenueTrends?.data?.map(item => item.month) || [],
    datasets: [
      {
        label: 'Revenue',
        data: revenueTrends?.data?.map(item => item.revenue) || [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
      },
      {
        label: 'Orders',
        data: revenueTrends?.data?.map(item => item.orders) || [],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.4,
      },
    ],
  };

  // User Growth Chart
  const growthChartData = {
    labels: userGrowth?.data?.map(item => item.month) || [],
    datasets: [
      {
        label: 'New Users',
        data: userGrowth?.data?.map(item => item.newUsers) || [],
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.4,
      },
    ],
  };

  // Order Status Distribution
  // ✅ FIX: Định nghĩa thứ tự và màu sắc cố định cho từng status
  const STATUS_ORDER = ['PENDING', 'PAID', 'SHIPPED', 'COMPLETED', 'CANCELLED'];
  
  const statusColorMap = {
    'PENDING': 'rgba(255, 206, 86, 0.8)',      // Vàng (Yellow) - đậm hơn
    'PAID': 'rgba(34, 197, 94, 0.8)',          // Xanh lá cây (Green) - đậm hơn
    'SHIPPED': 'rgba(147, 51, 234, 0.8)',     // Tím (Purple) - đậm hơn
    'COMPLETED': 'rgba(21, 156, 111, 0.8)',    // Teal/Green đậm - đậm hơn
    'CANCELLED': 'rgba(239, 68, 68, 0.8)',     // Đỏ (Red) - đậm hơn
  };

  const statusBorderColorMap = {
    'PENDING': 'rgba(255, 206, 86, 1)',      // Vàng (Yellow)
    'PAID': 'rgba(34, 197, 94, 1)',          // Xanh lá cây (Green)
    'SHIPPED': 'rgba(147, 51, 234, 1)',     // Tím (Purple)
    'COMPLETED': 'rgba(21, 156, 111, 1)',    // Teal/Green đậm
    'CANCELLED': 'rgba(239, 68, 68, 1)',     // Đỏ (Red)
  };

  // ✅ Sử dụng useMemo để đảm bảo màu được tính toán đúng và ổn định
  const statusChartData = useMemo(() => {
    // Tạo map từ data API
    const statusDataMap = {};
    (orderStatus?.data || []).forEach(item => {
      statusDataMap[item.status] = item.count;
    });

    // Sắp xếp theo thứ tự cố định và chỉ lấy những status có data
    const sortedStatuses = STATUS_ORDER.filter(status => statusDataMap.hasOwnProperty(status));
    
    // Tạo arrays theo thứ tự cố định
    const statusLabels = sortedStatuses;
    const statusCounts = sortedStatuses.map(status => statusDataMap[status] || 0);
    const statusColors = sortedStatuses.map(status => statusColorMap[status]);
    const statusBorderColors = sortedStatuses.map(status => statusBorderColorMap[status]);

    return {
      labels: statusLabels,
      datasets: [
        {
          label: 'Orders',
          data: statusCounts,
          backgroundColor: statusColors,
          borderColor: statusBorderColors,
          borderWidth: 2,
        },
      ],
    };
  }, [orderStatus?.data]);

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-2">Comprehensive insights into your bookstore performance</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
          <p className="text-2xl font-bold text-gray-800 mt-2">
            ${(summaryData.totalRevenue || 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
          <p className="text-2xl font-bold text-gray-800 mt-2">
            {summaryData.totalOrders || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
          <p className="text-2xl font-bold text-gray-800 mt-2">
            {summaryData.totalUsers || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500">Total Books</h3>
          <p className="text-2xl font-bold text-gray-800 mt-2">
            {summaryData.totalBooks || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500">This Month</h3>
          <p className="text-2xl font-bold text-gray-800 mt-2">
            ${(summaryData.monthRevenue || 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Category */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Sales by Category</h2>
          {categoryLoading ? (
            <LoadingSkeleton type="page" />
          ) : (
            <Bar
              data={categoryChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: false,
                  },
                },
              }}
            />
          )}
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Order Status Distribution</h2>
          {statusLoading ? (
            <LoadingSkeleton type="page" />
          ) : (
            <Doughnut
              key={JSON.stringify(statusChartData)} // Force re-render khi data thay đổi
              data={statusChartData}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: {
                    position: 'right',
                    labels: {
                      padding: 15,
                      usePointStyle: true,
                      font: {
                        size: 12,
                      },
                    },
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        return `${label}: ${value} orders`;
                      }
                    }
                  }
                },
              }}
            />
          )}
        </div>

        {/* Revenue Trends */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Revenue Trends (Last 12 Months)</h2>
          {trendsLoading ? (
            <LoadingSkeleton type="page" />
          ) : (
            <Line
              data={trendsChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
              }}
            />
          )}
        </div>

        {/* User Growth */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">User Growth (Last 12 Months)</h2>
          {growthLoading ? (
            <LoadingSkeleton type="page" />
          ) : (
            <Line
              data={growthChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
              }}
            />
          )}
        </div>
      </div>

      {/* Top Customers & Books */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Customers */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Top Customers</h2>
          {customersLoading ? (
            <LoadingSkeleton type="table" />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Spent</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topCustomers?.data?.map((customer, index) => (
                    <tr key={customer.id}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {customer.name || customer.username}
                        </div>
                        <div className="text-sm text-gray-500">{customer.email}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {customer.totalOrders}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${customer.totalSpent.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top Selling Books */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Top Selling Books</h2>
          {booksLoading ? (
            <LoadingSkeleton type="table" />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Book</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sold</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topBooks?.data?.map((book) => (
                    <tr key={book.id}>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{book.title}</div>
                        <div className="text-sm text-gray-500">{book.author}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {book.totalSold}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${book.revenue.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;

