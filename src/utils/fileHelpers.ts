export interface FileUploadResult {
  url: string;
  name: string;
  type: 'image' | 'pdf' | 'document';
}

export const readFileAsDataUrl = (file: File): Promise<FileUploadResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const resultUrl = reader.result as string;
      let fileType: 'image' | 'pdf' | 'document' = 'document';

      if (file.type.startsWith('image/')) {
        fileType = 'image';
      } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        fileType = 'pdf';
      }

      resolve({
        url: resultUrl,
        name: file.name,
        type: fileType,
      });
    };

    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};
