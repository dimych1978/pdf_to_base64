import { useDispatch, useSelector } from 'react-redux';

import { clearCurrentFragment, saveFragment } from '../store/features/pdfSlice';

/**
 * Компонент для просмотра выделенных фрагментов
 * - Отображает предпросмотр фрагмента
 * - Предоставляет кнопку для подтверждения фрагмента
 * - Отображает подтвержденный фрагмент
 */
const FragmentViewer = () => {
    const dispatch = useDispatch();
    const { currentFragment, confirmedFragment } = useSelector((state) => state.pdf);

    const isValidBase64 = (str) => {
        if (typeof str !== 'string') return false;
        return /^data:image\/(png|jpeg|jpg);base64,[a-zA-Z0-9+/]+={0,2}$/.test(str);
    };

    const handleApply = () => {
        if (currentFragment) {
            dispatch(saveFragment());
            dispatch(clearCurrentFragment());
        }
    };

    console.log('Base64 validation:', {
        isString: typeof confirmedFragment?.base64 === 'string',
        isImage: confirmedFragment?.base64?.startsWith('data:image/'),
        isValid: isValidBase64(confirmedFragment?.base64),
        length: confirmedFragment?.base64?.length,
    });
    return (
        <div className="flex flex-col gap-4">
            <div className="border p-4">
                {currentFragment?.base64 ? (
                    <img
                        src={currentFragment.base64}
                        alt="Current Fragment"
                        className="max-w-full h-auto"
                    />
                ) : (
                    <p>Выделите фрагмент в PDF</p>
                )}
            </div>
            <button
                onClick={handleApply}
                disabled={!currentFragment}
                className="bg-green-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
            >
                Применить фрагмент
            </button>
        </div>
    );
};

export default FragmentViewer;
