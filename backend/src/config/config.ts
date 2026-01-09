import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  uploadDir: process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads'),
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '104857600', 10), // 100MB default
  cloudStorageThreshold: parseInt(process.env.CLOUD_STORAGE_THRESHOLD || '10485760', 10), // 10MB default
  
  cloudStorage: {
    enabled: process.env.CLOUD_STORAGE_ENABLED === 'true',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || 'us-east-1',
    bucketName: process.env.S3_BUCKET_NAME || '',
  },
  
  whatsapp: {
    sessionPath: process.env.WHATSAPP_SESSION_PATH || path.join(__dirname, '../../.whatsapp-session'),
  },
};
