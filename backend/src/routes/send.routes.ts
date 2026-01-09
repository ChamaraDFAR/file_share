import express from 'express';
import { sendService } from '../services/send.service';

const router = express.Router();

// Send file to contact/group
router.post('/', async (req, res) => {
  try {
    const { fileId, contactIds } = req.body;

    if (!fileId || !contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      return res.status(400).json({ error: 'File ID and contact IDs are required' });
    }

    const results = await sendService.sendFile(fileId, contactIds);
    res.json(results);
  } catch (error: any) {
    console.error('Send file error:', error);
    res.status(500).json({ error: error.message || 'Failed to send file' });
  }
});

export default router;
