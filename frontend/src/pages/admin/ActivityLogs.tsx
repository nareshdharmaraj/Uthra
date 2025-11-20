import React, { useEffect, useState } from 'react';
import { adminService } from '../../services';
import '../../styles/Admin.css';

interface ActivityLog {
  _id: string;
  userId?: any;
  userType?: string;
  action: string;
  details?: string;
  ipAddress?: string;
  timestamp: string;
}

const ActivityLogs: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    userType: ''
  });

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line
  }, [currentPage, filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params: any = { page: currentPage, limit: 20 };
      if (filters.userType) params.userType = filters.userType;
      
      const response = await adminService.getActivityLogs(params);
      setLogs(response.data?.logs || []);
      setTotalPages(response.data?.totalPages || 1);
      setError('');
    } catch (error: any) {
      console.error('Error fetching activity logs:', error);
      setError(error.response?.data?.message || 'Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const getActionIcon = (action: string) => {
    const lowerAction = action.toLowerCase();
    if (lowerAction.includes('login')) return '🔐';
    if (lowerAction.includes('logout')) return '🚪';
    if (lowerAction.includes('create') || lowerAction.includes('add')) return '➕';
    if (lowerAction.includes('update') || lowerAction.includes('edit')) return '✏️';
    if (lowerAction.includes('delete') || lowerAction.includes('remove')) return '🗑️';
    if (lowerAction.includes('verify')) return '✅';
    if (lowerAction.includes('approve')) return '👍';
    if (lowerAction.includes('reject')) return '❌';
    return '📝';
  };

  if (loading) {
    return (
      <div className="admin-home">
        <div className="loading-spinner">Loading activity logs...</div>
      </div>
    );
  }

  return (
    <div className="admin-home">
      <div className="admin-header">
        <h1>Activity Logs</h1>
        <p>Track all user activities and system events</p>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-grid">
          <div className="filter-group">
            <label>User Type</label>
            <select name="userType" value={filters.userType} onChange={handleFilterChange}>
              <option value="">All Users</option>
              <option value="farmer">Farmers</option>
              <option value="buyer">Buyers</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Total Activities</h3>
            <p className="stat-number">{logs.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👨‍🌾</div>
          <div className="stat-content">
            <h3>Farmer Activities</h3>
            <p className="stat-number">{logs.filter(l => l.userType === 'farmer').length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🛒</div>
          <div className="stat-content">
            <h3>Buyer Activities</h3>
            <p className="stat-number">{logs.filter(l => l.userType === 'buyer').length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👨‍💼</div>
          <div className="stat-content">
            <h3>Admin Activities</h3>
            <p className="stat-number">{logs.filter(l => l.userType === 'admin').length}</p>
          </div>
        </div>
      </div>

      {/* Activity Logs */}
      {logs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No Activity Logs Yet</h3>
          <p>Activity logs will appear here as users interact with the system.</p>
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>User</th>
                <th>User Type</th>
                <th>Details</th>
                <th>IP Address</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>{getActionIcon(log.action)}</span>
                      <strong>{log.action}</strong>
                    </div>
                  </td>
                  <td>
                    {log.userId ? (
                      <div>
                        <div style={{ fontWeight: 600 }}>
                          {log.userId.name || log.userId._id}
                        </div>
                        {log.userId.phone && (
                          <div style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>
                            {log.userId.phone}
                          </div>
                        )}
                      </div>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td>
                    <span className={`status-badge ${log.userType}`}>
                      {log.userType || 'N/A'}
                    </span>
                  </td>
                  <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {log.details || 'N/A'}
                  </td>
                  <td>{log.ipAddress || 'N/A'}</td>
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

export default ActivityLogs;
