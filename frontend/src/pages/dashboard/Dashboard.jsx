import axios from 'axios';
import React, { useEffect, useState } from 'react'
import Loading from '../../components/Loading';
import getBaseUrl from '../../utils/baseURL';
import { MdIncompleteCircle } from 'react-icons/md'
import { Link } from 'react-router-dom';
import { HiArrowRight } from 'react-icons/hi2';
import RevenueChart from './RevenueChart';
import { getImgUrl } from '../../utils/getImgUrl';

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({});
    
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
                console.error('Error:', error);
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    if(loading) return <Loading/>

    const recentOrders = data?.recentOrders || [];
    const topSellingBooks = data?.topSellingBooks || [];
    const recentUsers = data?.recentUsers || [];

    return (
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
                    <div className="inline-flex flex-shrink-0 items-center justify-center h-16 w-16 text-red-600 bg-red-100 rounded-full mr-6">
                        <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
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
    )
}

export default Dashboard
