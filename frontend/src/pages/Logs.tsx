import { useState, useEffect } from 'react';
import { logService, Log } from '../services/logService';
import { contactService, Contact } from '../services/contactService';
import './Logs.css';

function Logs() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '' as 'send' | 'receive' | '',
    status: '' as 'success' | 'failed' | '',
    contactId: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    loadContacts();
    loadLogs();
  }, [filters]);

  const loadContacts = async () => {
    try {
      const data = await contactService.getAllContacts();
      setContacts(data);
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const loadLogs = async () => {
    setLoading(true);
    try {
      const logFilters: any = {};
      if (filters.type) logFilters.type = filters.type;
      if (filters.status) logFilters.status = filters.status;
      if (filters.contactId) logFilters.contactId = filters.contactId;
      if (filters.startDate) logFilters.startDate = filters.startDate;
      if (filters.endDate) logFilters.endDate = filters.endDate;

      const data = await logService.getLogs(logFilters);
      setLogs(data);
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      await logService.exportLogs();
    } catch (error) {
      console.error('Error exporting logs:', error);
      alert('Failed to export logs');
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="logs-page">
      <div className="logs-header">
        <h2>Activity Logs</h2>
        <button onClick={handleExport} className="btn-secondary">
          Export CSV
        </button>
      </div>

      <div className="logs-filters">
        <div className="filter-group">
          <label>Type</label>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value as any })}
          >
            <option value="">All</option>
            <option value="send">Send</option>
            <option value="receive">Receive</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Status</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
          >
            <option value="">All</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Contact</label>
          <select
            value={filters.contactId}
            onChange={(e) => setFilters({ ...filters, contactId: e.target.value })}
          >
            <option value="">All</option>
            {contacts.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Start Date</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          />
        </div>

        <div className="filter-group">
          <label>End Date</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading logs...</div>
      ) : logs.length === 0 ? (
        <div className="no-logs">No logs found</div>
      ) : (
        <div className="logs-table-container">
          <table className="logs-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Type</th>
                <th>File</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Error</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className={`log-row ${log.status}`}>
                  <td>{formatDate(log.timestamp)}</td>
                  <td>
                    <span className={`type-badge ${log.type}`}>
                      {log.type}
                    </span>
                  </td>
                  <td>
                    {log.file ? (
                      <div className="file-info-cell">
                        <span className="file-name">{log.file.originalName}</span>
                        <span className="file-size">{formatFileSize(log.file.size)}</span>
                      </div>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td>
                    {log.contact ? (
                      <div>
                        <span className="contact-name">{log.contact.name}</span>
                        {log.contact.isGroup && (
                          <span className="group-badge">Group</span>
                        )}
                      </div>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td>
                    <span className={`status-badge ${log.status}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="error-cell">
                    {log.errorMessage || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Logs;
