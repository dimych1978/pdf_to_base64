import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  file: null, // исходный файл PDF
  document: null, // загруженный документ pdf.js
  pages: [], // массив страниц
  currentPage: 1, // текущая страница
  selections: [], // массив выделенных областей (изначально пустой)
  status: 'idle', // статус загрузки: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

export const pdfSlice = createSlice({
  name: 'pdf',
  initialState,
  reducers: {
    setPDFFile(state, action) {
      state.file = action.payload;
      state.document = null;
      state.status = 'loading';
    },
    setPDFDocument(state, action) {
      state.document = action.payload;
      state.status = 'succeeded';
    },
    addSelection(state, action) {
      state.selections.push({
        id: Date.now,
        page: state.currentPage,
        coordinates: action.payload.coordinates,
        base64: action.payload.base64 || null,
      });
    },
    removeSelection(state, action) {
        state.selections = state.selections.filter(item => item.id !== action.payload)
    },
    stateCurrentPage(state, action) {
        state.currentPage = action.payload
    },
    resetSelection(state) {
        state.selections = []
    }
  },
});

export const {setPDFFile, setPDFDocument, addSelection, removeSelection, stateCurrentPage, resetSelection} = pdfSlice.actions
export default pdfSlice.reducer;
