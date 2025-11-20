import React, { useEffect, useState } from 'react';
import { adminService } from '../../services';
import '../../styles/Admin.css';
import CounterCard from '../../components/common/CounterCard';

interface CallLog {
  _id: string;
  phoneNumber: string;
  farmer?: { _id: string; name: string };
  callType: string;
  callPurpose?: string;
  callStatus: string;
  duration: number;
  startTime: Date;
  endTime?: Date;
}

interface SMSLog {
  _id: string;
  from: string;
  to: string;
  recipient?: { _id: string; name: string };
  message: string;
  messageType: string;
  status: string;
  provider: string;
  sentAt: Date;
  deliveredAt?: Date;
  cost?: number;
}

interface ActivityLog {
  _id: string;
  user: { _id: string; name: string; role: string };
  action: string;
  details: string;
  ipAddress: string;
  timestamp: Date;
}

type LogTab = 'call' | 'sms' | 'activity';

const Logs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<LogTab>('call');
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [smsLogs, setSmsLogs] = useState<SMSLog[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [callFilter, setCallFilter] = useState('all');
  const [smsFilter, setSmsFilter] = useState('all');
  const [activityFilter, setActivityFilter] = useState('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  
  // Selection for bulk actions
  const [selectedLogs, setSelectedLogs] = useState<string[]>([]);

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line
  }, [activeTab]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      if (activeTab === 'call') {
        const response = await adminService.getCallLogs();
        setCallLogs(response.data);
      } else if (activeTab === 'sms') {
        const response = await adminService.getSMSLogs();
        setSmsLogs(response.data);
      } else {
        const response = await adminService.getActivityLogs();
        setActivityLogs(response.data);
      }
      setError('');
    } catch (error: any) {
      console.error('Error fetching logs:', error);
      setError(error.response?.data?.message || 'Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimestamp = (date: Date) => {
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionIcon = (action: string) => {
    const iconMap: { [key: string]: string } = {
      'login': '🔐',
      'logout': '🚪',
      'create': '✨',
      'update': '✏️',
      'delete': '🗑️',
      'view': '👁️',
      'export': '📤',
      'import': '📥'
    };
    return iconMap[action.toLowerCase()] || '📝';
  };

  const filterAndSearch = () => {
    let filtered: any[] = [];
    
    if (activeTab === 'call') {
      filtered = callLogs.filter(log => {
        const matchesSearch = searchTerm === '' ||
          log.phoneNumber.includes(searchTerm) ||
          log.farmer?.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = callFilter === 'all' || log.callStatus === callFilter;
        return matchesSearch && matchesFilter;
      });
    } else if (activeTab === 'sms') {
      filtered = smsLogs.filter(log => {
        const matchesSearch = searchTerm === '' ||
          log.to.includes(searchTerm) ||
          log.message.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = smsFilter === 'all' || log.status === smsFilter;
        return matchesSearch && matchesFilter;
      });
    } else {
      filtered = activityLogs.filter(log => {
        const matchesSearch = searchTerm === '' ||
          log.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.details?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = activityFilter === 'all' || log.user?.role === activityFilter;
        return matchesSearch && matchesFilter;
      });
    }
    
    return filtered;
  };

  const filtered = filterAndSearch();
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const renderFilters = () => (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      marginBottom: '1.5rem',
      gap: '1rem',
      flexWrap: 'wrap'
    }}>
      <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
        <input
          type="text"
          placeholder={`Search ${activeTab} logs...`}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          style={{
            flex: 1,
            maxWidth: '400px',
            padding: '0.6rem 1rem',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '0.9rem'
          }}
        />
      </div>
      
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', color: '#666', marginRight: '0.5rem' }}>Filter:</span>
        {activeTab === 'call' && (
          <select 
            value={callFilter} 
            onChange={(e) => {
              setCallFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="missed">Missed</option>
            <option value="failed">Failed</option>
          </select>
        )}
        {activeTab === 'sms' && (
          <select 
            value={smsFilter} 
            onChange={(e) => {
              setSmsFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Status</option>
            <option value="sent">Sent</option>
            <option value="delivered">Delivered</option>
            <option value="failed">Failed</option>
          </select>
        )}
        {activeTab === 'activity' && (
          <select 
            value={activityFilter} 
            onChange={(e) => {
              setActivityFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Users</option>
            <option value="admin">Admins</option>
            <option value="farmer">Farmers</option>
            <option value="buyer">Buyers</option>
          </select>
        )}
        {selectedLogs.length > 0 && (
          <>
            <span style={{ fontSize: '0.85rem', color: '#2ecc71', fontWeight: 600, marginLeft: '1rem' }}>
              {selectedLogs.length} selected
            </span>
            <button 
              className="table-btn delete" 
              onClick={handleDeleteSelected}
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
              🗑️ Delete
            </button>
            <button 
              className="table-btn view" 
              onClick={handleExportLogs}
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', background: '#27ae60', color: 'white' }}
            >
              📥 Export
            </button>
          </>
        )}
        <button 
          className="table-btn view" 
          onClick={fetchLogs}
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
        >
          🔄 Refresh
        </button>
      </div>
    </div>
  );

  const handleSelectLog = (id: string) => {
    setSelectedLogs(prev => 
      prev.includes(id) ? prev.filter(logId => logId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedLogs.length === paginatedData.length) {
      setSelectedLogs([]);
    } else {
      setSelectedLogs(paginatedData.map((log: any) => log._id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedLogs.length === 0) return;
    
    if (!window.confirm(`Delete ${selectedLogs.length} selected log(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      // TODO: Implement delete API endpoint
      alert('Delete functionality will be implemented in backend');
      setSelectedLogs([]);
      // fetchLogs();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete logs');
    }
  };

  const handleExportLogs = () => {
    const dataToExport = activeTab === 'call' ? callLogs : 
                         activeTab === 'sms' ? smsLogs : activityLogs;
    
    const csv = [
      Object.keys(dataToExport[0] || {}).join(','),
      ...dataToExport.map(log => Object.values(log).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const renderCallLogs = () => (
    <div className="admin-table-container">
      <table className="admin-table">
        <thead>
          <tr>
            <th style={{ width: '40px' }}>
              <input 
                type="checkbox" 
                checked={selectedLogs.length === paginatedData.length && paginatedData.length > 0}
                onChange={handleSelectAll}
              />
            </th>
            <th>Phone</th>
            <th>Farmer</th>
            <th>Type</th>
            <th>Purpose</th>
            <th>Duration</th>
            <th>Status</th>
            <th>Time</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.length === 0 ? (
            <tr>
              <td colSpan={9} style={{ textAlign: 'center', padding: '3rem' }}>
                <div className="empty-icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>📞</div>
                <h3>No call logs found</h3>
                <p style={{ color: '#7f8c8d' }}>Call logs will appear here when farmers use the IVR system.</p>
              </td>
            </tr>
          ) : (
            paginatedData.map((log: CallLog) => (
              <tr key={log._id}>
                <td>
                  <input 
                    type="checkbox" 
                    checked={selectedLogs.includes(log._id)}
                    onChange={() => handleSelectLog(log._id)}
                  />
                </td>
                <td><strong>{log.phoneNumber}</strong></td>
                <td>{log.farmer?.name || 'Unknown'}</td>
                <td>
                  <span className="status-badge" style={{ background: '#e3f2fd', color: '#0d47a1', textTransform: 'capitalize' }}>
                    {log.callType}
                  </span>
                </td>
                <td style={{ fontSize: '0.85rem' }}>{log.callPurpose?.replace(/_/g, ' ') || 'N/A'}</td>
                <td>{formatDuration(log.duration)}</td>
                <td>
                  <span className={`status-badge ${log.callStatus}`} style={{
                    background: log.callStatus === 'completed' ? '#d4edda' : 
                               log.callStatus === 'failed' ? '#f8d7da' : '#fff3cd',
                    color: log.callStatus === 'completed' ? '#155724' : 
                          log.callStatus === 'failed' ? '#721c24' : '#856404'
                  }}>
                    {log.callStatus}
                  </span>
                </td>
                <td style={{ fontSize: '0.85rem' }}>{formatTimestamp(log.startTime)}</td>
                <td>
                  <button 
                    className="table-btn delete"
                    onClick={() => {
                      setSelectedLogs([log._id]);
                      handleDeleteSelected();
                    }}
                    style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  const renderSMSLogs = () => (
    <div className="admin-table-container">
      <table className="admin-table">
        <thead>
          <tr>
            <th style={{ width: '40px' }}>
              <input 
                type="checkbox" 
                checked={selectedLogs.length === paginatedData.length && paginatedData.length > 0}
                onChange={handleSelectAll}
              />
            </th>
            <th>To</th>
            <th>Recipient</th>
            <th>Message</th>
            <th>Type</th>
            <th>Status</th>
            <th>Cost</th>
            <th>Time</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.length === 0 ? (
            <tr>
              <td colSpan={9} style={{ textAlign: 'center', padding: '3rem' }}>
                <div className="empty-icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
                <h3>No SMS logs found</h3>
                <p style={{ color: '#7f8c8d' }}>SMS logs will appear when notifications are sent.</p>
              </td>
            </tr>
          ) : (
            paginatedData.map((log: SMSLog) => (
              <tr key={log._id}>
                <td>
                  <input 
                    type="checkbox" 
                    checked={selectedLogs.includes(log._id)}
                    onChange={() => handleSelectLog(log._id)}
                  />
                </td>
                <td><strong>{log.to}</strong></td>
                <td>{log.recipient?.name || 'Unknown'}</td>
                <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {log.message}
                </td>
                <td>
                  <span className="status-badge" style={{ background: '#e8f5e9', color: '#2e7d32', fontSize: '0.8rem' }}>
                    {log.messageType?.replace(/_/g, ' ')}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${log.status}`} style={{
                    background: log.status === 'delivered' ? '#d4edda' : 
                               log.status === 'failed' ? '#f8d7da' : '#fff3cd',
                    color: log.status === 'delivered' ? '#155724' : 
                          log.status === 'failed' ? '#721c24' : '#856404'
                  }}>
                    {log.status}
                  </span>
                </td>
                <td style={{ fontSize: '0.85rem' }}>₹{log.cost?.toFixed(2) || '0.00'}</td>
                <td style={{ fontSize: '0.85rem' }}>{formatTimestamp(log.sentAt)}</td>
                <td>
                  <button 
                    className="table-btn delete"
                    onClick={() => {
                      setSelectedLogs([log._id]);
                      handleDeleteSelected();
                    }}
                    style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  const renderActivityLogs = () => (
    <div className="admin-table-container">
      <table className="admin-table">
        <thead>
          <tr>
            <th style={{ width: '40px' }}>
              <input 
                type="checkbox" 
                checked={selectedLogs.length === paginatedData.length && paginatedData.length > 0}
                onChange={handleSelectAll}
              />
            </th>
            <th>User</th>
            <th>Role</th>
            <th>Action</th>
            <th>Details</th>
            <th>IP Address</th>
            <th>Time</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.length === 0 ? (
            <tr>
              <td colSpan={8} style={{ textAlign: 'center', padding: '3rem' }}>
                <div className="empty-icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
                <h3>No activity logs found</h3>
                <p style={{ color: '#7f8c8d' }}>Activity logs track user actions in the system.</p>
              </td>
            </tr>
          ) : (
            paginatedData.map((log: ActivityLog) => (
              <tr key={log._id}>
                <td>
                  <input 
                    type="checkbox" 
                    checked={selectedLogs.includes(log._id)}
                    onChange={() => handleSelectLog(log._id)}
                  />
                </td>
                <td>
                  <strong>{log.user?.name || 'Unknown'}</strong>
                </td>
                <td>
                  <span className="status-badge" style={{ 
                    background: log.user?.role === 'admin' ? '#fce4ec' : 
                               log.user?.role === 'farmer' ? '#e8f5e9' : '#e3f2fd',
                    color: log.user?.role === 'admin' ? '#c2185b' : 
                          log.user?.role === 'farmer' ? '#2e7d32' : '#0d47a1',
                    textTransform: 'capitalize'
                  }}>
                    {log.user?.role || 'N/A'}
                  </span>
                </td>
                <td>
                  <span style={{ marginRight: '0.5rem' }}>{getActionIcon(log.action)}</span>
                  <span style={{ fontSize: '0.9rem' }}>{log.action}</span>
                </td>
                <td style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.85rem' }}>
                  {log.details}
                </td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#7f8c8d' }}>{log.ipAddress}</td>
                <td style={{ fontSize: '0.85rem' }}>{formatTimestamp(log.timestamp)}</td>
                <td>
                  <button 
                    className="table-btn delete"
                    onClick={() => {
                      setSelectedLogs([log._id]);
                      handleDeleteSelected();
                    }}
                    style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginTop: '2rem',
        gap: '0.5rem'
      }}>
        <button
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="table-btn view"
          style={{ padding: '0.5rem 1rem' }}
        >
          Previous
        </button>
        <span style={{ padding: '0 1rem', color: '#666' }}>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="table-btn view"
          style={{ padding: '0.5rem 1rem' }}
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="admin-home">
      <div className="admin-header">
        <h1>System Logs</h1>
        <p>Monitor all system activities, calls, and messages</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Stats Overview */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <CounterCard
          icon="📞"
          title="Total Call Logs"
          value={callLogs.length}
          subtitle="IVR interactions"
          color="#3498db"
        />
        <CounterCard
          icon="💬"
          title="Total SMS Logs"
          value={smsLogs.length}
          subtitle="Messages sent"
          color="#9b59b6"
        />
        <CounterCard
          icon="📊"
          title="Total Activities"
          value={activityLogs.length}
          subtitle="User actions"
          color="#1abc9c"
        />
        <CounterCard
          icon={activeTab === 'call' ? '📞' : activeTab === 'sms' ? '💬' : '📊'}
          title={`Active ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Logs`}
          value={filtered.length}
          subtitle="Matching filters"
          color="#e67e22"
        />
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '1.5rem',
        borderBottom: '2px solid #eee',
        paddingBottom: '0.5rem'
      }}>
        <button
          onClick={() => {
            setActiveTab('call');
            setSearchTerm('');
            setCurrentPage(1);
          }}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            background: activeTab === 'call' ? '#3498db' : 'transparent',
            color: activeTab === 'call' ? 'white' : '#666',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            fontWeight: activeTab === 'call' ? 'bold' : 'normal',
            fontSize: '0.95rem',
            transition: 'all 0.3s ease'
          }}
        >
          📞 Call Logs
        </button>
        <button
          onClick={() => {
            setActiveTab('sms');
            setSearchTerm('');
            setCurrentPage(1);
          }}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            background: activeTab === 'sms' ? '#9b59b6' : 'transparent',
            color: activeTab === 'sms' ? 'white' : '#666',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            fontWeight: activeTab === 'sms' ? 'bold' : 'normal',
            fontSize: '0.95rem',
            transition: 'all 0.3s ease'
          }}
        >
          💬 SMS Logs
        </button>
        <button
          onClick={() => {
            setActiveTab('activity');
            setSearchTerm('');
            setCurrentPage(1);
          }}
          style={{
            padding: '0.75rem 1.5rem',
            border: 'none',
            background: activeTab === 'activity' ? '#1abc9c' : 'transparent',
            color: activeTab === 'activity' ? 'white' : '#666',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            fontWeight: activeTab === 'activity' ? 'bold' : 'normal',
            fontSize: '0.95rem',
            transition: 'all 0.3s ease'
          }}
        >
          📊 Activity Logs
        </button>
      </div>

      {/* Filters and Search */}
      {renderFilters()}

      {/* Content */}
      {loading ? (
        <div className="loading-spinner">Loading {activeTab} logs...</div>
      ) : (
        <>
          {activeTab === 'call' && renderCallLogs()}
          {activeTab === 'sms' && renderSMSLogs()}
          {activeTab === 'activity' && renderActivityLogs()}
          {renderPagination()}
        </>
      )}
    </div>
  );
};

export default Logs;
