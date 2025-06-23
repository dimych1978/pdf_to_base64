export const fetchPdfByFileName = async (fileName) => {
    const response = await fetch(`/pdf/${fileName}`);

    if (!response.ok) throw new Error(`Ошибка: ${response.status}: ${response.statusText}`);

    // Поскольку вместо сервера используется запрос к файлу, лежащему в папке public, проверяем на соответствие файла типу pdf
    const contentType = response.headers.get('content-type');
    if (!contentType.includes('application/pdf')) {
        throw new Error('Файл не является PDF');
    }

    const blob = await response.blob();
    if (blob.size < 100) {
        throw new Error('Файл не найден или пустой');
    }
    return URL.createObjectURL(blob);
};
