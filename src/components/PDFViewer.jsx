import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPDFDocument } from '../store/features/pdfSlice';

// Инициализация PDF.js
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.3.31/build/pdf.worker.min.js';

function PDFViewer() {
    const dispatch = useDispatch();
    const pdfDoc = useSelector((state) => state.pdf.document);
    const fileInputRef = useRef(null);
    const canvasRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);

    // Гарантированная инициализация canvas
    useEffect(() => {
        if (!canvasRef.current) {
            console.error('Canvas не доступен после монтирования компонента');
            return;
        }
        
        // Временная отрисовка для проверки
        const ctx = canvasRef.current.getContext('2d');
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.fillStyle = 'red';
        ctx.font = '16px Arial';
        ctx.fillText('Загрузите PDF файл', 10, 30);
    }, []);

    // Загрузка PDF
    const handleFileUpload = async (e) => {
        if (!e.target.files?.[0]) {
            console.log('Файл не выбран');
            return;
        }

        const file = e.target.files[0];
        console.log('Выбран файл:', file.name);

        if (!canvasRef.current) {
            console.error('Canvas элемент не найден');
            return;
        }

        setIsLoading(true);
        const fileUrl = URL.createObjectURL(file);

        try {
            const pdfDocument = await pdfjsLib.getDocument({
                url: fileUrl,
                verbosity: 0,
            }).promise;

            console.log('PDF загружен, страниц:', pdfDocument.numPages);
            dispatch(setPDFDocument(pdfDocument));
            await renderFirstPage(pdfDocument);
        } catch (error) {
            console.error('Ошибка загрузки:', error);
        } finally {
            URL.revokeObjectURL(fileUrl);
            setIsLoading(false);
        }
    };

    // Рендер первой страницы
    const renderFirstPage = async (pdfDocument) => {
        try {
            const page = await pdfDocument.getPage(1);
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = canvasRef.current;
            
            // Устанавливаем физические размеры canvas
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            
            // Очищаем canvas
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Рендерим PDF
            await page.render({
                canvasContext: ctx,
                viewport: viewport
            }).promise;
            
            console.log('Страница отрендерена');
        } catch (error) {
            console.error('Ошибка рендеринга:', error);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <input
                type="file"
                ref={fileInputRef}
                accept=".pdf"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                key={Date.now()} // Сброс при повторной загрузке
            />
            
            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                style={{
                    padding: '10px 15px',
                    backgroundColor: isLoading ? '#6c757d' : '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '16px'
                }}
            >
                {isLoading ? 'Загрузка...' : 'Выбрать PDF'}
            </button>

            <div style={{ marginTop: '20px' }}>
                <canvas
                    ref={canvasRef}
                    style={{
                        border: '1px solid #ddd',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        maxWidth: '100%',
                        background: '#f8f9fa'
                    }}
                    width="600"
                    height="800"
                />
            </div>
        </div>
    );
}

export default PDFViewer;