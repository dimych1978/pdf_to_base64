import { useSelector } from 'react-redux';

import PDFUploader from './components/PDFUploader';
import PDFRenderer from './components/PDFRenderer';
import FragmentViewer from './components/FragmentViewer';

function App() {
    const pdfBase64 = useSelector((state) => state.pdf.pdfBase64);
    const confirmedFragment = useSelector(state => state.pdf.confirmedFragment)

    return (
        <div className="container mx-auto p-4">
                 <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Загрузка PDF:</h2>
        <PDFUploader />
      </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="border border-gray-300 rounded-lg p-4">
                    {pdfBase64 ? (
                        <PDFRenderer base64={pdfBase64} />
                    ) : (
                        <div className="flex items-center justify-center h-64 text-gray-500">
                            Загрузите PDF файл
                        </div>
                    )}
                </div>

                <div className="border border-gray-300 rounded-lg p-4">
                    <h2 className="text-lg font-semibold mb-2">Предпросмотр:</h2>
                    <FragmentViewer />
                    <h2 className="text-lg font-semibold mt-4 mb-2">Подтвержденный фрагмент:</h2>
                    {confirmedFragment ? (
                        <img src={confirmedFragment.base64} alt="Confirmed" className="mt-2" />
                    ) : (
                        <div>Нет подтвержденного фрагмента</div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;
