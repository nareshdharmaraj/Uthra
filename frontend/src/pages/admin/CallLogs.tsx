import React, { useEffect, useState } from 'react';
import { adminService } from '../../services';
import '../../styles/Admin.css';

interface CallLog {
  _id: string;
  callType: string;
  phoneNumber: string;
  userId?: any;
  userType?: string;
  duration?: number;
  status: string;
  timestamp: string;
  response?: string;
}

const CallLogs: React.FC = () => {
  const [logs, setLogs] = useState<CallLog[]>([]);
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
      const response = await adminService.getCallLogs({ page: currentPage, limit: 20 });
      setLogs(response.data?.logs || []);
      setTotalPages(response.data?.totalPages || 1);
      setError('');
    } catch (error: any) {
      console.error('Error fetching call logs:', error);
      setError(error.response?.data?.message || 'Failed to load call logs');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="admin-home">
        <div className="loading-spinner">Loading call logs...</div>
      </div>
    );
  }

  return (
    <div className="admin-home">
      <div className="admin-header">
        <h1>Call Logs</h1>
        <p>Monitor all IVR and telephony interactions</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-icon">📞</div>
          <div className="stat-content">
            <h3>Total Calls</h3>
            <p className="stat-number">{logs.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Completed</h3>
            <p className="stat-number">{logs.filter(l => l.status === 'completed').length}</p>
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

      {/* Call Logs Table */}
      {logs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📞</div>
          <h3>No Call Logs Yet</h3>
          <p>Call logs will appear here once the IVR system starts receiving calls.</p>
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Call Type</th>
                <th>Phone Number</th>
                <th>User Type</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Timestamp</th>
                <th>Response</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id}>
                  <td><strong>{log.callType}</strong></td>
                  <td>{log.phoneNumber}</td>
                  <td>{log.userType || 'N/A'}</td>
                  <td>{formatDuration(log.duration)}</td>
                  <td>
                    <span className={`status-badge ${log.status}`}>
                      {log.status}
                    </span>
                  </td>
                  <td>{new Date(log.timestamp).toLocaleString()}</td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {log.response || 'N/A'}
                  </td>
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

export default CallLogs;
