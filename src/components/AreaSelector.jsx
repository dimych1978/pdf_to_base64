import { useState, useEffect } from 'react';

import { useCoordsConverter } from '../hooks/useCoordsConverter';

/**
 * Компонент для выделения областей на странице PDF
 * - Обрабатывает события мыши
 * - Рассчитывает координаты выделения
 * - Отображает рамку выделения
 */
const AreaSelector = ({ onSelectArea, disabled, canvasRef, pageIndex }) => {
    const [startPoint, setStartPoint] = useState(null); // начальная точка выделения
    const [endPoint, setEndPoint] = useState(null); // конечная точка выделения
    const [isSelecting, setIsSelecting] = useState(false); // флаг завершенного выделения
    const [displayCoords, setDisplayCoords] = useState({ left: 0, top: 0, width: 0, height: 0 }); // координаты для отображения рамки

    const { getAdjustedCoordinates, updateDisplayCoords, getSelectionData } = useCoordsConverter(
        canvasRef,
        pageIndex
    );

    const handleMouseDown = (e) => {
        if (disabled) return;

        const { x, y } = getAdjustedCoordinates(e.clientX, e.clientY);
        setStartPoint({ x, y });
        setEndPoint({ x, y });
        setIsSelecting(true);
    };

    const handleMouseMove = (e) => {
        if (!isSelecting) return;

        const { x, y } = getAdjustedCoordinates(e.clientX, e.clientY);
        setEndPoint({ x, y });

        setDisplayCoords(updateDisplayCoords(e.clientX, e.clientY, startPoint));
    };

    const handleMouseUp = () => {
        if (!isSelecting || !startPoint || !endPoint) return;

        const selection = getSelectionData(startPoint, endPoint);
        if (selection && selection.width > 10 && selection.height > 10) {
            onSelectArea(selection);
        }

        setIsSelecting(false);
        setStartPoint(null);
        setEndPoint(null);
        setDisplayCoords({ left: 0, top: 0, width: 0, height: 0 });
    };

    // Глобальный обработчик отпускания мыши для гарантированной обработки в случае выхода курсора за пределы canvas
    useEffect(() => {
        const handleMouseUpGlobal = () => {
            if (isSelecting) handleMouseUp();
        };

        window.addEventListener('mouseup', handleMouseUpGlobal);
        return () => window.removeEventListener('mouseup', handleMouseUpGlobal);
    }, [isSelecting, startPoint, endPoint]);

    return (
        <>
            <div
                className={`absolute inset-0 ${disabled ? 'cursor-not-allowed' : 'cursor-crosshair'}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
            />

            {isSelecting && (
                <div
                    className="fixed border-2 border-red-500 bg-red-500 bg-opacity-10 pointer-events-none"
                    style={{
                        left: `${displayCoords.left}px`,
                        top: `${displayCoords.top}px`,
                        width: `${displayCoords.width}px`,
                        height: `${displayCoords.height}px`,
                    }}
                />
            )}
        </>
    );
};

export default AreaSelector;
