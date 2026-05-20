import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
    name: 'cart',
    initialState: { totalItems: 0 },
    reducers: {
        // Set from backend cart summary (source of truth).
        setCartCount: (state, action) => { state.totalItems = action.payload; },
        // Optimistic increment after add-to-cart.
        incrementCartCount: (state) => { state.totalItems += 1; },
        clearCartCount: (state) => { state.totalItems = 0; },
    },
});

export const { setCartCount, incrementCartCount, clearCartCount } = cartSlice.actions;
export default cartSlice.reducer;
