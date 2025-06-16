import { useRef, useEffect, useState } from 'react';
import * as pdfjs from 'pdfjs-dist/build/pdf';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const PDFViewer = ({ base64 }) => {
  const canvasRef = useRef(null);
  const [error, setError] = useState(null);
  const renderTaskRef = useRef(null);
  const pdfDocRef = useRef(null);
  const isMountedRef = useRef(true); // Для отслеживания состояния монтирования

  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (!base64) return;
    
    // Добавляем небольшую задержку для решения проблемы с первым рендерингом
    const timer = setTimeout(() => {
      loadPdf();
    }, 50);
    
    return () => {
      clearTimeout(timer);
      cleanup();
    };
  }, [base64]);

  const cleanup = () => {
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
      renderTaskRef.current = null;
    }
    if (pdfDocRef.current) {
      pdfDocRef.current.destroy();
      pdfDocRef.current = null;
    }
  };

  const loadPdf = async () => {
    if (!isMountedRef.current) return;
    
    try {
      cleanup();
      
      const base64Data = base64.split(',')[1] || base64;
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Загружаем PDF
      const loadingTask = pdfjs.getDocument({ data: bytes });
      const pdf = await loadingTask.promise;
      if (!isMountedRef.current) return;
      
      pdfDocRef.current = pdf;

      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.5 });
      
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      // Устанавливаем размеры canvas
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      // Очищаем canvas
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      // Фикс для правильной ориентации
      context.save();
      context.scale(1, 1);
      
      // Рендерим страницу
      renderTaskRef.current = page.render({
        canvasContext: context,
        viewport: viewport,
      });
      
      await renderTaskRef.current.promise;
      context.restore();
      
      if (isMountedRef.current) {
        setError(null);
      }
    } catch (err) {
      if (isMountedRef.current) {
        if (err.name === 'RenderingCancelledException') {
          console.log('Рендеринг отменен');
        } else {
          console.error('PDF rendering error:', err);
          setError('Ошибка загрузки PDF');
        }
      }
    }
  };

  return (
    <div className="pdf-viewer">
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <canvas 
        ref={canvasRef} 
        className="border border-gray-300"
        style={{ display: 'block' }} // Убедимся, что canvas блочный
      />
    </div>
  );
};

export default PDFViewer;