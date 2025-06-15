import { useRef, useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Инициализация PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

function PDFViewer() {
  const canvasRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pdfInfo, setPdfInfo] = useState(null);

const loadPDF = async () => {
  try {
    // 1. Загружаем "сырые" данные
    const response = await fetch('/test.pdf');
    const arrayBuffer = await response.arrayBuffer();
    
    // 2. Передаем в PDF.js
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    console.log('PDF загружен! Страниц:', pdf.numPages);
    
    // 3. Рендерим
    await renderPage(pdf, 1);
  } catch (err) {
    console.error('Ошибка:', err);
  }
};

// Проверка перед рендерингом:
const handleTestPDF = async () => {
  const response = await fetch('/test.pdf');
  console.log('Статус:', response.status, 'Тип:', response.headers.get('Content-Type'));
  
  // Тест 1: Открыть PDF напрямую
  const blob = await response.blob();
  window.open(URL.createObjectURL(blob));
  
  // Тест 2: Загрузить через PDF.js
  loadPDF();
};
  const renderPage = async (pdf, pageNumber) => {
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = canvasRef.current;
    
    // Подготавливаем canvas
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    await page.render({
      canvasContext: ctx,
      viewport: viewport
    }).promise;
  };


  const handleFileUpload = async (e) => {
    if (!e.target.files?.[0]) return;
    const arrayBuffer = await e.target.files[0].arrayBuffer();
    loadPDF(arrayBuffer);
  };

  // Очистка canvas при размонтировании
  useEffect(() => {
    return () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
  }, []);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={handleTestPDF}
          disabled={isLoading}
          style={{
            padding: '10px 15px',
            backgroundColor: isLoading ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {isLoading ? 'Загрузка...' : 'Тестовый PDF'}
        </button>

        <input
          type="file"
          id="pdf-upload"
          accept=".pdf"
          onChange={handleFileUpload}
          disabled={isLoading}
          style={{ display: 'none' }}
        />
        <label
          htmlFor="pdf-upload"
          style={{
            padding: '10px 15px',
            backgroundColor: isLoading ? '#ccc' : '#2196F3',
            color: 'white',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            display: 'inline-block'
          }}
        >
          {isLoading ? 'Загрузка...' : 'Выбрать PDF'}
        </label>
      </div>

      {error && (
        <div style={{ color: 'red', marginBottom: '10px' }}>
          {error}
        </div>
      )}

      {pdfInfo && (
        <div style={{ marginBottom: '10px' }}>
          Страница {pdfInfo.currentPage} из {pdfInfo.numPages}
        </div>
      )}

      <canvas
        ref={canvasRef}
        style={{
          border: '1px solid #ddd',
          width: '100%',
          background: '#f5f5f5',
          display: isLoading ? 'none' : 'block'
        }}
      />

      {isLoading && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          Загрузка PDF...
        </div>
      )}
    </div>
  );
}

export default PDFViewer;