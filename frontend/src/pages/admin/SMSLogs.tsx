import React, { useEffect, useState } from 'react';
import { adminService } from '../../services';
import '../../styles/Admin.css';

interface SMSLog {
  _id: string;
  phoneNumber: string;
  message: string;
  status: string;
  userId?: any;
  userType?: string;
  timestamp: string;
  provider?: string;
  messageId?: string;
}

const SMSLogs: React.FC = () => {
  const [logs, setLogs] = useState<SMSLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line
  }, [currentPage]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await adminService.getSMSLogs({ page: currentPage, limit: 20 });
      setLogs(response.data?.logs || []);
      setTotalPages(response.data?.totalPages || 1);
      setError('');
    } catch (error: any) {
      console.error('Error fetching SMS logs:', error);
      setError(error.response?.data?.message || 'Failed to load SMS logs');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-home">
        <div className="loading-spinner">Loading SMS logs...</div>
      </div>
    );
  }

  return (
    <div className="admin-home">
      <div className="admin-header">
        <h1>SMS Logs</h1>
        <p>Monitor all SMS notifications and messages</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-icon">💬</div>
          <div className="stat-content">
            <h3>Total Messages</h3>
            <p className="stat-number">{logs.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Delivered</h3>
            <p className="stat-number">{logs.filter(l => l.status === 'delivered' || l.status === 'sent').length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">❌</div>
          <div className="stat-content">
            <h3>Failed</h3>
            <p className="stat-number">{logs.filter(l => l.status === 'failed').length}</p>
          </div>
        </div>
      </div>

      {/* SMS Logs Table */}
      {logs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💬</div>
          <h3>No SMS Logs Yet</h3>
          <p>SMS logs will appear here once the system starts sending notifications.</p>
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Phone Number</th>
                <th>User Type</th>
                <th>Message</th>
                <th>Provider</th>
                <th>Status</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id}>
                  <td><strong>{log.phoneNumber}</strong></td>
                  <td>{log.userType || 'N/A'}</td>
                  <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {log.message}
                  </td>
                  <td>{log.provider || 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${log.status}`}>
                      {log.status}
                    </span>
                  </td>
                  <td>{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SMSLogs;
