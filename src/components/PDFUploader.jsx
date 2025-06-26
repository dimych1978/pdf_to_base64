import { useState } from 'react';
import { useDispatch } from 'react-redux';

import { fetchPdfByFileName } from '../api/api';
import { clearSelection, setPdfData } from '../store/features/pdfSlice';

/* Компонент загрузки PDF-файла по имени через api */
const PDFUploader = () => {
    const dispatch = useDispatch();
    const [fileName, setFileName] = useState('');
    const [error, setError] = useState('');

    const handleLoadFromApi = async () => {
        try {
            if (!fileName.trim()) {
                setError('Введите имя файла');
                return;
            }

            dispatch(clearSelection());
            setError('');

            const pdfData = await fetchPdfByFileName(fileName);
            dispatch(setPdfData(pdfData));
        } catch (error) {
            setError(`Ошибка загрузки файла: ${error.message}`);
            console.error(error);
        }
    };

    return (
        <div className="flex gap-2 mb-4">
            <input
                type="text"
                value={fileName}
                onChange={(e) => {
                    setFileName(e.target.value);
                    setError('');
                }}
                placeholder="Введите имя файла"
                className="border p-2 rounded"
            />
            <button
                onClick={handleLoadFromApi}
                className="bg-blue-500 text-white px-4 py-2 rounded"
            >
                Загрузить PDF
            </button>
            {error && <div className="text-red-500 mt-2 p-2 bg-red-50 rounded-md">{error}</div>}
        </div>
    );
};

export default PDFUploader;
