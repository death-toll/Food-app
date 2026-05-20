import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import cartReducer from './cartSlice';
import themeReducer from './themeSlice';

const store = configureStore({
    reducer: {
        // Auth/session info (token, role, profile)
        auth: authReducer,
        // Lightweight cart badge counter
        cart: cartReducer,
        // Light/dark mode
        theme: themeReducer,
    },
});

export default store;
