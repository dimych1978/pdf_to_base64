import { useCallback } from 'react';

export const useCoordsConverter = (canvasRef, pageIndex) => {
    // Функция преобразования координат мыши в координаты canvas
    const getAdjustedCoordinates = useCallback(
        (clientX, clientY) => {
            const canvas = canvasRef.current[pageIndex];
            if (!canvas) return { x: 0, y: 0 };

            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;

            return {
                x: (clientX - rect.left) * scaleX,
                y: (clientY - rect.top) * scaleY,
            };
        },
        [canvasRef, pageIndex]
    );

    // Функция преобразования координат canvas в экранные координаты для отображения рамки выделения
    const updateDisplayCoords = useCallback(
        (clientX, clientY, startPoint) => {
            const canvas = canvasRef.current[pageIndex];
            if (!canvas || !startPoint) return { left: 0, top: 0, width: 0, height: 0 };

            const rect = canvas.getBoundingClientRect();
            const x = Math.min(startPoint.x, (clientX - rect.left) * (canvas.width / rect.width));
            const y = Math.min(startPoint.y, (clientY - rect.top) * (canvas.height / rect.height));
            const width = Math.abs(
                (clientX - rect.left) * (canvas.width / rect.width) - startPoint.x
            );
            const height = Math.abs(
                (clientY - rect.top) * (canvas.height / rect.height) - startPoint.y
            );

            return {
                left: (x * rect.width) / canvas.width + rect.left,
                top: (y * rect.height) / canvas.height + rect.top,
                width: (width * rect.width) / canvas.width,
                height: (height * rect.height) / canvas.height,
            };
        },
        [canvasRef, pageIndex]
    );

    // Формирование координат для onSelectArea
    const getSelectionData = useCallback(
        (startPoint, endPoint) => {
            if (!startPoint || !endPoint) return null;

            const x = Math.min(startPoint.x, endPoint.x);
            const y = Math.min(startPoint.y, endPoint.y);
            const width = Math.abs(endPoint.x - startPoint.x);
            const height = Math.abs(endPoint.y - startPoint.y);

            return {
                x,
                y,
                width,
                height,
                pageIndex,
            };
        },
        [pageIndex]
    );

    return {
        getAdjustedCoordinates,
        updateDisplayCoords,
        getSelectionData,
    };
};
