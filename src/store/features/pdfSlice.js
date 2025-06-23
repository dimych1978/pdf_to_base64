import { createSlice } from '@reduxjs/toolkit';

const pdfSlice = createSlice({
    name: 'pdf',
    initialState: {
        pdfBase64: null,
        currentFragment: null,
        confirmedFragment: null,
    },
    reducers: {
        setPdfData: (state, action) => {
            state.pdfBase64 = action.payload;
            state.currentFragment = null;
            state.confirmedFragment = null;
        },
        setFragment(state, action) {
            const { base64, coordinates, dimensions } = action.payload;

            if (!base64 || !coordinates || !dimensions) {
                console.error('Invalid payload for setFragment:', action.payload);
                return;
            }

            state.currentFragment = {
                base64: base64.startsWith('data:image/') ? base64 : null,
                coordinates,
                dimensions,
                createdAt: new Date().toISOString(),
            };
        },
        saveFragment: (state) => {
            if (state.currentFragment) {
                state.confirmedFragment = state.currentFragment;
            }
        },
        clearSelection: (state) => {
            state.selection = null;
            state.fragmentBase64 = null;
            state.currentFragment = null;
        },
    },
});

export const {
    setPdfData,
    setFragment,
    saveFragment,
    clearSelection,
} = pdfSlice.actions;

export default pdfSlice.reducer;
