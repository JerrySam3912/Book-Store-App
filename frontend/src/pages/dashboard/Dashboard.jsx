import axios from 'axios';
import React, { useEffect, useState, useMemo } from 'react'
import Loading from '../../components/Loading';
import getBaseUrl from '../../utils/baseURL';
import { MdIncompleteCircle } from 'react-icons/md'
import { Link } from 'react-router-dom';
import { HiArrowRight } from 'react-icons/hi2';
import RevenueChart from './RevenueChart';
import { getImgUrl } from '../../utils/getImgUrl';
import {
  useGetAnalyticsSummaryQuery,
  useGetSalesByCategoryQuery,
  useGetRevenueTrendsQuery,
  useGetUserGrowthQuery,
  useGetOrderStatusDistributionQuery,
  useGetTopCustomersQuery,
  useGetTopSellingBooksQuery,
} from '../../redux/features/analytics/analyticsApi';
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
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import LoadingSkeleton from '../../components/LoadingSkeleton';

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

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' or 'analytics'
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({});
    
    // Analytics queries
    const { data: analyticsSummary, isLoading: summaryLoading } = useGetAnalyticsSummaryQuery();
    const { data: salesByCategory, isLoading: categoryLoading } = useGetSalesByCategoryQuery();
    const { data: revenueTrends, isLoading: trendsLoading } = useGetRevenueTrendsQuery();
    const { data: userGrowth, isLoading: growthLoading } = useGetUserGrowthQuery();
    const { data: orderStatus, isLoading: statusLoading } = useGetOrderStatusDistributionQuery();
    const { data: topCustomers, isLoading: customersLoading } = useGetTopCustomersQuery(10);
    const { data: topBooksAnalytics, isLoading: booksLoading } = useGetTopSellingBooksQuery(10);
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${getBaseUrl()}/api/admin`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    },
                })

                setData(response.data);
                setLoading(false);
            } catch (error) {
                if (import.meta.env.DEV) {
                  console.error('Error:', error);
                }
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    // ✅ FIX: Di chuyển tất cả hooks (useMemo) lên TRƯỚC câu lệnh return có điều kiện
    // Order Status Distribution - Định nghĩa thứ tự và màu sắc cố định cho từng status
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
    // QUAN TRỌNG: useMemo phải được gọi TRƯỚC bất kỳ câu lệnh return có điều kiện nào
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

    // ✅ Early return SAU KHI tất cả hooks đã được gọi
    if(loading && activeTab === 'overview') return <Loading/>

    const recentOrders = data?.recentOrders || [];
    const topSellingBooks = data?.topSellingBooks || [];
    const recentUsers = data?.recentUsers || [];

    // Analytics chart data
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

    const analyticsData = analyticsSummary?.data || {};

    return (
        <>
            {/* Tabs Navigation */}
            <div className="mb-6 border-b border-gray-200">
                <nav className="flex space-x-8">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'overview'
                                ? 'border-purple-500 text-purple-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'analytics'
                                ? 'border-purple-500 text-purple-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Analytics & Reports
                    </button>
                </nav>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <>
                    {/* Stats Cards */}
                    <section className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
                        <div className="flex items-center p-8 bg-white shadow rounded-lg">
                            <div className="inline-flex flex-shrink-0 items-center justify-center h-16 w-16 text-purple-600 bg-purple-100 rounded-full mr-6">
                                <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <div>
                                <span className="block text-2xl font-bold">{data?.totalBooks || 0}</span>
                                <span className="block text-gray-500">Total Books</span>
                            </div>
                        </div>
                        <div className="flex items-center p-8 bg-white shadow rounded-lg">
                            <div className="inline-flex flex-shrink-0 items-center justify-center h-16 w-16 text-green-600 bg-green-100 rounded-full mr-6">
                                <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <div>
                                <span className="block text-2xl font-bold">${(Number(data?.totalSales) || 0).toFixed(2)}</span>
                                <span className="block text-gray-500">Total Sales</span>
                            </div>
                        </div>
                        <div className="flex items-center p-8 bg-white shadow rounded-lg">
                            <div className="inline-flex flex-shrink-0 items-center justify-center h-16 w-16 text-orange-600 bg-orange-100 rounded-full mr-6">
                                <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                            </div>
                            <div>
                                <span className="block text-2xl font-bold">{data?.trendingBooks || 0}</span>
                                <span className="block text-gray-500">Trending Books</span>
                            </div>
                        </div>
                        <div className="flex items-center p-8 bg-white shadow rounded-lg">
                            <div className="inline-flex flex-shrink-0 items-center justify-center h-16 w-16 text-blue-600 bg-blue-100 rounded-full mr-6">
                                <MdIncompleteCircle className='size-6'/>
                            </div>
                            <div>
                                <span className="block text-2xl font-bold">{data?.totalOrders || 0}</span>
                                <span className="block text-gray-500">Total Orders</span>
                            </div>
                        </div>
                    </section>

                    {/* Charts and Lists */}
                    <section className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
                        {/* Monthly Orders Chart */}
                        <div className="flex flex-col md:col-span-2 bg-white shadow rounded-lg">
                            <div className="px-6 py-5 font-semibold border-b border-gray-100">Orders per Month</div>
                            <div className="p-4 flex-grow" style={{ minHeight: '300px' }}>
                                <RevenueChart monthlyOrders={data?.monthlyOrders || []} />
                            </div>
                        </div>

                        {/* Recent Orders */}
                        <div className="flex flex-col bg-white shadow rounded-lg">
                            <div className="px-6 py-5 font-semibold border-b border-gray-100 flex items-center justify-between">
                                <span>Recent Orders</span>
                                <Link to="/dashboard/manage-orders" className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1">
                                    View All <HiArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                            <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
                                {recentOrders.length === 0 ? (
                                    <div className="p-6 text-center text-gray-500">No recent orders</div>
                                ) : (
                                    <ul className="p-4 space-y-3">
                                        {recentOrders.map((order) => (
                                            <li key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                                <div className="flex-1">
                                                    <div className="text-sm font-medium text-gray-900">#{order.id}</div>
                                                    <div className="text-xs text-gray-500">{order.name}</div>
                                                    <div className="text-xs text-gray-500">{order.email}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-semibold text-gray-900">${(Number(order.totalPrice) || 0).toFixed(2)}</div>
                                                    <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                                                        order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                                        order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                                                        order.status === 'PAID' ? 'bg-purple-100 text-purple-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        {order.status}
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Top Selling Books and Recent Users */}
                    <section className="grid md:grid-cols-2 gap-6 mt-6">
                        {/* Top Selling Books */}
                        <div className="bg-white shadow rounded-lg">
                            <div className="px-6 py-5 font-semibold border-b border-gray-100 flex items-center justify-between">
                                <span>Top Selling Books</span>
                                <Link to="/dashboard/manage-books" className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1">
                                    View All <HiArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                            <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
                                {topSellingBooks.length === 0 ? (
                                    <div className="p-6 text-center text-gray-500">No books sold yet</div>
                                ) : (
                                    <ul className="p-4 space-y-3">
                                        {topSellingBooks.map((book, index) => (
                                            <li key={book.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                                <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded overflow-hidden">
                                                    {book.coverImage && (
                                                        <img src={getImgUrl(book.coverImage)} alt={book.title} className="w-full h-full object-cover" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium text-gray-900 truncate">{book.title}</div>
                                                    <div className="text-xs text-gray-500">${(Number(book.price) || 0).toFixed(2)}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-semibold text-gray-900">{book.totalSold}</div>
                                                    <div className="text-xs text-gray-500">sold</div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        {/* Recent Users */}
                        <div className="bg-white shadow rounded-lg">
                            <div className="px-6 py-5 font-semibold border-b border-gray-100 flex items-center justify-between">
                                <span>Recent Users</span>
                                <Link to="/dashboard/manage-users" className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1">
                                    View All <HiArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                            <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
                                {recentUsers.length === 0 ? (
                                    <div className="p-6 text-center text-gray-500">No users yet</div>
                                ) : (
                                    <ul className="p-4 space-y-3">
                                        {recentUsers.map((user) => (
                                            <li key={user.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                                    <span className="text-purple-600 font-semibold text-sm">
                                                        {user.name ? user.name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium text-gray-900">{user.name || user.username}</div>
                                                    <div className="text-xs text-gray-500 truncate">{user.email}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                                                        user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                        {user.role}
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </section>
                </>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
                <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
                            <p className="text-2xl font-bold text-gray-800 mt-2">
                                ${(analyticsData.totalRevenue || 0).toFixed(2)}
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
                            <p className="text-2xl font-bold text-gray-800 mt-2">
                                {analyticsData.totalOrders || 0}
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
                            <p className="text-2xl font-bold text-gray-800 mt-2">
                                {analyticsData.totalUsers || 0}
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-sm font-medium text-gray-500">Total Books</h3>
                            <p className="text-2xl font-bold text-gray-800 mt-2">
                                {analyticsData.totalBooks || 0}
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-sm font-medium text-gray-500">This Month</h3>
                            <p className="text-2xl font-bold text-gray-800 mt-2">
                                ${(analyticsData.monthRevenue || 0).toFixed(2)}
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
                                            {topCustomers?.data?.length > 0 ? (
                                                topCustomers.data.map((customer) => (
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
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="3" className="px-4 py-3 text-center text-gray-500">
                                                        No customers yet
                                                    </td>
                                                </tr>
                                            )}
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
                                            {topBooksAnalytics?.data?.length > 0 ? (
                                                topBooksAnalytics.data.map((book) => (
                                                    <tr key={book.id}>
                                                        <td className="px-4 py-3">
                                                            <div className="text-sm font-medium text-gray-900">{book.title}</div>
                                                            <div className="text-sm text-gray-500">{book.author || 'Unknown'}</div>
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                            {book.totalSold}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            ${book.revenue.toFixed(2)}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="3" className="px-4 py-3 text-center text-gray-500">
                                                        No books sold yet
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Dashboard
