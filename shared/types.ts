// Shared types between frontend and backend

export interface File {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  storageType: 'local' | 'cloud';
  storagePath: string;
  uploadDate: Date;
}

export interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  isGroup: boolean;
  groupId?: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
}

export interface Log {
  id: string;
  type: 'send' | 'receive';
  fileId: string;
  contactId: string;
  timestamp: Date;
  status: 'success' | 'failed';
  errorMessage?: string;
  file?: File;
  contact?: Contact;
}

export interface WhatsAppStatus {
  isConnected: boolean;
  qrCode?: string;
  message?: string;
}

export interface SendFileRequest {
  fileId: string;
  contactIds: string[];
}
