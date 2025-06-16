import React from 'react';
import { useSelector } from 'react-redux';

const FragmentViewer = () => {
  const fragmentBase64 = useSelector(state => state.pdf.fragmentBase64);
  const selection = useSelector(state => state.pdf.selection);

  const handleCopy = () => {
    if (fragmentBase64) {
      navigator.clipboard.writeText(fragmentBase64);
      alert('Фрагмент скопирован в буфер обмена!');
    }
  };

  return (
    <div className="fragment-viewer">
      <h2 className="text-xl font-semibold mb-4">Выделенный фрагмент</h2>
      
      {fragmentBase64 ? (
        <>
          <div className="mb-4">
            <img 
              src={fragmentBase64} 
              alt="Выделенный фрагмент" 
              className="border border-gray-300 max-w-full"
            />
          </div>
          
          <div className="mb-4">
            <h3 className="font-medium mb-2">Base64:</h3>
            <textarea 
              value={fragmentBase64} 
              readOnly 
              className="w-full h-32 p-2 border border-gray-300 rounded text-xs"
            />
          </div>
          
          <button
            onClick={handleCopy}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Скопировать Base64
          </button>
          
          {selection && (
            <div className="mt-4 text-sm text-gray-600">
              <p>Координаты выделения:</p>
              <p>X: {selection.x}, Y: {selection.y}</p>
              <p>Ширина: {selection.width}, Высота: {selection.height}</p>
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center justify-center h-64 text-gray-500">
          Выделите область в PDF для просмотра фрагмента
        </div>
      )}
    </div>
  );
};

export default FragmentViewer;