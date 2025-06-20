import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { saveFragment } from '../store/features/pdfSlice';

const FragmentViewer = () => {
    const dispatch = useDispatch();
    const fragment = useSelector((state) => state.pdf.currentFragment);
    const [confirmedFragment, setConfirmedFragment] = useState(null);

    const isValidBase64 = (str) => {
        if (typeof str !== 'string') return false;
        return /^data:image\/(png|jpeg|jpg);base64,[a-zA-Z0-9+/]+={0,2}$/.test(str);
    };
    const handleApply = () => {
        if (fragment) {
            dispatch(saveFragment());
            setConfirmedFragment(fragment);
        }
    };

    console.log('Base64 validation:', {
        isString: typeof fragment?.base64 === 'string',
        isImage: fragment?.base64?.startsWith('data:image/'),
        isValid: isValidBase64(fragment?.base64),
        length: fragment?.base64?.length,
    });
    return (
        <div className="fragment-viewer">
            {confirmedFragment ? (
                <img src={confirmedFragment.base64} alt="Confirmed fragment" />
            ) : fragment ? (
                <div>
                    <img src={fragment.base64} alt="Selected fragment" />
                    <button
                        onClick={handleApply}
                        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        Применить
                    </button>
                </div>
            ) : (
                <div>No fragment selected</div>
            )}
        </div>
    );
};

export default FragmentViewer;
