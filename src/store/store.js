import { configureStore } from "@reduxjs/toolkit";

import PDFReducer from "./features/pdfSlice";

export const store = configureStore({
  reducer: {
    pdf: PDFReducer,
  },
});
