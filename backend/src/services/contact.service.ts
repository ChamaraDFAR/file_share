import prisma from '../config/database';
import { whatsappService } from './whatsapp.service';

export interface CreateContactData {
  name: string;
  phoneNumber: string;
  isGroup?: boolean;
  groupId?: string | null;
}

export interface UpdateContactData {
  name?: string;
  phoneNumber?: string;
  isGroup?: boolean;
  groupId?: string | null;
}

class ContactService {
  async getAllContacts(): Promise<any[]> {
    return prisma.contact.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async getContactById(id: string): Promise<any | null> {
    return prisma.contact.findUnique({
      where: { id },
    });
  }

  async createContact(data: CreateContactData): Promise<any> {
    return prisma.contact.create({
      data: {
        name: data.name,
        phoneNumber: data.phoneNumber,
        isGroup: data.isGroup || false,
        groupId: data.groupId || null,
      },
    });
  }

  async updateContact(id: string, data: UpdateContactData): Promise<any | null> {
    return prisma.contact.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.phoneNumber && { phoneNumber: data.phoneNumber }),
        ...(data.isGroup !== undefined && { isGroup: data.isGroup }),
        ...(data.groupId !== undefined && { groupId: data.groupId }),
      },
    });
  }

  async deleteContact(id: string): Promise<void> {
    await prisma.contact.delete({
      where: { id },
    });
  }

  async syncFromWhatsApp(): Promise<any[]> {
    const client = whatsappService.getClient();
    if (!client) {
      throw new Error('WhatsApp client not initialized');
    }

    const chats = await client.getChats();
    const contacts: any[] = [];

    for (const chat of chats) {
      const contactData = {
        name: chat.name || chat.id.user || 'Unknown',
        phoneNumber: chat.id.user || '',
        isGroup: chat.isGroup || false,
        groupId: chat.isGroup ? chat.id._serialized : null,
      };

      // Check if contact already exists
      const existing = await prisma.contact.findFirst({
        where: {
          phoneNumber: contactData.phoneNumber,
          isGroup: contactData.isGroup,
        },
      });

      if (!existing) {
        const contact = await this.createContact(contactData);
        contacts.push(contact);
      } else {
        // Update existing contact
        await this.updateContact(existing.id, {
          name: contactData.name,
        });
        contacts.push(existing);
      }
    }

    return contacts;
  }
}

export const contactService = new ContactService();
