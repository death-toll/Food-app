import { createSlice } from '@reduxjs/toolkit';

// Pre-hydrate from localStorage so the app doesn't flash login on refresh
const token = localStorage.getItem('token');
const savedUser = JSON.parse(localStorage.getItem('authUser') || 'null');

const authSlice = createSlice({
    name: 'auth',
    initialState: token && savedUser
        ? { isLoggedIn: true, token, ...savedUser }
        : { isLoggedIn: false, token: null, userId: null, name: null, email: null, role: null },
    reducers: {
        // Called after login + /me fetch
        setCredentials: (state, action) => {
            const { token, userId, name, email, role } = action.payload;
            state.isLoggedIn = true;
            state.token = token;
            state.userId = userId;
            state.name = name;
            state.email = email;
            state.role = role;
            // Persist so refresh restores session
            localStorage.setItem('token', token);
            localStorage.setItem('authUser', JSON.stringify({ userId, name, email, role }));
        },
        logout: (state) => {
            localStorage.removeItem('token');
            localStorage.removeItem('authUser');
            state.isLoggedIn = false;
            state.token = null;
            state.userId = null;
            state.name = null;
            state.email = null;
            state.role = null;
        },
    },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
