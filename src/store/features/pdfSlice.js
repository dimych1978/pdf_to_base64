import { createSlice } from '@reduxjs/toolkit';

const pdfSlice = createSlice({
  name: 'pdf',
  initialState: {
    data: null,
    selection: null,
    fragmentBase64: null,
  },
  reducers: {
    setPdfData: (state, action) => {
      state.data = action.payload;
    },
    setSelection: (state, action) => {
      state.selection = action.payload;
    },
    setFragmentBase64: (state, action) => {
      state.fragmentBase64 = action.payload;
    },
    clearSelection: (state) => {
      state.selection = null;
      state.fragmentBase64 = null;
    }
  }
});

export const { 
  setPdfData, 
  setSelection, 
  setFragmentBase64, 
  clearSelection 
} = pdfSlice.actions;

export default pdfSlice.reducer;