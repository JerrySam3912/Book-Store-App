import { configureStore } from '@reduxjs/toolkit'
import cartReducer from './features/cart/cartSlice'
import booksApi from './features/books/booksApi'
import ordersApi from './features/orders/ordersApi'
import wishlistApi from './features/wishlist/wishlistApi'
import reviewsApi from './features/reviews/reviewsApi'
import addressesApi from './features/addresses/addressesApi'
import usersApi from './features/users/usersApi'
import analyticsApi from './features/analytics/analyticsApi'
import settingsApi from './features/settings/settingsApi'
import authApi from './features/auth/authApi'
import subscriptionsApi from './features/subscriptions/subscriptionsApi'
import vouchersApi from './features/vouchers/vouchersApi'
import paymentsApi from './features/payments/paymentsApi'

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    [booksApi.reducerPath]: booksApi.reducer,
    [ordersApi.reducerPath]: ordersApi.reducer,
    [wishlistApi.reducerPath]: wishlistApi.reducer,
    [reviewsApi.reducerPath]: reviewsApi.reducer,
    [addressesApi.reducerPath]: addressesApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [analyticsApi.reducerPath]: analyticsApi.reducer,
    [settingsApi.reducerPath]: settingsApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [subscriptionsApi.reducerPath]: subscriptionsApi.reducer,
    [vouchersApi.reducerPath]: vouchersApi.reducer,
    [paymentsApi.reducerPath]: paymentsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(booksApi.middleware)
      .concat(ordersApi.middleware)
      .concat(wishlistApi.middleware)
      .concat(reviewsApi.middleware)
      .concat(addressesApi.middleware)
      .concat(usersApi.middleware)
      .concat(analyticsApi.middleware)
      .concat(settingsApi.middleware)
      .concat(authApi.middleware)
      .concat(subscriptionsApi.middleware)
      .concat(vouchersApi.middleware)
      .concat(paymentsApi.middleware),
})