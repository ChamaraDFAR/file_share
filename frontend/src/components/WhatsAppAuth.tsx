import { useState, useEffect } from 'react';
import { whatsappService, WhatsAppStatus } from '../services/whatsappService';
import './WhatsAppAuth.css';

function WhatsAppAuth() {
  const [status, setStatus] = useState<WhatsAppStatus>({
    isConnected: false,
    message: 'Initializing...',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 3000); // Check every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const checkStatus = async () => {
    try {
      const currentStatus = await whatsappService.getStatus();
      setStatus(currentStatus);
    } catch (error) {
      console.error('Error checking status:', error);
    }
  };

  const handleInitialize = async () => {
    setLoading(true);
    try {
      await whatsappService.initialize();
      await checkStatus();
    } catch (error) {
      console.error('Error initializing:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="whatsapp-auth">
      <div className="auth-card">
        <h3>WhatsApp Connection</h3>
        {status.isConnected ? (
          <div className="status-connected">
            <div className="status-indicator connected" />
            <p>{status.message || 'Connected to WhatsApp'}</p>
          </div>
        ) : status.qrCode ? (
          <div className="qr-code-container">
            <p>Scan this QR code with WhatsApp:</p>
            <img src={status.qrCode} alt="QR Code" className="qr-code" />
            <p className="qr-hint">
              Open WhatsApp → Settings → Linked Devices → Link a Device
            </p>
          </div>
        ) : (
          <div className="status-disconnected">
            <div className="status-indicator disconnected" />
            <p>{status.message || 'Not connected'}</p>
            <button
              onClick={handleInitialize}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Initializing...' : 'Initialize WhatsApp'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default WhatsAppAuth;
