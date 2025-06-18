import { useSelector } from 'react-redux';

const FragmentViewer = () => {
  const fragment = useSelector(state => state.pdf.currentFragment);
console.log('Fragment data:', {
  base64: fragment?.base64?.substring(0, 50) + '...',
  dimensions: fragment?.dimensions,
  valid: fragment?.base64?.startsWith('data:image/')
});  
 const isValidBase64 = (str) => {
    if (typeof str !== 'string') return false;
    return /^data:image\/(png|jpeg|jpg);base64,[a-zA-Z0-9+/]+={0,2}$/.test(str);
  };

  console.log('Base64 validation:', {
    isString: typeof fragment?.base64 === 'string',
    isImage: fragment?.base64?.startsWith('data:image/'),
    isValid: isValidBase64(fragment?.base64),
    length: fragment?.base64?.length
  });
  return (
    <div className="fragment-viewer">
      {fragment ? (
          <img src={fragment.base64} alt="Selected fragment" />
      ) : (
        <div>No fragment selected</div>
      )}
    </div>
  );
};

export default FragmentViewer