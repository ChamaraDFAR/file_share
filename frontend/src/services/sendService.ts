import api from './api';

export interface SendFileRequest {
  fileId: string;
  contactIds: string[];
}

export interface SendResult {
  contactId: string;
  contactName: string;
  status: 'success' | 'failed';
  errorMessage?: string;
}

export const sendService = {
  async sendFile(fileId: string, contactIds: string[]): Promise<SendResult[]> {
    const response = await api.post('/send', { fileId, contactIds });
    return response.data;
  },
};
