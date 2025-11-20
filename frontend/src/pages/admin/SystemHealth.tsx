import React, { useEffect, useState } from 'react';
import { adminService } from '../../services';
import '../../styles/Admin.css';
import CounterCard from '../../components/common/CounterCard';

interface SystemHealthData {
  status: string;
  timestamp: string;
  database: {
    status: string;
    responseTime: number;
    connections: number;
    size?: {
      dataSize: number;
      storageSize: number;
      indexSize: number;
      collections: number;
      indexes: number;
      objects: number;
    };
  };
  server: {
    uptime: number;
    memory: {
      used: number;
      total: number;
      percentage: number;
      system: {
        total: number;
        used: number;
        free: number;
        percentage: number;
      };
    };
    cpu: {
      usage: number;
      cores: number;
      loadAverage: number[];
    };
    platform: string;
    nodeVersion: string;
  };
  services: {
    sms: boolean;
    ivr: boolean;
    notifications: boolean;
  };
  counts: {
    farmers: number;
    buyers: number;
    crops: number;
    requests: number;
    total: number;
  };
}

interface SystemStats {
  timestamp: string;
  activeUsers: number;
  activeSessions: number;
  requestsPerMinute: number;
  averageResponseTime: number;
  errorRate: number;
}

const SystemHealth: React.FC = () => {
  const [health, setHealth] = useState<SystemHealthData | null>(null);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 10 seconds if enabled for live updates
    const interval = autoRefresh ? setInterval(fetchData, 10000) : null;
    
    return () => {
      if (interval) clearInterval(interval);
    };
    // eslint-disable-next-line
  }, [autoRefresh]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [healthRes, statsRes] = await Promise.all([
        adminService.getSystemHealth(),
        adminService.getSystemStats()
      ]);
      setHealth(healthRes.data);
      setStats(statsRes.data);
      setError('');
    } catch (error: any) {
      console.error('Error fetching system data:', error);
      setError(error.response?.data?.message || 'Failed to load system health');
    } finally {
      setLoading(false);
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    return status === 'healthy' ? '#27ae60' : status === 'degraded' ? '#f39c12' : '#e74c3c';
  };

  const getHealthIndicator = (value: number, type: 'memory' | 'cpu' | 'error') => {
    if (type === 'memory' || type === 'cpu') {
      if (value < 70) return { color: '#27ae60', label: 'Good' };
      if (value < 85) return { color: '#f39c12', label: 'Warning' };
      return { color: '#e74c3c', label: 'Critical' };
    } else {
      if (value < 1) return { color: '#27ae60', label: 'Good' };
      if (value < 5) return { color: '#f39c12', label: 'Warning' };
      return { color: '#e74c3c', label: 'Critical' };
    }
  };

  if (loading && !health) {
    return (
      <div className="admin-home">
        <div className="loading-spinner">Loading system health...</div>
      </div>
    );
  }

  if (!health) {
    return (
      <div className="admin-home">
        <div className="admin-header">
          <h1>System Health</h1>
          <p>Real-time system monitoring and status</p>
        </div>
        {error && <div className="error-message">{error}</div>}
        <div className="empty-state">
          <div className="empty-icon">🔧</div>
          <h3>Unable to Load System Health</h3>
          <p>Please check if the backend server is running.</p>
          <button className="table-btn view" onClick={fetchData} style={{ marginTop: '1rem' }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-home">
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>System Health</h1>
          <p>Real-time system monitoring and status</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
            <input 
              type="checkbox" 
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Live Updates (10s)
          </label>
          <button className="table-btn view" onClick={fetchData}>
            Refresh Now
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {(
        <>
          {/* System Status Overview */}
          <div className="stats-grid" style={{ marginBottom: '2rem' }}>
            <div className="stat-card">
              <div className="stat-icon">💾</div>
              <div className="stat-content">
                <h3>Database</h3>
                <p style={{ color: getStatusColor(health.database?.status || 'unknown'), fontSize: '1.5rem', fontWeight: 700 }}>
                  {health.database?.status || 'unknown'}
                </p>
                <small>{health.database?.responseTime || 0}ms</small>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🖥️</div>
              <div className="stat-content">
                <h3>Server Uptime</h3>
                <p className="stat-number" style={{ fontSize: '1.2rem' }}>
                  {formatUptime(health.server?.uptime || 0)}
                </p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💬</div>
              <div className="stat-content">
                <h3>SMS Service</h3>
                <p style={{ color: health.services?.sms ? '#27ae60' : '#e74c3c', fontSize: '1.5rem', fontWeight: 700 }}>
                  {health.services?.sms ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📞</div>
              <div className="stat-content">
                <h3>IVR Service</h3>
                <p style={{ color: health.services?.ivr ? '#27ae60' : '#e74c3c', fontSize: '1.5rem', fontWeight: 700 }}>
                  {health.services?.ivr ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
          </div>

          {/* Resource Usage */}
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ marginBottom: '1rem' }}>Resource Usage</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-content">
                  <h3>Database Size</h3>
                  <div style={{ marginTop: '1rem' }}>
                    {health.database?.size ? (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span>Data Size</span>
                          <span style={{ fontWeight: 700 }}>
                            {health.database.size.dataSize.toFixed(2)} MB
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span>Storage Size</span>
                          <span style={{ fontWeight: 700 }}>
                            {health.database.size.storageSize.toFixed(2)} MB
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                          <span>Index Size</span>
                          <span style={{ fontWeight: 700 }}>
                            {health.database.size.indexSize.toFixed(2)} MB
                          </span>
                        </div>
                        <div style={{ 
                          marginTop: '1rem', 
                          padding: '0.5rem',
                          backgroundColor: '#f8f9fa',
                          borderRadius: '4px',
                          fontSize: '0.9rem'
                        }}>
                          <div>Collections: {health.database.size.collections}</div>
                          <div>Indexes: {health.database.size.indexes}</div>
                          <div>Objects: {health.database.size.objects.toLocaleString()}</div>
                        </div>
                      </>
                    ) : (
                      <p style={{ color: '#95a5a6' }}>Database size unavailable</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-content">
                  <h3>CPU Usage</h3>
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span>Current Load</span>
                      <span style={{ 
                        color: getHealthIndicator(health.server?.cpu?.usage || 0, 'cpu').color,
                        fontWeight: 700 
                      }}>
                        {(health.server?.cpu?.usage || 0).toFixed(1)}%
                      </span>
                    </div>
                    <div style={{ 
                      width: '100%', 
                      height: '12px', 
                      backgroundColor: '#ecf0f1', 
                      borderRadius: '6px',
                      overflow: 'hidden'
                    }}>
                      <div style={{ 
                        width: `${health.server?.cpu?.usage || 0}%`, 
                        height: '100%', 
                        backgroundColor: getHealthIndicator(health.server?.cpu?.usage || 0, 'cpu').color,
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                    <div style={{ 
                      marginTop: '0.5rem', 
                      fontSize: '0.9rem',
                      color: getHealthIndicator(health.server?.cpu?.usage || 0, 'cpu').color
                    }}>
                      {getHealthIndicator(health.server?.cpu?.usage || 0, 'cpu').label}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Statistics */}
          {stats && (
            <div>
              <h2 style={{ marginBottom: '1rem' }}>Live Statistics</h2>
              <div className="stats-grid">
                <CounterCard
                  icon="👥"
                  title="Active Users"
                  value={stats.activeUsers}
                  subtitle="Currently online"
                  color="#3498db"
                />
                <CounterCard
                  icon="🔐"
                  title="Active Sessions"
                  value={stats.activeSessions}
                  subtitle="Open connections"
                  color="#9b59b6"
                />
                <CounterCard
                  icon="⚡"
                  title="Requests/Min"
                  value={stats.requestsPerMinute}
                  subtitle="Activity rate"
                  color="#1abc9c"
                />
                <CounterCard
                  icon="⏱️"
                  title="Avg Response Time"
                  value={stats.averageResponseTime}
                  subtitle="milliseconds"
                  color="#f39c12"
                />
                <CounterCard
                  icon={stats.errorRate < 1 ? '✅' : stats.errorRate < 5 ? '⚠️' : '❌'}
                  title="Error Rate"
                  value={parseFloat(stats.errorRate.toFixed(2))}
                  subtitle={getHealthIndicator(stats.errorRate, 'error').label}
                  color={getHealthIndicator(stats.errorRate, 'error').color}
                />
              </div>
            </div>
          )}

          {/* Database Counts */}
          {health.counts && (
            <div style={{ marginTop: '2rem' }}>
              <h2 style={{ marginBottom: '1rem' }}>Database Overview</h2>
              <div className="stats-grid">
                <CounterCard
                  icon="👨‍🌾"
                  title="Total Farmers"
                  value={health.counts.farmers}
                  subtitle="Registered farmers"
                  color="#27ae60"
                />
                <CounterCard
                  icon="🛒"
                  title="Total Buyers"
                  value={health.counts.buyers}
                  subtitle="Registered buyers"
                  color="#3498db"
                />
                <CounterCard
                  icon="🌾"
                  title="Total Crops"
                  value={health.counts.crops}
                  subtitle="Listed crops"
                  color="#e67e22"
                />
                <CounterCard
                  icon="📋"
                  title="Total Requests"
                  value={health.counts.requests}
                  subtitle="Purchase requests"
                  color="#9b59b6"
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SystemHealth;
