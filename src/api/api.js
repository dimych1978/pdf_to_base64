export const fetchPdfByFileName = async (fileName) => {
    try {
        const response = await fetch(`/pdf/${fileName}`);

        if (!response.ok) throw new Error('PDF not found');

        const blob = await response.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('Error loading PDF:', error);
        return null;
    }
};
