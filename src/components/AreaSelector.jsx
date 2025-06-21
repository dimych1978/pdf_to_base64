import { useState, useEffect } from 'react';

/**
 * Компонент для выделения областей на странице PDF
 * - Обрабатывает события мыши
 * - Рассчитывает координаты выделения
 * - Отображает рамку выделения
 */
const AreaSelector = ({ onSelectArea, disabled, canvasRef, pageIndex }) => {
    const [startPoint, setStartPoint] = useState(null); // начальная точка выделения
    const [endPoint, setEndPoint] = useState(null); //конечная точка выделения
    const [isSelecting, setIsSelecting] = useState(false); //флаг завершенного выделения
    const [displayCoords, setDisplayCoords] = useState({ left: 0, top: 0, width: 0, height: 0 }); //координаты для отображения рамки

    // функция преобразования координат мыши в координаты canvas
    const getAdjustedCoordinates = (clientX, clientY) => {
        const canvas = canvasRef.current[pageIndex];
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY,
        };
    };

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

        updateDisplayCoords(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
        if (!isSelecting || !startPoint || !endPoint) return;

        const x = Math.min(startPoint.x, endPoint.x);
        const y = Math.min(startPoint.y, endPoint.y);
        const width = Math.abs(endPoint.x - startPoint.x);
        const height = Math.abs(endPoint.y - startPoint.y);

        if (width > 10 && height > 10) {
            onSelectArea({
                x,
                y,
                width,
                height,
                pageIndex,
            });
        }

        setIsSelecting(false);
        setStartPoint(null);
        setEndPoint(null);
        setDisplayCoords({ left: 0, top: 0, width: 0, height: 0 });
    };

    // Функция преобразования координат canvas в экранные координаты для отображения рамки выделения
    const updateDisplayCoords = (clientX, clientY) => {
        const canvas = canvasRef.current[pageIndex];
        if (!canvas || !startPoint) return;

        const rect = canvas.getBoundingClientRect();
        const x = Math.min(startPoint.x, (clientX - rect.left) * (canvas.width / rect.width));
        const y = Math.min(startPoint.y, (clientY - rect.top) * (canvas.height / rect.height));
        const width = Math.abs((clientX - rect.left) * (canvas.width / rect.width) - startPoint.x);
        const height = Math.abs(
            (clientY - rect.top) * (canvas.height / rect.height) - startPoint.y
        );

        setDisplayCoords({
            left: (x * rect.width) / canvas.width + rect.left,
            top: (y * rect.height) / canvas.height + rect.top,
            width: (width * rect.width) / canvas.width,
            height: (height * rect.height) / canvas.height,
        });
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
