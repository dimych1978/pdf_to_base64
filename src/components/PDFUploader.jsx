import { useDispatch } from 'react-redux';
import * as pdfjsLib from 'pdfjs-dist';

import { setPDFFile } from '../features/pdfSlice';

const  PDFUploader = () => {
  const dispatch = useDispatch();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    dispatch(setPDFFile(file));
    
    try {
      const loadingTask = pdfjsLib.getDocument(URL.createObjectURL(file));
      const pdfDocument = await loadingTask.promise;
      dispatch(setPDFDocument(pdfDocument));
    } catch (error) {
      console.error("PDF loading error:", error);
    }
  };

  return <input type="file" accept=".pdf" onChange={handleFileChange} />;}

  export default PDFUploader