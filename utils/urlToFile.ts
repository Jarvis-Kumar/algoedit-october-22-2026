export const urlToFile = async (url: string, filename: string, mimeType?: string): Promise<File> => {
    // In a real application, you might need a CORS proxy for external URLs.
    // For this demonstration, we'll fetch directly.
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Failed to fetch media from URL: ${url}`);
    }
    const blob = await res.blob();
    const resolvedMimeType = mimeType || blob.type || 'application/octet-stream';
    return new File([blob], filename, { type: resolvedMimeType });
};