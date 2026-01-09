import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileService } from '../services/file.service';
import { config } from '../config/config';
import fs from 'fs';

const router = express.Router();

// Ensure upload directory exists
if (!fs.existsSync(config.uploadDir)) {
  fs.mkdirSync(config.uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) {
    cb(null, config.uploadDir);
  },
  filename (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: config.maxFileSize,
  },
  fileFilter: (req, file, cb) => {
    // Allow all file types for now, can be restricted later
    cb(null, true);
  },
});

// Upload file
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = await fileService.saveFile(req.file);
    res.json(file);
  } catch (error: any) {
    console.error('File upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload file' });
  }
});

// Get file by ID
router.get('/:id', async (req, res) => {
  try {
    const file = await fileService.getFileById(req.params.id);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Determine file path based on storage type
    if (file.storageType === 'cloud') {
      // Redirect to cloud URL or proxy the download
      const cloudStorageService = (await import('../services/cloudStorage.service')).cloudStorageService;
      if (cloudStorageService.isEnabled()) {
        // Extract key from URL or use storagePath directly
        const cloudUrl = file.storagePath.startsWith('http') 
          ? file.storagePath 
          : cloudStorageService.getFileUrl(file.storagePath);
        return res.redirect(cloudUrl);
      }
    }

    const filePath = path.join(config.uploadDir, file.storagePath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on disk' });
    }

    res.download(filePath, file.originalName);
  } catch (error: any) {
    console.error('File download error:', error);
    res.status(500).json({ error: error.message || 'Failed to download file' });
  }
});

// Get all files
router.get('/', async (req, res) => {
  try {
    const files = await fileService.getAllFiles();
    res.json(files);
  } catch (error: any) {
    console.error('Get files error:', error);
    res.status(500).json({ error: error.message || 'Failed to get files' });
  }
});

export default router;
