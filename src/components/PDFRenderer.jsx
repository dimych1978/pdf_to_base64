import { useRef, useEffect, useState } from 'react';
import * as pdfjs from 'pdfjs-dist/build/pdf';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { useDispatch } from 'react-redux';

import { setSelection, setFragment, clearSelection } from '../store/features/pdfSlice';

import AreaSelector from './AreaSelector';

pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const PDFRenderer = ({ base64 }) => {
    const canvasRef = useRef(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [pdfPage, setPdfPage] = useState(null);
    const [viewport, setViewport] = useState(null);
    const isMountedRef = useRef(true);
    const dispatch = useDispatch();

    const renderTaskRef = { current: null };
    const pdfDocRef = { current: null };

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

    useEffect(() => {
        isMountedRef.current = true;

        return () => {
            isMountedRef.current = false;
            cleanup();
        };
    }, []);

    useEffect(() => {
        if (!base64) return;

        const handleLoadPdf = async() => {
                  await loadPdf();

        }
        // const timer = setTimeout(() => {
        // }, 50);
        handleLoadPdf();
        console.log('loadPdf()')
        return () => {
            // clearTimeout(timer);
            cleanup();
        };
    }, [base64]);

    const loadPdf = async () => {
        if (!isMountedRef.current) return;
        setIsLoading(true);
        dispatch(clearSelection());

        try {
            cleanup();

            const base64Data = base64.split(',')[1] || base64;
            const binaryString = atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);

            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            const loadingTask = pdfjs.getDocument({ data: bytes });
            const pdf = await loadingTask.promise;
            pdfDocRef.current = pdf;

            const page = await pdf.getPage(1);
            const vp = page.getViewport({ scale: 1.5 });
            setViewport(vp);
            setPdfPage(page);

            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            canvas.height = vp.height;
            canvas.width = vp.width;

            context.clearRect(0, 0, canvas.width, canvas.height);

            context.save();
            context.scale(1, 1);

            renderTaskRef.current = page.render({
                canvasContext: context,
                viewport: vp,
            });

            // await renderTaskRef.current.promise;
            if (isMountedRef.current) {
                setError(null);
            }
        } catch (err) {
            if (isMountedRef.current) {
                if (err.name !== 'RenderingCancelledException') {
                    console.error('PDF rendering error:', err);
                    setError('Ошибка загрузки PDF');
                }
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Обработка выделения области
const handleAreaSelected = async (area) => {
  console.log('Processing area:', area);
  
  if (!canvasRef.current || area.width <= 0 || area.height <= 0) {
    console.error('Invalid selection parameters');
    return;
  }

  try {
    // Создаем временный canvas для фрагмента
    const fragmentCanvas = document.createElement('canvas');
    fragmentCanvas.width = Math.floor(area.width);
    fragmentCanvas.height = Math.floor(area.height);
    
    const ctx = fragmentCanvas.getContext('2d');
    
    // Очищаем фон (белый вместо прозрачного)
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, fragmentCanvas.width, fragmentCanvas.height);
    
    // Копируем выделенную область
    ctx.drawImage(
      canvasRef.current,
      Math.floor(area.x),
      Math.floor(area.y),
      Math.floor(area.width),
      Math.floor(area.height),
      0,
      0,
      Math.floor(area.width),
      Math.floor(area.height)
    );
    
    // Оптимизация: сжимаем изображение до 80% качества
    const base64 = fragmentCanvas.toDataURL('image/jpeg', 0.8);
     const isValid = (
    fragmentCanvas.width > 0 &&
    fragmentCanvas.height > 0 &&
    base64.length > 1000 // Минимальный размер base64
  );

  if (isValid) {
    dispatch(setFragment({
      base64,
      coordinates: area,
      dimensions: {
        width: fragmentCanvas.width,
        height: fragmentCanvas.height
      }
    }));
  } else {
    console.error('Invalid fragment data:', {
      width: fragmentCanvas.width,
      height: fragmentCanvas.height,
      base64Length: base64.length
    });
    dispatch(setFragmentError('Не удалось создать фрагмент'));
  }
    
    
  } catch (error) {
    console.error('Error creating fragment:', error);
  }
};
const handleMouseMove = (e) => {
      console.log(canvasRef.current)
const canvas = canvasRef.current;
const rect = canvas.getBoundingClientRect();
console.log(rect)
    }
    const handleMouseDown = (e, pageIndex) => {
const canvas = canvasRef.current[pageIndex];

    }
    const handleMouseUp = (e, pageIndex) => {
const canvas = canvasRef.current[pageIndex];

    }


    return (
        <div className="pdf-renderer relative">
            {isLoading && (
                <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center">
                    <div className="text-blue-500">Загрузка PDF...</div>
                </div>
            )}

            {error && <div className="text-red-500 mb-2">{error}</div>}

            <div className="relative">
                <canvas ref={canvasRef} onMouseMove={handleMouseMove} className="border border-gray-300 w-full" />

                {pdfPage && <AreaSelector onSelectArea={handleAreaSelected} disabled={isLoading} canvasRef={canvasRef} />}
            </div>
             <button 
      onClick={() => {
        const testArea = { x: 50, y: 50, width: 100, height: 100 };
        console.log('Manual dispatch with:', testArea);
        dispatch(setFragment({
          base64: 'data:image/png;base64,iVBORw0...',
          coordinates: testArea
        }));
      }}
      className="fixed bottom-4 right-4 bg-green-500 text-white p-2 rounded"
    >
      Тест Redux
    </button>
        </div>
    );
};

export default PDFRenderer;
