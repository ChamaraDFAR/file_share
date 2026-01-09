import api from './api';

export interface WhatsAppStatus {
  isConnected: boolean;
  qrCode?: string;
  message?: string;
}

export const whatsappService = {
  async getStatus(): Promise<WhatsAppStatus> {
    const response = await api.get('/whatsapp/status');
    return response.data;
  },

  async getQRCode(): Promise<string | null> {
    const response = await api.get('/whatsapp/qr');
    return response.data.qrCode || null;
  },

  async initialize(): Promise<void> {
    await api.post('/whatsapp/initialize');
  },
};
