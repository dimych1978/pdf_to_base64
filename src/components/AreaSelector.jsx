import { useRef, useEffect } from 'react';
import CanvasJS from '@canvasjs/charts';

function AreaSelector({ pdfDoc }) {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const selection = useRef(null);

  // Инициализация канваса
  useEffect(() => {
    if (!pdfDoc || !chartContainerRef.current) return;

    const chart = new CanvasJS.Chart(chartContainerRef.current, {
      interactivityEnabled: true,
      axisX: { minimum: 0, maximum: 100 }, // Проценты от ширины
      axisY: { minimum: 0, maximum: 100 }, // Проценты от высоты
      data: [{ type: "scatter", dataPoints: [] }],
    });
    chartRef.current = chart;
    chart.render();

    // Обработка событий
    const handleMouseDown = (e) => {
      const rect = chartContainerRef.current.getBoundingClientRect();
      selection.current = {
        x1: (e.clientX - rect.left) / rect.width * 100,
        y1: (e.clientY - rect.top) / rect.height * 100,
        x2: (e.clientX - rect.left) / rect.width * 100,
        y2: (e.clientY - rect.top) / rect.height * 100,
      };
    };

    const handleMouseMove = (e) => {
      if (!selection.current) return;
      const rect = chartContainerRef.current.getBoundingClientRect();
      selection.current.x2 = (e.clientX - rect.left) / rect.width * 100;
      selection.current.y2 = (e.clientY - rect.top) / rect.height * 100;
      updateSelectionBox();
    };

    chartContainerRef.current.addEventListener('mousedown', handleMouseDown);
    chartContainerRef.current.addEventListener('mousemove', handleMouseMove);
    chartContainerRef.current.addEventListener('mouseup', () => {
      if (selection.current) {
        console.log("Выделенная область (%):", selection.current);
        selection.current = null;
        chartRef.current.render(); // Очищаем выделение
      }
    });

    return () => {
      chartContainerRef.current?.removeEventListener('mousedown', handleMouseDown);
      chartContainerRef.current?.removeEventListener('mousemove', handleMouseMove);
    };
  }, [pdfDoc]);

  // Рисование прямоугольника выделения
  const updateSelectionBox = () => {
    if (!selection.current || !chartRef.current) return;
    
    const { x1, y1, x2, y2 } = selection.current;
    chartRef.current.options.data = [{
      type: "scatter",
      dataPoints: [],
      selectionRectangle: {
        enabled: true,
        xMin: Math.min(x1, x2),
        xMax: Math.max(x1, x2),
        yMin: Math.min(y1, y2),
        yMax: Math.max(y1, y2),
        color: "rgba(255, 0, 0, 0.3)"
      }
    }];
    chartRef.current.render();
  };

  return (
    <div 
      ref={chartContainerRef} 
      style={{ 
        width: '100%', 
        height: '600px',
        border: '1px solid #ccc',
        position: 'relative'
      }}
    />
  );
}

export default AreaSelector