import { createSlice } from '@reduxjs/toolkit';

const saved = localStorage.getItem('appTheme') || 'dark';

const themeSlice = createSlice({
    name: 'theme',
    initialState: { mode: saved },
    reducers: {
        toggleTheme: (state) => {
            state.mode = state.mode === 'light' ? 'dark' : 'light';
            localStorage.setItem('appTheme', state.mode);
        },
        setTheme: (state, action) => {
            state.mode = action.payload;
            localStorage.setItem('appTheme', state.mode);
        },
    },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
