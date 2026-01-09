import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import qrcode from 'qrcode';
import path from 'path';
import { config } from '../config/config';
import fs from 'fs';
import { fileService } from './file.service';
import { logService } from './log.service';

class WhatsAppService {
  private client: Client | null = null;
  private qrCode: string | null = null;
  private isReady: boolean = false;

  async initialize(): Promise<void> {
    if (this.client) {
      return;
    }

    // Ensure session directory exists
    const sessionDir = config.whatsapp.sessionPath;
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
    }

    this.client = new Client({
      authStrategy: new LocalAuth({
        dataPath: sessionDir,
      }),
      puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
    });

    // QR code generation
    this.client.on('qr', async (qr) => {
      try {
        this.qrCode = await qrcode.toDataURL(qr);
        console.log('QR code generated');
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    });

    // Ready event
    this.client.on('ready', () => {
      this.isReady = true;
      this.qrCode = null;
      console.log('WhatsApp client is ready!');
    });

    // Authentication failure
    this.client.on('auth_failure', (msg) => {
      console.error('Authentication failure:', msg);
      this.isReady = false;
    });

    // Disconnected
    this.client.on('disconnected', (reason) => {
      console.log('WhatsApp client disconnected:', reason);
      this.isReady = false;
    });

    // Message listener for receiving files
    this.client.on('message', async (message: Message) => {
      await this.handleIncomingMessage(message);
    });

    // Message create listener for media
    this.client.on('message_create', async (message: Message) => {
      if (message.hasMedia) {
        await this.handleIncomingMessage(message);
      }
    });

    await this.client.initialize();
  }

  private async handleIncomingMessage(message: Message): Promise<void> {
    try {
      if (message.hasMedia) {
        const media = await message.downloadMedia();
        if (media) {
          // Save received file
          const buffer = Buffer.from(media.data, 'base64');
          const filename = `${Date.now()}-${message.id._serialized}.${media.mimetype.split('/')[1]}`;
          const filepath = path.join(config.uploadDir, filename);
          
          fs.writeFileSync(filepath, buffer);

          // Create file record
          const file = await fileService.saveFileFromPath(
            filepath,
            media.filename || filename,
            media.mimetype
          );

          // Get or create contact
          const contactId = message.from;
          let contact = await this.findOrCreateContact(contactId, message);

          // Log receive event
          await logService.createLog({
            type: 'receive',
            fileId: file.id,
            contactId: contact.id,
            status: 'success',
          });
        }
      }
    } catch (error) {
      console.error('Error handling incoming message:', error);
    }
  }

  private async findOrCreateContact(contactId: string, message: Message): Promise<any> {
    const contactService = (await import('./contact.service')).contactService;
    
    // Try to find existing contact
    const existing = await contactService.getAllContacts();
    const found = existing.find(c => c.phoneNumber === contactId.split('@')[0]);

    if (found) {
      return found;
    }

    // Create new contact
    const contact = await message.getContact();
    return contactService.createContact({
      name: contact.pushname || contactId,
      phoneNumber: contactId.split('@')[0],
      isGroup: message.from.includes('@g.us'),
    });
  }

  async getQRCode(): Promise<string | null> {
    if (!this.client) {
      await this.initialize();
    }
    return this.qrCode;
  }

  async getStatus(): Promise<{ isConnected: boolean; qrCode?: string; message?: string }> {
    if (!this.client) {
      return {
        isConnected: false,
        message: 'WhatsApp client not initialized',
      };
    }

    if (this.isReady) {
      return {
        isConnected: true,
        message: 'Connected to WhatsApp',
      };
    }

    if (this.qrCode) {
      return {
        isConnected: false,
        qrCode: this.qrCode,
        message: 'Please scan the QR code with WhatsApp',
      };
    }

    return {
      isConnected: false,
      message: 'Initializing WhatsApp client...',
    };
  }

  getClient(): Client | null {
    return this.client;
  }

  async sendFile(phoneNumber: string, filePath: string, caption?: string): Promise<void> {
    if (!this.client || !this.isReady) {
      throw new Error('WhatsApp client is not ready');
    }

    await this.client.sendMessage(phoneNumber, filePath, {
      caption,
    });
  }

  async sendFileToGroup(groupId: string, filePath: string, caption?: string): Promise<void> {
    if (!this.client || !this.isReady) {
      throw new Error('WhatsApp client is not ready');
    }

    await this.client.sendMessage(groupId, filePath, {
      caption,
    });
  }
}

export const whatsappService = new WhatsAppService();
