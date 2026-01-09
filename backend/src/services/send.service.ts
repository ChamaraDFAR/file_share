import { fileService } from './file.service';
import { contactService } from './contact.service';
import { whatsappService } from './whatsapp.service';
import { logService } from './log.service';
import { config } from '../config/config';
import path from 'path';

interface SendResult {
  contactId: string;
  contactName: string;
  status: 'success' | 'failed';
  errorMessage?: string;
}

class SendService {
  async sendFile(fileId: string, contactIds: string[]): Promise<SendResult[]> {
    const file = await fileService.getFileById(fileId);
    if (!file) {
      throw new Error('File not found');
    }

    const results: SendResult[] = [];

    for (const contactId of contactIds) {
      const contact = await contactService.getContactById(contactId);
      if (!contact) {
        results.push({
          contactId,
          contactName: 'Unknown',
          status: 'failed',
          errorMessage: 'Contact not found',
        });
        continue;
      }

      try {
        // Get file path - handle both local and cloud storage
        let filePath: string;
        
        if (file.storageType === 'cloud') {
          // For cloud storage, we need to download temporarily or use the URL
          // For now, if it's a URL, we can't send it directly via WhatsApp Web
          // We'll need to download it first or handle it differently
          // This is a limitation - WhatsApp Web.js requires local file paths
          throw new Error('Cloud storage files need to be downloaded first. This feature will be enhanced.');
        } else {
          filePath = path.join(config.uploadDir, file.storagePath);
          
          // Verify file exists
          const fs = require('fs');
          if (!fs.existsSync(filePath)) {
            throw new Error('File not found on disk');
          }
        }

        // Send file via WhatsApp
        if (contact.isGroup) {
          await whatsappService.sendFileToGroup(
            contact.phoneNumber.includes('@') 
              ? contact.phoneNumber 
              : `${contact.phoneNumber}@g.us`,
            filePath,
            file.originalName
          );
        } else {
          await whatsappService.sendFile(
            contact.phoneNumber.includes('@') 
              ? contact.phoneNumber 
              : `${contact.phoneNumber}@c.us`,
            filePath,
            file.originalName
          );
        }

        // Log success
        await logService.createLog({
          type: 'send',
          fileId: file.id,
          contactId: contact.id,
          status: 'success',
        });

        results.push({
          contactId: contact.id,
          contactName: contact.name,
          status: 'success',
        });
      } catch (error: any) {
        console.error(`Error sending file to ${contact.name}:`, error);

        // Log failure
        await logService.createLog({
          type: 'send',
          fileId: file.id,
          contactId: contact.id,
          status: 'failed',
          errorMessage: error.message || 'Unknown error',
        });

        results.push({
          contactId: contact.id,
          contactName: contact.name,
          status: 'failed',
          errorMessage: error.message || 'Unknown error',
        });
      }
    }

    return results;
  }
}

export const sendService = new SendService();
