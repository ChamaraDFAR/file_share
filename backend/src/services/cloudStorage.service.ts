import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { config } from '../config/config';
import fs from 'fs';
import path from 'path';

class CloudStorageService {
  private s3Client: S3Client | null = null;

  constructor() {
    if (config.cloudStorage.enabled) {
      this.s3Client = new S3Client({
        region: config.cloudStorage.region,
        credentials: {
          accessKeyId: config.cloudStorage.accessKeyId,
          secretAccessKey: config.cloudStorage.secretAccessKey,
        },
      });
    }
  }

  async uploadFile(localFilePath: string, remoteKey: string, mimeType: string): Promise<string> {
    if (!this.s3Client || !config.cloudStorage.enabled) {
      throw new Error('Cloud storage is not enabled');
    }

    const fileContent = fs.readFileSync(localFilePath);

    const command = new PutObjectCommand({
      Bucket: config.cloudStorage.bucketName,
      Key: remoteKey,
      Body: fileContent,
      ContentType: mimeType,
    });

    await this.s3Client.send(command);

    // Return the S3 URL
    return `https://${config.cloudStorage.bucketName}.s3.${config.cloudStorage.region}.amazonaws.com/${remoteKey}`;
  }

  async downloadFile(remoteKey: string, localFilePath: string): Promise<void> {
    if (!this.s3Client || !config.cloudStorage.enabled) {
      throw new Error('Cloud storage is not enabled');
    }

    const command = new GetObjectCommand({
      Bucket: config.cloudStorage.bucketName,
      Key: remoteKey,
    });

    const response = await this.s3Client.send(command);
    const stream = response.Body as any;

    // Ensure directory exists
    const dir = path.dirname(localFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write to file
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    fs.writeFileSync(localFilePath, Buffer.concat(chunks));
  }

  getFileUrl(remoteKey: string): string {
    if (!config.cloudStorage.enabled) {
      throw new Error('Cloud storage is not enabled');
    }

    return `https://${config.cloudStorage.bucketName}.s3.${config.cloudStorage.region}.amazonaws.com/${remoteKey}`;
  }

  isEnabled(): boolean {
    return config.cloudStorage.enabled && !!this.s3Client;
  }
}

export const cloudStorageService = new CloudStorageService();
