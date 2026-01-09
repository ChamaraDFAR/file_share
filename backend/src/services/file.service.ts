import prisma from '../config/database';
import { config } from '../config/config';
import { cloudStorageService } from './cloudStorage.service';
import path from 'path';
import fs from 'fs';

export interface FileMetadata {
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  storageType: 'local' | 'cloud';
  storagePath: string;
}

class FileService {
  async saveFile(file: Express.Multer.File): Promise<any> {
    const shouldUseCloud = file.size > config.cloudStorageThreshold && cloudStorageService.isEnabled();
    const storageType = shouldUseCloud ? 'cloud' : 'local';
    let storagePath = file.filename;

    // If cloud storage is enabled and file is large, upload to cloud
    if (shouldUseCloud) {
      try {
        const filePath = path.join(config.uploadDir, file.filename);
        const cloudUrl = await cloudStorageService.uploadFile(
          filePath,
          file.filename,
          file.mimetype
        );
        storagePath = cloudUrl;
        
        // Optionally delete local file after cloud upload
        // fs.unlinkSync(filePath);
      } catch (error) {
        console.error('Cloud upload failed, falling back to local:', error);
        // Fallback to local storage if cloud upload fails
        storagePath = file.filename;
      }
    }

    const fileRecord = await prisma.file.create({
      data: {
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        storageType: shouldUseCloud ? 'cloud' : 'local',
        storagePath,
      },
    });

    return fileRecord;
  }

  async saveFileFromPath(filepath: string, originalName: string, mimeType: string): Promise<any> {
    const stats = fs.statSync(filepath);
    const filename = path.basename(filepath);
    const storageType = stats.size > config.cloudStorageThreshold ? 'cloud' : 'local';
    const storagePath = filename;

    const fileRecord = await prisma.file.create({
      data: {
        filename,
        originalName,
        size: stats.size,
        mimeType,
        storageType,
        storagePath,
      },
    });

    return fileRecord;
  }

  async getFileById(id: string): Promise<any | null> {
    const file = await prisma.file.findUnique({
      where: { id },
    });

    // If file is in cloud, download it temporarily or return cloud URL
    if (file && file.storageType === 'cloud' && cloudStorageService.isEnabled()) {
      // For now, return the cloud URL
      // In production, you might want to proxy the download or generate signed URLs
    }

    return file;
  }

  async getAllFiles(): Promise<any[]> {
    return prisma.file.findMany({
      orderBy: { uploadDate: 'desc' },
    });
  }

  async deleteFile(id: string): Promise<void> {
    const file = await prisma.file.findUnique({
      where: { id },
    });

    if (!file) {
      throw new Error('File not found');
    }

    // Delete physical file
    const filePath = path.join(config.uploadDir, file.storagePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete database record
    await prisma.file.delete({
      where: { id },
    });
  }

  async getFileStream(id: string): Promise<fs.ReadStream | null> {
    const file = await this.getFileById(id);
    if (!file) {
      return null;
    }

    const filePath = path.join(config.uploadDir, file.storagePath);
    if (!fs.existsSync(filePath)) {
      return null;
    }

    return fs.createReadStream(filePath);
  }
}

export const fileService = new FileService();
