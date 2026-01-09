import api from './api';

export interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  isGroup: boolean;
  groupId?: string;
}

export const contactService = {
  async getAllContacts(): Promise<Contact[]> {
    const response = await api.get('/contacts');
    return response.data;
  },

  async createContact(data: {
    name: string;
    phoneNumber: string;
    isGroup?: boolean;
    groupId?: string;
  }): Promise<Contact> {
    const response = await api.post('/contacts', data);
    return response.data;
  },

  async syncFromWhatsApp(): Promise<Contact[]> {
    const response = await api.post('/contacts/sync');
    return response.data.contacts || [];
  },
};
