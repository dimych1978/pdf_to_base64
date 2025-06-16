import { useState, useRef } from 'react';

import PDFViewer from './components/PDFViewer';

function App() {
  const [pdfBase64, setPdfBase64] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPdfBase64(e.target.result);
        setError('');
      };
      reader.onerror = () => {
        setError('Ошибка чтения файла');
      };
      reader.readAsDataURL(file);
    } else {
      setError('Пожалуйста, выберите PDF-файл');
    }
  };

  const handleTestClick = () => {
    // Загрузка тестового PDF из public
    fetch('/test.pdf')
      .then(response => response.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPdfBase64(e.target.result);
          setError('');
        };
        reader.readAsDataURL(blob);
      })
      .catch(err => {
        setError('Не удалось загрузить тестовый PDF');
        console.error(err);
      });
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Просмотр PDF</h1>
      
      <div className="mb-4 flex space-x-3">
        <button 
          onClick={triggerFileInput}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Выбрать PDF
        </button>
        
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="hidden"
        />
        
        <button 
          onClick={handleTestClick}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Тест PDF
        </button>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="border border-gray-300 rounded-lg p-4">
        {pdfBase64 ? (
          <PDFViewer base64={pdfBase64} />
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            Выберите PDF-файл или нажмите `&quot;`Тест PDF`&quot;`
          </div>
        )}
      </div>
    </div>
  );
}

export default App;