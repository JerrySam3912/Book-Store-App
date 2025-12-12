import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from "react-hook-form"
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HiMapPin, HiOutlinePlus } from 'react-icons/hi2';

import Swal from 'sweetalert2';
import { useCreateOrderMutation } from '../../redux/features/orders/ordersApi';
import { clearCart } from '../../redux/features/cart/cartSlice';
import { useGetAddressesQuery } from '../../redux/features/addresses/addressesApi';

const CheckoutPage = () => {
    const cartItems = useSelector(state => state.cart.cartItems);
    const dispatch = useDispatch();
    
    // Tính tổng tiền có tính quantity
    const totalPrice = cartItems.reduce((acc, item) => acc + (item.newPrice * (item.quantity || 1)), 0).toFixed(2);
    // Tổng số lượng sách
    const totalItems = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
    
    const { currentUser } = useAuth();
    const {
        register,
        handleSubmit,
        setValue,
    } = useForm();

    const [createOrder, { isLoading }] = useCreateOrderMutation();
    const navigate = useNavigate();

    // Fetch addresses
    const { data: addresses = [], isLoading: isLoadingAddresses } = useGetAddressesQuery();
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [useSavedAddress, setUseSavedAddress] = useState(false);

    const [isChecked, setIsChecked] = useState(false);

    // Auto-fill form khi chọn địa chỉ
    useEffect(() => {
        if (selectedAddressId && useSavedAddress) {
            const address = addresses.find(addr => addr._id === selectedAddressId);
            if (address) {
                setValue('name', address.fullName);
                setValue('phone', address.phone);
                setValue('address', address.line1);
                setValue('city', address.city);
                setValue('state', address.state || '');
                setValue('country', address.country);
                setValue('zipcode', address.zipcode || '');
            }
        }
    }, [selectedAddressId, useSavedAddress, addresses, setValue]);

    // Auto-select default address nếu có
    useEffect(() => {
        if (addresses.length > 0 && !selectedAddressId) {
            const defaultAddress = addresses.find(addr => addr.isDefault);
            if (defaultAddress) {
                // Use setTimeout to avoid setState in effect warning
                setTimeout(() => {
                    setSelectedAddressId(defaultAddress._id);
                    setUseSavedAddress(true);
                }, 0);
            }
        }
    }, [addresses, selectedAddressId]);
    
    const onSubmit = async (data) => {
        // Tạo mảng productIds với quantity (mỗi sách xuất hiện quantity lần)
        const productIdsWithQuantity = cartItems.map(item => ({
            bookId: item._id,
            quantity: item.quantity || 1
        }));
     
        const newOrder = {
            name: data.name,
            email: currentUser?.email,
            address: {
                city: data.city,
                country: data.country,
                state: data.state,
                zipcode: data.zipcode
            },
            phone: data.phone,
            productIds: productIdsWithQuantity,
            totalPrice: totalPrice,
            addressId: useSavedAddress ? selectedAddressId : null, // Link tới address nếu dùng saved address
        };
        
        try {
            await createOrder(newOrder).unwrap();
            
            // Clear Redux cart sau khi checkout thành công
            dispatch(clearCart());
            
            Swal.fire({
                title: "Order Confirmed!",
                text: "Your order has been placed successfully!",
                icon: "success",
                confirmButtonColor: "#3085d6",
                confirmButtonText: "View Orders"
              });
            navigate("/orders");
        } catch (error) {
            console.error("Error placing order:", error);
            Swal.fire({
                title: "Error",
                text: "Failed to place your order. Please try again.",
                icon: "error",
                confirmButtonText: "OK"
            });
        }
    };

    if(isLoading || isLoadingAddresses) return <div className="min-h-screen flex items-center justify-center">Loading....</div>
    
    return (
        <section>
            <div className="min-h-screen p-6 bg-gray-100 flex items-center justify-center">
                <div className="container max-w-screen-lg mx-auto">
                    <div>
                        <div>
                            <h2 className="font-semibold text-xl text-gray-600 mb-2">Cash On Delivery</h2>
                            <p className="text-gray-500 mb-2">Total Price: ${totalPrice}</p>
                            <p className="text-gray-500 mb-6">
                                Items: {totalItems} ({cartItems.length} {cartItems.length === 1 ? 'product' : 'different products'})
                            </p>
                        </div>

                        {/* Saved Addresses Section */}
                        {addresses.length > 0 && (
                            <div className="bg-white rounded shadow-lg p-4 md:p-6 mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                                        <HiMapPin className="w-5 h-5 text-indigo-600" />
                                        Saved Addresses
                                    </h3>
                                    <Link
                                        to="/addresses"
                                        className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                                    >
                                        <HiOutlinePlus className="w-4 h-4" />
                                        Manage Addresses
                                    </Link>
                                </div>
                                
                                <div className="mb-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={useSavedAddress}
                                            onChange={(e) => {
                                                setUseSavedAddress(e.target.checked);
                                                if (!e.target.checked) {
                                                    setSelectedAddressId(null);
                                                } else if (addresses.length > 0 && !selectedAddressId) {
                                                    const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
                                                    setSelectedAddressId(defaultAddr._id);
                                                }
                                            }}
                                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                        />
                                        <span className="text-sm text-gray-700">Use saved address</span>
                                    </label>
                        </div>

                                {useSavedAddress && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {addresses.map((address) => (
                                            <div
                                                key={address._id}
                                                onClick={() => setSelectedAddressId(address._id)}
                                                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                                    selectedAddressId === address._id
                                                        ? 'border-indigo-500 bg-indigo-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        {address.isDefault && (
                                                            <span className="inline-block px-2 py-1 bg-indigo-600 text-white text-xs font-semibold rounded-full mb-2">
                                                                Default
                                                            </span>
                                                        )}
                                                        <p className="font-semibold text-gray-800">{address.fullName}</p>
                                                        <p className="text-sm text-gray-600">{address.phone}</p>
                                                        <p className="text-sm text-gray-600 mt-1">{address.line1}</p>
                                                        <p className="text-sm text-gray-600">
                                                            {[address.city, address.state, address.country].filter(Boolean).join(', ')}
                                                            {address.zipcode && ` ${address.zipcode}`}
                                                        </p>
                                                    </div>
                                                    {selectedAddressId === address._id && (
                                                        <div className="text-indigo-600">
                                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Manual Address Form */}
                            <div className="bg-white rounded shadow-lg p-4 px-4 md:p-8 mb-6">
                                <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 gap-y-2 text-sm grid-cols-1 lg:grid-cols-3 my-8">
                                    <div className="text-gray-600">
                                        <p className="font-medium text-lg">
                                            {useSavedAddress ? 'Delivery Address' : 'Personal Details'}
                                        </p>
                                        <p>
                                            {useSavedAddress 
                                                ? 'Using saved address above' 
                                                : 'Please fill out all the fields.'}
                                        </p>
                                        {addresses.length === 0 && (
                                            <Link
                                                to="/addresses"
                                                className="text-indigo-600 hover:text-indigo-700 text-sm mt-2 inline-flex items-center gap-1"
                                            >
                                                <HiOutlinePlus className="w-4 h-4" />
                                                Add address for faster checkout
                                            </Link>
                                        )}
                                    </div>

                                    <div className="lg:col-span-2">
                                        <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 md:grid-cols-5">
                                            <div className="md:col-span-5">
                                                <label htmlFor="full_name">Full Name</label>
                                                <input
                                                    {...register("name", { required: !useSavedAddress })}
                                                    type="text" 
                                                    name="name" 
                                                    id="name" 
                                                    disabled={useSavedAddress}
                                                    className="h-10 border mt-1 rounded px-4 w-full bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed" />
                                            </div>

                                            <div className="md:col-span-5">
                                                <label html="email">Email Address</label>
                                                <input

                                                    type="text" name="email" id="email" className="h-10 border mt-1 rounded px-4 w-full bg-gray-50"
                                                    disabled
                                                    defaultValue={currentUser?.email}
                                                    placeholder="email@domain.com" />
                                            </div>
                                            <div className="md:col-span-5">
                                                <label html="phone">Phone Number</label>
                                                <input
                                                    {...register("phone", { required: !useSavedAddress })}
                                                    type="tel" 
                                                    name="phone" 
                                                    id="phone" 
                                                    disabled={useSavedAddress}
                                                    className="h-10 border mt-1 rounded px-4 w-full bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed" 
                                                    placeholder="+123 456 7890" />
                                            </div>

                                            <div className="md:col-span-3">
                                                <label htmlFor="address">Address / Street</label>
                                                <input
                                                    {...register("address", { required: !useSavedAddress })}
                                                    type="text" 
                                                    name="address" 
                                                    id="address" 
                                                    disabled={useSavedAddress}
                                                    className="h-10 border mt-1 rounded px-4 w-full bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed" 
                                                    placeholder="" />
                                            </div>

                                            <div className="md:col-span-2">
                                                <label htmlFor="city">City</label>
                                                <input
                                                    {...register("city", { required: !useSavedAddress })}
                                                    type="text" 
                                                    name="city" 
                                                    id="city" 
                                                    disabled={useSavedAddress}
                                                    className="h-10 border mt-1 rounded px-4 w-full bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed" 
                                                    placeholder="" />
                                            </div>

                                            <div className="md:col-span-2">
                                                <label htmlFor="country">Country / region</label>
                                                <div className="h-10 bg-gray-50 flex border border-gray-200 rounded items-center mt-1">
                                                    <input
                                                        {...register("country", { required: !useSavedAddress })}
                                                        name="country" 
                                                        id="country" 
                                                        disabled={useSavedAddress}
                                                        placeholder="Country" 
                                                        className="px-4 appearance-none outline-none text-gray-800 w-full bg-transparent disabled:bg-gray-100 disabled:cursor-not-allowed" />
                                                </div>
                                            </div>

                                            <div className="md:col-span-2">
                                                <label htmlFor="state">State / province</label>
                                                <div className="h-10 bg-gray-50 flex border border-gray-200 rounded items-center mt-1">
                                                    <input
                                                        {...register("state", { required: false })}
                                                        name="state" 
                                                        id="state" 
                                                        disabled={useSavedAddress}
                                                        placeholder="State" 
                                                        className="px-4 appearance-none outline-none text-gray-800 w-full bg-transparent disabled:bg-gray-100 disabled:cursor-not-allowed" />
                                                </div>
                                            </div>

                                            <div className="md:col-span-1">
                                                <label htmlFor="zipcode">Zipcode</label>
                                                <input
                                                    {...register("zipcode", { required: false })}
                                                    type="text" 
                                                    name="zipcode" 
                                                    id="zipcode" 
                                                    disabled={useSavedAddress}
                                                    className="transition-all flex items-center h-10 border mt-1 rounded px-4 w-full bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed" 
                                                    placeholder="" />
                                            </div>

                                            <div className="md:col-span-5 mt-3">
                                                <div className="inline-flex items-center">
                                                    <input
                                                        onChange={(e) => setIsChecked(e.target.checked)}
                                                        type="checkbox" name="billing_same" id="billing_same" className="form-checkbox" />
                                                    <label htmlFor="billing_same" className="ml-2 ">I am aggree to the <Link className='underline underline-offset-2 text-blue-600'>Terms & Conditions</Link> and <Link className='underline underline-offset-2 text-blue-600'>Shoping Policy.</Link></label>
                                                </div>
                                            </div>



                                            <div className="md:col-span-5 text-right">
                                                <div className="inline-flex items-end">
                                                    <button
                                                        disabled={!isChecked}
                                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Place an Order</button>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </form>
                            </div>
                        


                    </div>


                </div>
            </div>
        </section>
    )
}

export default CheckoutPage