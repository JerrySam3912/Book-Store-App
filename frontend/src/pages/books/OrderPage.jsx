import React from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useGetOrderByEmailQuery } from '../../redux/features/orders/ordersApi'
import { useAuth } from '../../context/AuthContext'
import { HiOutlineShoppingBag, HiOutlineTruck, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineClock } from 'react-icons/hi2'
import Loading from '../../components/Loading'

// Status badge component
const StatusBadge = ({ status, type = 'order' }) => {
    const getStatusConfig = () => {
        if (type === 'order') {
            switch (status) {
                case 'PENDING':
                    return { color: 'bg-yellow-100 text-yellow-800', icon: HiOutlineClock, label: 'Pending' };
                case 'PAID':
                    return { color: 'bg-blue-100 text-blue-800', icon: HiOutlineCheckCircle, label: 'Paid' };
                case 'SHIPPED':
                    return { color: 'bg-purple-100 text-purple-800', icon: HiOutlineTruck, label: 'Shipped' };
                case 'COMPLETED':
                    return { color: 'bg-green-100 text-green-800', icon: HiOutlineCheckCircle, label: 'Completed' };
                case 'CANCELLED':
                    return { color: 'bg-red-100 text-red-800', icon: HiOutlineXCircle, label: 'Cancelled' };
                default:
                    return { color: 'bg-gray-100 text-gray-800', icon: HiOutlineClock, label: status };
            }
        } else {
            // Payment status
            switch (status) {
                case 'PENDING':
                    return { color: 'bg-yellow-100 text-yellow-800', label: 'Payment Pending' };
                case 'PAID':
                    return { color: 'bg-green-100 text-green-800', label: 'Paid' };
                case 'FAILED':
                    return { color: 'bg-red-100 text-red-800', label: 'Payment Failed' };
                case 'REFUNDED':
                    return { color: 'bg-gray-100 text-gray-800', label: 'Refunded' };
                default:
                    return { color: 'bg-gray-100 text-gray-800', label: status };
            }
        }
    };

    const config = getStatusConfig();
    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
            {Icon && <Icon className="w-4 h-4" />}
            {config.label}
        </span>
    );
};

// Order progress tracker
const OrderProgress = ({ status }) => {
    const steps = [
        { key: 'PENDING', label: 'Order Placed' },
        { key: 'PAID', label: 'Payment Confirmed' },
        { key: 'SHIPPED', label: 'Shipped' },
        { key: 'COMPLETED', label: 'Delivered' },
    ];

    const getStepStatus = (stepKey) => {
        const statusOrder = ['PENDING', 'PAID', 'SHIPPED', 'COMPLETED'];
        const currentIndex = statusOrder.indexOf(status);
        const stepIndex = statusOrder.indexOf(stepKey);
        
        if (status === 'CANCELLED') return 'cancelled';
        if (stepIndex < currentIndex) return 'completed';
        if (stepIndex === currentIndex) return 'current';
        return 'pending';
    };

    if (status === 'CANCELLED') {
        return (
            <div className="flex items-center justify-center py-4 bg-red-50 rounded-lg">
                <HiOutlineXCircle className="w-6 h-6 text-red-500 mr-2" />
                <span className="text-red-600 font-medium">Order Cancelled</span>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between py-4">
            {steps.map((step, index) => {
                const stepStatus = getStepStatus(step.key);
                return (
                    <React.Fragment key={step.key}>
                        <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                stepStatus === 'completed' ? 'bg-green-500 text-white' :
                                stepStatus === 'current' ? 'bg-indigo-500 text-white' :
                                'bg-gray-200 text-gray-500'
                            }`}>
                                {stepStatus === 'completed' ? '✓' : index + 1}
                            </div>
                            <span className={`mt-2 text-xs ${
                                stepStatus === 'current' ? 'text-indigo-600 font-medium' : 'text-gray-500'
                            }`}>
                                {step.label}
                            </span>
                        </div>
                        {index < steps.length - 1 && (
                            <div className={`flex-1 h-1 mx-2 ${
                                getStepStatus(steps[index + 1].key) !== 'pending' ? 'bg-green-500' : 'bg-gray-200'
                            }`} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

const OrderPage = () => {
    // All hooks must be called before any conditional returns
    const { currentUser } = useAuth();
    const { data: orders = [], isLoading, isError } = useGetOrderByEmailQuery(currentUser?.email, {
        skip: !currentUser?.email,
    });

    // Check admin after all hooks are called
    const isAdmin = currentUser?.role === "ADMIN";
    if (isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    if (isLoading) return <Loading />;
    if (isError) return <div className="text-center py-10 text-red-500">Error loading orders</div>;

    return (
        <div className='container mx-auto p-6 max-w-4xl'>
            <div className="flex items-center gap-3 mb-8">
                <HiOutlineShoppingBag className="w-8 h-8 text-indigo-600" />
                <h2 className='text-2xl font-bold text-gray-800'>Your Orders</h2>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-lg">
                    <HiOutlineShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-600 mb-2">No orders yet</h3>
                    <p className="text-gray-500 mb-6">Start shopping to see your orders here!</p>
                    <Link to="/" className="btn-primary px-6 py-2">
                        Browse Books
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order, index) => (
                        <div key={order._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                            {/* Order Header */}
                            <div className="bg-gray-50 px-6 py-4 border-b">
                                <div className="flex flex-wrap justify-between items-center gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Order #{index + 1}</p>
                                        <p className="text-xs text-gray-400">ID: {order._id}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-500">
                                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                        <p className="text-lg font-bold text-indigo-600">${order.totalPrice}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Order Status */}
                            <div className="px-6 py-4 border-b">
                                <div className="flex flex-wrap gap-3 mb-4">
                                    <StatusBadge status={order.status} type="order" />
                                    <StatusBadge status={order.paymentStatus} type="payment" />
                                    {order.paymentMethod && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                                            {order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod}
                                        </span>
                                    )}
                                </div>
                                <OrderProgress status={order.status} />
                            </div>

                            {/* Order Details */}
                            <div className="px-6 py-4">
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Customer Info */}
                                    <div>
                                        <h4 className="font-semibold text-gray-800 mb-2">Customer Details</h4>
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <p><span className="font-medium">Name:</span> {order.name}</p>
                                            <p><span className="font-medium">Email:</span> {order.email}</p>
                                            <p><span className="font-medium">Phone:</span> {order.phone}</p>
                                        </div>
                                    </div>

                                    {/* Shipping Address */}
                                    <div>
                                        <h4 className="font-semibold text-gray-800 mb-2">Shipping Address</h4>
                                        <div className="text-sm text-gray-600">
                                            <p>{order.address?.city}{order.address?.state && `, ${order.address.state}`}</p>
                                            <p>{order.address?.country}{order.address?.zipcode && ` - ${order.address.zipcode}`}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Products */}
                                <div className="mt-4 pt-4 border-t">
                                    <h4 className="font-semibold text-gray-800 mb-2">
                                        Products ({order.productIds?.length || 0} items)
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {order.productIds?.map((productId, idx) => (
                                            <Link 
                                                key={`${productId}-${idx}`}
                                                to={`/books/${productId}`}
                                                className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm hover:bg-indigo-100 transition-colors"
                                            >
                                                Book #{productId}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default OrderPage