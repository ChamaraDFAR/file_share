import api from './api';

export interface File {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  storageType: 'local' | 'cloud';
  storagePath: string;
  uploadDate: string;
}

export const fileService = {
  async uploadFile(file: File): Promise<File> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  async getAllFiles(): Promise<File[]> {
    const response = await api.get('/files');
    return response.data;
  },

  getFileUrl(id: string): string {
    return `/api/files/${id}`;
  },
};
