import { useState } from 'react';
import { useDispatch } from 'react-redux';

import { fetchPdfByFileName } from '../api/api';
import { setPdfData } from '../store/features/pdfSlice';

const PDFUploader = () => {
    const dispatch = useDispatch();
    const [fileName, setFileName] = useState('');

    const handleLoadFromApi = async () => {
        if (!fileName) return;
        const pdfData = await fetchPdfByFileName(fileName);
        if (pdfData) {
            dispatch(setPdfData(pdfData));
        }
    };

    return (
        <div className="flex gap-2 mb-4">
            <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Введите имя файла"
                className="border p-2 rounded"
            />
            <button
                onClick={handleLoadFromApi}
                className="bg-blue-500 text-white px-4 py-2 rounded"
            >
                Загрузить PDF
            </button>
        </div>
    );
};

export default PDFUploader;
