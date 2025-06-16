import { useState } from 'react';

import PDFUploader from './components/PDFUploader';
import PDFRenderer from './components/PDFRenderer';
import FragmentViewer from './components/FragmentViewer';
// import { Provider } from 'react-redux';
// import store from './store/store';

function App() {
  const [pdfBase64, setPdfBase64] = useState(null);

  return (
    // <Provider store={store}>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">PDF Fragment Extractor</h1>
        
        <PDFUploader onPdfLoaded={setPdfBase64} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Левая колонка: PDF с выделением */}
          <div className="border border-gray-300 rounded-lg p-4">
            {pdfBase64 ? (
              <PDFRenderer base64={pdfBase64} />
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                Загрузите PDF файл
              </div>
            )}
          </div>
          
          {/* Правая колонка: выделенный фрагмент */}
          <div className="border border-gray-300 rounded-lg p-4">
            <FragmentViewer />
          </div>
        </div>
      </div>
    // </Provider>
  );
}

export default App;