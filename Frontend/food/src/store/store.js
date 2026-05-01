import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import cartReducer from './cartSlice';
import themeReducer from './themeSlice';

const store = configureStore({
    reducer: {
        auth: authReducer,
        cart: cartReducer,
        theme: themeReducer,
    },
});

export default store;
