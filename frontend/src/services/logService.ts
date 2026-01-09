import api from './api';

export interface Log {
  id: string;
  type: 'send' | 'receive';
  fileId: string;
  contactId: string;
  timestamp: string;
  status: 'success' | 'failed';
  errorMessage?: string;
  file?: {
    id: string;
    originalName: string;
    size: number;
    mimeType: string;
  };
  contact?: {
    id: string;
    name: string;
    phoneNumber: string;
    isGroup: boolean;
  };
}

export interface LogFilters {
  type?: 'send' | 'receive';
  status?: 'success' | 'failed';
  contactId?: string;
  fileId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export const logService = {
  async getLogs(filters?: LogFilters): Promise<Log[]> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const response = await api.get(`/logs?${params.toString()}`);
    return response.data;
  },

  async exportLogs(): Promise<void> {
    const response = await api.get('/logs/export/csv', {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'logs.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
