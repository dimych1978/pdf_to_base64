import { useState, useRef, useEffect } from 'react';

const AreaSelector = ({ onSelectArea, disabled, canvasRef, pageIndex }) => {
    const containerRef = useRef(null);
    const [startPoint, setStartPoint] = useState(null);
    const [endPoint, setEndPoint] = useState(null);
    const [isSelecting, setIsSelecting] = useState(false);

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
    };

    const handleMouseUp = () => {
        if (!isSelecting || !startPoint || !endPoint) return;

        const x = Math.min(startPoint.x, endPoint.x);
        const y = Math.min(startPoint.y, endPoint.y);
        const width = Math.abs(endPoint.x - startPoint.x);
        const height = Math.abs(endPoint.y - startPoint.y);

        console.log('Final selection (canvas coords):', { x, y, width, height });

        if (width > 10 && height > 10) {
            onSelectArea({
                x,
                y,
                width,
                height,
                pageX: Math.min(startPoint.x, endPoint.x),
                pageY: Math.min(startPoint.y, endPoint.y),
            });
        } else {
            console.warn('Selection too small:', { width, height });
        }

        setIsSelecting(false);
        setStartPoint(null);
        setEndPoint(null);
    };

    useEffect(() => {
        const handleMouseUpGlobal = () => {
            if (isSelecting) handleMouseUp();
        };

        window.addEventListener('mouseup', handleMouseUpGlobal);
        return () => window.removeEventListener('mouseup', handleMouseUpGlobal);
    }, [isSelecting, startPoint, endPoint]);

    return (
        <div>
            <div
                className={`absolute inset-0 ${disabled ? 'cursor-not-allowed' : 'cursor-crosshair'}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
            />

            {isSelecting && startPoint && endPoint && (
                <div
                    className="absolute border-2 border-red-500 bg-red-500 bg-opacity-10 pointer-events-none"
                    style={{
                        left: `${Math.min(startPoint.x, endPoint.x)}px`,
                        top: `${Math.min(startPoint.y, endPoint.y)}px`,
                        width: `${Math.abs(endPoint.x - startPoint.x)}px`,
                        height: `${Math.abs(endPoint.y - startPoint.y)}px`,
                    }}
                />
            )}
        </div>
    );
};

export default AreaSelector;
