import { createSlice } from "@reduxjs/toolkit";
import Swal from "sweetalert2";

// Load cart from localStorage on initialization
const loadCartFromStorage = () => {
    try {
        const cartData = localStorage.getItem('cartItems');
        if (cartData) {
            return JSON.parse(cartData);
        }
    } catch (error) {
        // Silent fail - cart will be empty if localStorage is corrupted
        if (import.meta.env.DEV) {
          console.error('Error loading cart from localStorage:', error);
        }
    }
    return [];
}

// Save cart to localStorage
const saveCartToStorage = (cartItems) => {
    try {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    } catch (error) {
        // Silent fail - cart will work but won't persist
        if (import.meta.env.DEV) {
          console.error('Error saving cart to localStorage:', error);
        }
    }
}

const initialState = {
    cartItems: loadCartFromStorage() // Load from localStorage on init
}

const cartSlice = createSlice({
    name: 'cart',
    initialState: initialState,
    reducers: {
        addToCart: (state, action) => {
            const existingItem = state.cartItems.find(item => item._id === action.payload._id);
            if (!existingItem) {
                // Thêm sách mới vào giỏ với quantity = 1
                state.cartItems.push({ ...action.payload, quantity: 1 });
                saveCartToStorage(state.cartItems); // Save to localStorage
                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Product Added to the Cart",
                    showConfirmButton: false,
                    timer: 1500
                });
            } else {
                // Sách đã có trong giỏ -> tăng quantity
                existingItem.quantity += 1;
                saveCartToStorage(state.cartItems); // Save to localStorage
                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: `Quantity updated (${existingItem.quantity})`,
                    showConfirmButton: false,
                    timer: 1500
                });
            }
        },
        removeFromCart: (state, action) => {
            state.cartItems = state.cartItems.filter(item => item._id !== action.payload._id);
            saveCartToStorage(state.cartItems); // Save to localStorage
        },
        updateQuantity: (state, action) => {
            const { _id, quantity } = action.payload;
            const item = state.cartItems.find(item => item._id === _id);
            if (item) {
                if (quantity <= 0) {
                    // Xóa item nếu quantity <= 0
                    state.cartItems = state.cartItems.filter(i => i._id !== _id);
                } else {
                    item.quantity = quantity;
                }
                saveCartToStorage(state.cartItems); // Save to localStorage
            }
        },
        incrementQuantity: (state, action) => {
            const item = state.cartItems.find(item => item._id === action.payload._id);
            if (item) {
                item.quantity += 1;
                saveCartToStorage(state.cartItems); // Save to localStorage
            }
        },
        decrementQuantity: (state, action) => {
            const item = state.cartItems.find(item => item._id === action.payload._id);
            if (item) {
                if (item.quantity > 1) {
                    item.quantity -= 1;
                } else {
                    // Nếu quantity = 1 và giảm -> xóa item
                    state.cartItems = state.cartItems.filter(i => i._id !== action.payload._id);
                }
                saveCartToStorage(state.cartItems); // Save to localStorage
            }
        },
        clearCart: (state) => {
            state.cartItems = [];
            saveCartToStorage([]); // Clear localStorage
        }
    }
});

// export the actions   
export const { 
    addToCart, 
    removeFromCart, 
    updateQuantity, 
    incrementQuantity, 
    decrementQuantity, 
    clearCart 
} = cartSlice.actions;
export default cartSlice.reducer;