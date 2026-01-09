import { useState, useEffect } from 'react';
import FileUpload from '../components/FileUpload';
import WhatsAppAuth from '../components/WhatsAppAuth';
import ContactSelector from '../components/ContactSelector';
import { fileService, File } from '../services/fileService';
import { sendService, SendResult } from '../services/sendService';
import './Dashboard.css';

function Dashboard() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [sendResults, setSendResults] = useState<SendResult[]>([]);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const files = await fileService.getAllFiles();
      setUploadedFiles(files);
    } catch (error) {
      console.error('Error loading files:', error);
    }
  };

  const handleUploadComplete = (file: File) => {
    setUploadedFiles([file, ...uploadedFiles]);
    setSelectedFile(file.id);
  };

  const handleSend = async () => {
    if (!selectedFile) {
      alert('Please select a file');
      return;
    }

    if (selectedContacts.length === 0) {
      alert('Please select at least one recipient');
      return;
    }

    setSending(true);
    setSendResults([]);

    try {
      const results = await sendService.sendFile(selectedFile, selectedContacts);
      setSendResults(results);

      const successCount = results.filter(r => r.status === 'success').length;
      const failCount = results.filter(r => r.status === 'failed').length;

      if (failCount === 0) {
        alert(`Successfully sent to ${successCount} recipient(s)`);
      } else {
        alert(`Sent to ${successCount} recipient(s), failed for ${failCount} recipient(s)`);
      }

      // Reset selections
      setSelectedFile(null);
      setSelectedContacts([]);
    } catch (error: any) {
      console.error('Error sending file:', error);
      alert(error.response?.data?.error || 'Failed to send file');
    } finally {
      setSending(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="dashboard">
      <h2>File Sharing Dashboard</h2>

      <div className="dashboard-grid">
        <div className="dashboard-section">
          <WhatsAppAuth />
        </div>

        <div className="dashboard-section">
          <h3>Upload File</h3>
          <FileUpload onUploadComplete={handleUploadComplete} />

          {uploadedFiles.length > 0 && (
            <div className="files-list">
              <h4>Uploaded Files</h4>
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className={`file-item ${selectedFile === file.id ? 'selected' : ''}`}
                  onClick={() => setSelectedFile(file.id)}
                >
                  <div className="file-info">
                    <span className="file-name">{file.originalName}</span>
                    <span className="file-size">{formatFileSize(file.size)}</span>
                  </div>
                  {selectedFile === file.id && (
                    <span className="checkmark">✓</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dashboard-section">
          <ContactSelector
            selectedContacts={selectedContacts}
            onSelectionChange={setSelectedContacts}
          />
        </div>
      </div>

      <div className="send-section">
        <button
          onClick={handleSend}
          disabled={!selectedFile || selectedContacts.length === 0 || sending}
          className="btn-send"
        >
          {sending ? 'Sending...' : `Send File to ${selectedContacts.length} Recipient(s)`}
        </button>

        {sendResults.length > 0 && (
          <div className="send-results">
            <h4>Send Results</h4>
            {sendResults.map((result, index) => (
              <div key={index} className={`result-item ${result.status}`}>
                <span className="result-name">{result.contactName}</span>
                <span className={`result-status ${result.status}`}>
                  {result.status === 'success' ? '✓ Sent' : '✗ Failed'}
                </span>
                {result.errorMessage && (
                  <span className="result-error">{result.errorMessage}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
