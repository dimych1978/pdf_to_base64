import { useRef, useEffect, useState } from 'react';
import * as pdfjs from 'pdfjs-dist/build/pdf';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { useDispatch } from 'react-redux';

import { setFragment, clearSelection } from '../store/features/pdfSlice';

import AreaSelector from './AreaSelector';

pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const PDFRenderer = ({ base64 }) => {
    const dispatch = useDispatch();

    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [pdfPages, setPdfPages] = useState([]);

    // Ссылки на canvas элементы для каждой страницы
    const canvasRefs = useRef([]);

    // Ссылки на задачи рендеринга и PDF документ
    const renderTasksRef = useRef([]);
    const pdfDocRef = useRef(null);

    // Флаг монтирования компонента (для избежания обновлений после размонтирования)
    const isMountedRef = useRef(true);

    // Функция очистки
    const cleanup = () => {
        renderTasksRef.current.forEach((task) => {
            if (task && !task.cancelled) task.cancel();
        });
        renderTasksRef.current = [];

        if (pdfDocRef.current) {
            pdfDocRef.current.destroy();
            pdfDocRef.current = null;
        }
    };

    // Эффект для очистки при размонтировании
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            cleanup();
        };
    }, []);

    // Загрузка PDF при изменении пропса
    useEffect(() => {
        if (!base64) return;

        const handleLoadPdf = async () => {
            await loadPdf();
        };

        // Предотвращает ошибку множественного рендеринга на одном холсте в dev-разработке из-за двойного выполнения useEffect в режиме StrictMode
        const breakForDev = setTimeout(() => handleLoadPdf(), 50);

        return () => {
            cleanup();
            clearTimeout(breakForDev);
            canvasRefs.current = [];
        };
    }, [base64]);

    /**
     * Основная функция загрузки и обработки PDF
     * 1. Декодирует пропс в бинарные данные
     * 2. Загружает PDF документ
     * 3. Извлекает страницы
     * 4. Рендерит страницы на canvas
     */
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

            const numPages = pdf.numPages;
            const pages = [];
            for (let i = 1; i <= numPages; i++) {
                const page = await pdf.getPage(i);
                const vp = page.getViewport({ scale: 1.5 });
                pages.push({ page, viewport: vp });
            }

            setPdfPages(pages);
            canvasRefs.current = new Array(pages.length).fill(null);

            setTimeout(() => {
                pages.forEach((pageObj, index) => {
                    renderPage(pageObj, index);
                });
            }, 50);

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

    /**
     * Рендерит страницу PDF на canvas
     * pageObj - объект страницы PDF
     * index - индекс страницы
     */
    const renderPage = async (pageObj, index) => {
        const canvas = canvasRefs.current[index];
        if (!canvas) return;

        const scale = 1.5;
        const viewport = pageObj.page.getViewport({ scale });

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const context = canvas.getContext('2d');

        context.clearRect(0, 0, canvas.width, canvas.height);

        try {
            const renderTask = pageObj.page.render({
                canvasContext: context,
                viewport: pageObj.viewport,
            });

            renderTasksRef.current.push(renderTask);
            await renderTask.promise;
        } catch (err) {
            if (err.name !== 'RenderingCancelledException') {
                console.error(`Error rendering page ${index + 1}:`, err);
            }
        }
    };

    /**
     * Обработка выделения области на странице PDF
     * 1. Создает временный canvas
     * 2. Копирует выделенную область
     * 3. Конвертирует в base64
     * 4. Сохраняет фрагмент в Redux
     */
    const handleAreaSelected = async (area, pageIndex) => {
        const canvas = canvasRefs.current[pageIndex];
        if (!canvas || area.width <= 0 || area.height <= 0) {
            console.error('Invalid selection parameters');
            return;
        }

        try {
            const fragmentCanvas = document.createElement('canvas');
            fragmentCanvas.width = Math.floor(area.width);
            fragmentCanvas.height = Math.floor(area.height);

            const ctx = fragmentCanvas.getContext('2d');

            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, fragmentCanvas.width, fragmentCanvas.height);

            ctx.drawImage(
                canvas,
                Math.floor(area.x),
                Math.floor(area.y),
                Math.floor(area.width),
                Math.floor(area.height),
                0,
                0,
                Math.floor(area.width),
                Math.floor(area.height)
            );

            const base64 = fragmentCanvas.toDataURL('image/jpeg', 0.8);
            const isValid =
                fragmentCanvas.width > 0 && fragmentCanvas.height > 0 && base64.length > 1000; // Минимальный размер base64

            if (isValid) {
                dispatch(
                    setFragment({
                        base64,
                        coordinates: area,
                        dimensions: {
                            width: fragmentCanvas.width,
                            height: fragmentCanvas.height,
                        },
                    })
                );
            } else {
                console.error('Invalid fragment data:', {
                    width: fragmentCanvas.width,
                    height: fragmentCanvas.height,
                    base64Length: base64.length,
                });
            }
        } catch (error) {
            console.error('Error creating fragment:', error);
        }
    };

    return (
        <div className="pdf-renderer relative">
            {isLoading && (
                <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center">
                    <div className="text-blue-500">Загрузка PDF...</div>
                </div>
            )}

            {error && <div className="text-red-500 mb-2">{error}</div>}

            <div className="relative overflow-y-auto max-h-[80vh]">
                {pdfPages.map((page, index) => (
                    <div key={index} className="relative mb-4">
                        <canvas
                            ref={(el) => (canvasRefs.current[index] = el)}
                            className="border border-gray-300 w-full block my-0 mx-auto"
                            // style={{ display: 'block', margin: '0 auto' }}
                        />
                        <AreaSelector
                            onSelectArea={(area) => handleAreaSelected(area, index)}
                            disabled={isLoading}
                            canvasRef={canvasRefs}
                            pageIndex={index}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PDFRenderer;
