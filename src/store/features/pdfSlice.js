import { createSlice } from '@reduxjs/toolkit';

const pdfSlice = createSlice({
    name: 'pdf',
    initialState: {
        pdfUrl: null,
        currentFragment: null,
        confirmedFragment: null,
    },
    reducers: {
        setPdfData: (state, action) => {
            if (state.pdfUrl) URL.revokeObjectURL(state.pdfUrl);
            state.pdfUrl = action.payload;
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
        clearCurrentFragment: (state) => {
            state.currentFragment = null;
        },
        clearSelection: (state) => {
            if (state.pdfUrl) URL.revokeObjectURL(state.pdfUrl);
            state.pdfUrl = null;
            state.currentFragment = null;
            state.confirmedFragment = null;
        },
    },
});

export const { setPdfData, setFragment, saveFragment, clearCurrentFragment, clearSelection } = pdfSlice.actions;

export default pdfSlice.reducer;
