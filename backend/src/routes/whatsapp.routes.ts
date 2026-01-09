import express from 'express';
import { whatsappService } from '../services/whatsapp.service';

const router = express.Router();

// Get QR code for authentication
router.get('/qr', async (req, res) => {
  try {
    const qrCode = await whatsappService.getQRCode();
    res.json({ qrCode });
  } catch (error: any) {
    console.error('QR code error:', error);
    res.status(500).json({ error: error.message || 'Failed to get QR code' });
  }
});

// Get WhatsApp connection status
router.get('/status', async (req, res) => {
  try {
    const status = await whatsappService.getStatus();
    res.json(status);
  } catch (error: any) {
    console.error('Status error:', error);
    res.status(500).json({ error: error.message || 'Failed to get status' });
  }
});

// Initialize WhatsApp client
router.post('/initialize', async (req, res) => {
  try {
    await whatsappService.initialize();
    res.json({ message: 'WhatsApp client initialized' });
  } catch (error: any) {
    console.error('Initialize error:', error);
    res.status(500).json({ error: error.message || 'Failed to initialize WhatsApp' });
  }
});

export default router;
