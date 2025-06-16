import { useRef, useEffect, useState } from 'react';
import * as pdfjs from 'pdfjs-dist/build/pdf';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { useDispatch } from 'react-redux';

import { setSelection, setFragmentBase64, clearSelection } from '../store/features/pdfSlice';

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

        const timer = setTimeout(() => {
            loadPdf();
        }, 50);
        return () => {
            clearTimeout(timer);
            cleanup();
        };
    }, [base64]);
    // const cleanup = () => {
    //   if (renderTaskRef.current) {
    //     renderTaskRef.current.cancel();
    //   }
    //   if (pdfDocRef.current) {
    //     pdfDocRef.current.destroy();
    //   }
    // };

    // const renderTaskRef = { current: null };
    // const pdfDocRef = { current: null };

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

            await renderTaskRef.current.promise;
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
    const handleAreaSelected = (area) => {
        if (!pdfPage || !viewport || !canvasRef.current) return;

        dispatch(setSelection(area));

        // Создаем canvas для фрагмента
        const fragmentCanvas = document.createElement('canvas');
        fragmentCanvas.width = area.width;
        fragmentCanvas.height = area.height;

        const ctx = fragmentCanvas.getContext('2d');
        ctx.drawImage(
            canvasRef.current,
            area.x,
            area.y,
            area.width,
            area.height,
            0,
            0,
            area.width,
            area.height
        );

        // Преобразуем в base64
        const base64 = fragmentCanvas.toDataURL('image/png');
        dispatch(setFragmentBase64(base64));
    };

    return (
        <div className="pdf-renderer relative">
            {isLoading && (
                <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center">
                    <div className="text-blue-500">Загрузка PDF...</div>
                </div>
            )}

            {error && <div className="text-red-500 mb-2">{error}</div>}

            <div className="relative">
                <canvas ref={canvasRef} className="border border-gray-300 w-full" />

                {pdfPage && <AreaSelector onSelectArea={handleAreaSelected} disabled={isLoading} />}
            </div>
        </div>
    );
};

export default PDFRenderer;
