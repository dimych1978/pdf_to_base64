import { useEffect, useRef } from "react";

function PDFRenderer({ pdfDoc }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!pdfDoc) return;
    const renderPage = async () => {
      const page = await pdfDoc.getPage(1);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = canvasRef.current;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ 
        canvasContext: canvas.getContext('2d'), 
        viewport 
      }).promise;
    };
    renderPage();
  }, [pdfDoc]);

  return <canvas ref={canvasRef} style={{ position: 'absolute', zIndex: 1 }} />;
}

export default PDFRenderer