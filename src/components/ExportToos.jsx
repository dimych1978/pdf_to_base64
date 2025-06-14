function getSelectionBase64(canvas, coords) {
  const { x1, y1, x2, y2 } = coords;
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');

  tempCanvas.width = Math.abs(x2 - x1);
  tempCanvas.height = Math.abs(y2 - y1);

  tempCtx.drawImage(
    canvas,
    x1, y1, tempCanvas.width, tempCanvas.height,
    0, 0, tempCanvas.width, tempCanvas.height
  );

  return tempCanvas.toDataURL(); // "data:image/png;base64,..."
}

export default getSelectionBase64