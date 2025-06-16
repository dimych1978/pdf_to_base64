import { useDispatch } from 'react-redux';

import { setPdfData } from '../store/features/pdfSlice';

const PDFUploader = () => {
  const dispatch = useDispatch();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        // Сохраняем base64 строку вместо файла
        dispatch(setPdfData(e.target.result));
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("File reading error:", error);
    }
  };

  return <input type="file" accept=".pdf" onChange={handleFileChange} />;
}

export default PDFUploader;