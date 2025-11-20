import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import '../../styles/Settings.css';

interface SystemSettings {
  isOperational: boolean;
  maintenanceMessage: string;
  currentMaintenanceStart: Date | null;
  emailSettings: {
    enabled: boolean;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    fromEmail: string;
    fromName: string;
  };
  smsSettings: {
    enabled: boolean;
    provider: string;
    apiKey: string;
    apiSecret: string;
    senderId: string;
  };
  notificationSettings: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    notifyAdminOnNewUser: boolean;
    notifyAdminOnNewRequest: boolean;
    notifyAdminOnSystemError: boolean;
  };
  userSettings: {
    autoVerifyUsers: boolean;
    requireEmailVerification: boolean;
    requirePhoneVerification: boolean;
    maxLoginAttempts: number;
    lockoutDuration: number;
  };
  sessionSettings: {
    sessionTimeout: number;
    maxConcurrentSessions: number;
    rememberMeDuration: number;
  };
  securitySettings: {
    passwordMinLength: number;
    passwordRequireUppercase: boolean;
    passwordRequireNumbers: boolean;
    passwordRequireSpecialChars: boolean;
    passwordExpiryDays: number;
    enableTwoFactor: boolean;
  };
  apiSettings: {
    rateLimit: number;
    enableApiKeys: boolean;
    allowedOrigins: string[];
  };
  backupSettings: {
    autoBackup: boolean;
    backupFrequency: string;
    backupTime: string;
    retentionDays: number;
  };
}

interface MaintenanceLog {
  _id: string;
  status: string;
  startTime: Date;
  endTime: Date | null;
  updatedBy: {
    name: string;
    email: string;
  };
  reason: string;
}

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('maintenance');
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [maintenanceReason, setMaintenanceReason] = useState('');
  const [showReasonInput, setShowReasonInput] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchMaintenanceLogs();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await adminService.getSystemSettings();
      setSettings(response.data);
      setLoading(false);
    } catch (error: any) {
      setAlert({ type: 'error', message: error.response?.data?.message || 'Failed to load settings' });
      setLoading(false);
    }
  };

  const fetchMaintenanceLogs = async () => {
    try {
      const response = await adminService.getMaintenanceLogs({ limit: 20, page: 1 });
      setMaintenanceLogs(response.data.logs);
    } catch (error) {
      console.error('Failed to fetch maintenance logs:', error);
    }
  };

  const handleToggleMaintenance = async () => {
    if (!settings) return;

    const newOperationalStatus = !settings.isOperational;

    // If enabling maintenance (turning off operational), show reason input
    if (!newOperationalStatus && !showReasonInput) {
      setShowReasonInput(true);
      return;
    }

    try {
      setSaving(true);
      await adminService.toggleMaintenanceMode(newOperationalStatus, maintenanceReason);
      
      setAlert({
        type: 'success',
        message: newOperationalStatus 
          ? 'System is now operational - Users can login' 
          : 'Maintenance mode activated - Only admins can login'
      });

      // Refresh settings and logs
      await fetchSettings();
      await fetchMaintenanceLogs();
      
      setMaintenanceReason('');
      setShowReasonInput(false);

      // Trigger page reload to update banner
      window.location.reload();
    } catch (error: any) {
      setAlert({ type: 'error', message: error.response?.data?.message || 'Failed to toggle maintenance mode' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSettings = async (section: string, data: any) => {
    try {
      setSaving(true);
      await adminService.updateSystemSettings({ [section]: data });
      setAlert({ type: 'success', message: 'Settings updated successfully' });
      await fetchSettings();
    } catch (error: any) {
      setAlert({ type: 'error', message: error.response?.data?.message || 'Failed to update settings' });
    } finally {
      setSaving(false);
    }
  };

  const renderMaintenanceTab = () => (
    <div className="settings-section">
      <h3>🔧 Maintenance Mode</h3>
      <p className="section-description">
        Control system availability for farmers, buyers, and donors. Admin access is always maintained.
      </p>

      <div className="maintenance-control">
        <div className="maintenance-status">
          <div className={`status-indicator ${settings?.isOperational ? 'operational' : 'maintenance'}`}>
            <span className="status-dot"></span>
            <strong>
              {settings?.isOperational ? '✅ System Operational' : '🔴 Maintenance Mode Active'}
            </strong>
          </div>
          <p>
            {settings?.isOperational 
              ? 'All users can access the system' 
              : 'Only administrators can access the system'}
          </p>
          {!settings?.isOperational && settings?.currentMaintenanceStart && (
            <p className="maintenance-since">
              Active since: {new Date(settings.currentMaintenanceStart).toLocaleString('en-IN')}
            </p>
          )}
        </div>

        {showReasonInput && (
          <div className="reason-input-section">
            <label>Reason for Maintenance (optional):</label>
            <textarea
              value={maintenanceReason}
              onChange={(e) => setMaintenanceReason(e.target.value)}
              placeholder="e.g., Database migration, System upgrade, Security patches..."
              rows={3}
            />
          </div>
        )}

        <button
          className={`btn ${settings?.isOperational ? 'btn-danger' : 'btn-success'}`}
          onClick={handleToggleMaintenance}
          disabled={saving}
        >
          {saving ? '⏳ Processing...' : settings?.isOperational ? '🔴 Enable Maintenance Mode' : '✅ Disable Maintenance Mode'}
        </button>

        {showReasonInput && (
          <button
            className="btn btn-secondary"
            onClick={() => {
              setShowReasonInput(false);
              setMaintenanceReason('');
            }}
            style={{ marginLeft: '10px' }}
          >
            Cancel
          </button>
        )}
      </div>

      <div className="maintenance-message-section">
        <h4>Maintenance Message</h4>
        <textarea
          value={settings?.maintenanceMessage || ''}
          onChange={(e) => setSettings({ ...settings!, maintenanceMessage: e.target.value })}
          placeholder="Message shown to users during maintenance"
          rows={2}
        />
        <button
          className="btn btn-primary"
          onClick={() => handleUpdateSettings('maintenanceMessage', settings?.maintenanceMessage)}
          disabled={saving}
        >
          Update Message
        </button>
      </div>

      <div className="maintenance-logs-section">
        <h4>📋 Maintenance History</h4>
        {maintenanceLogs.length === 0 ? (
          <p className="no-logs">No maintenance logs available</p>
        ) : (
          <div className="logs-table-container">
            <table className="logs-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Duration</th>
                  <th>Updated By</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {maintenanceLogs.map((log) => {
                  const startTime = new Date(log.startTime);
                  const endTime = log.endTime ? new Date(log.endTime) : null;
                  const duration = endTime 
                    ? Math.round((endTime.getTime() - startTime.getTime()) / 60000) 
                    : null;

                  return (
                    <tr key={log._id}>
                      <td>
                        <span className={`status-badge ${log.status}`}>
                          {log.status === 'enabled' ? '🔴 Enabled' : '✅ Disabled'}
                        </span>
                      </td>
                      <td>{startTime.toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</td>
                      <td>
                        {endTime 
                          ? endTime.toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })
                          : '—'}
                      </td>
                      <td>{duration ? `${duration} min` : '—'}</td>
                      <td>
                        <div className="user-info">
                          <strong>{log.updatedBy?.name || 'N/A'}</strong>
                          <small>{log.updatedBy?.email || ''}</small>
                        </div>
                      </td>
                      <td>{log.reason || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  const renderEmailTab = () => (
    <div className="settings-section">
      <h3>📧 Email Settings</h3>
      <p className="section-description">Configure SMTP settings for sending email notifications</p>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings?.emailSettings.enabled || false}
            onChange={(e) => setSettings({
              ...settings!,
              emailSettings: { ...settings!.emailSettings, enabled: e.target.checked }
            })}
          />
          Enable Email Notifications
        </label>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>SMTP Host</label>
          <input
            type="text"
            value={settings?.emailSettings.smtpHost || ''}
            onChange={(e) => setSettings({
              ...settings!,
              emailSettings: { ...settings!.emailSettings, smtpHost: e.target.value }
            })}
            placeholder="smtp.gmail.com"
          />
        </div>
        <div className="form-group">
          <label>SMTP Port</label>
          <input
            type="number"
            value={settings?.emailSettings.smtpPort || 587}
            onChange={(e) => setSettings({
              ...settings!,
              emailSettings: { ...settings!.emailSettings, smtpPort: parseInt(e.target.value) }
            })}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>SMTP User</label>
          <input
            type="text"
            value={settings?.emailSettings.smtpUser || ''}
            onChange={(e) => setSettings({
              ...settings!,
              emailSettings: { ...settings!.emailSettings, smtpUser: e.target.value }
            })}
          />
        </div>
        <div className="form-group">
          <label>SMTP Password</label>
          <input
            type="password"
            value={settings?.emailSettings.smtpPassword || ''}
            onChange={(e) => setSettings({
              ...settings!,
              emailSettings: { ...settings!.emailSettings, smtpPassword: e.target.value }
            })}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>From Email</label>
          <input
            type="email"
            value={settings?.emailSettings.fromEmail || ''}
            onChange={(e) => setSettings({
              ...settings!,
              emailSettings: { ...settings!.emailSettings, fromEmail: e.target.value }
            })}
            placeholder="noreply@uthra.com"
          />
        </div>
        <div className="form-group">
          <label>From Name</label>
          <input
            type="text"
            value={settings?.emailSettings.fromName || ''}
            onChange={(e) => setSettings({
              ...settings!,
              emailSettings: { ...settings!.emailSettings, fromName: e.target.value }
            })}
            placeholder="Uthra Platform"
          />
        </div>
      </div>

      <button
        className="btn btn-primary"
        onClick={() => handleUpdateSettings('emailSettings', settings?.emailSettings)}
        disabled={saving}
      >
        {saving ? 'Saving...' : 'Save Email Settings'}
      </button>
    </div>
  );

  const renderSMSTab = () => (
    <div className="settings-section">
      <h3>📱 SMS Settings</h3>
      <p className="section-description">Configure SMS provider for sending notifications</p>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings?.smsSettings.enabled || false}
            onChange={(e) => setSettings({
              ...settings!,
              smsSettings: { ...settings!.smsSettings, enabled: e.target.checked }
            })}
          />
          Enable SMS Notifications
        </label>
      </div>

      <div className="form-group">
        <label>SMS Provider</label>
        <select
          value={settings?.smsSettings.provider || 'twilio'}
          onChange={(e) => setSettings({
            ...settings!,
            smsSettings: { ...settings!.smsSettings, provider: e.target.value }
          })}
        >
          <option value="twilio">Twilio</option>
          <option value="msg91">MSG91</option>
          <option value="textlocal">TextLocal</option>
        </select>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>API Key</label>
          <input
            type="text"
            value={settings?.smsSettings.apiKey || ''}
            onChange={(e) => setSettings({
              ...settings!,
              smsSettings: { ...settings!.smsSettings, apiKey: e.target.value }
            })}
          />
        </div>
        <div className="form-group">
          <label>API Secret</label>
          <input
            type="password"
            value={settings?.smsSettings.apiSecret || ''}
            onChange={(e) => setSettings({
              ...settings!,
              smsSettings: { ...settings!.smsSettings, apiSecret: e.target.value }
            })}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Sender ID</label>
        <input
          type="text"
          value={settings?.smsSettings.senderId || ''}
          onChange={(e) => setSettings({
            ...settings!,
            smsSettings: { ...settings!.smsSettings, senderId: e.target.value }
          })}
          placeholder="UTHRA"
        />
      </div>

      <button
        className="btn btn-primary"
        onClick={() => handleUpdateSettings('smsSettings', settings?.smsSettings)}
        disabled={saving}
      >
        {saving ? 'Saving...' : 'Save SMS Settings'}
      </button>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="settings-section">
      <h3>🔔 Notification Preferences</h3>
      <p className="section-description">Configure notification channels and preferences</p>

      <div className="notification-channels">
        <h4>Notification Channels</h4>
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings?.notificationSettings.emailNotifications || false}
              onChange={(e) => setSettings({
                ...settings!,
                notificationSettings: { ...settings!.notificationSettings, emailNotifications: e.target.checked }
              })}
            />
            Email Notifications
          </label>
        </div>
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings?.notificationSettings.smsNotifications || false}
              onChange={(e) => setSettings({
                ...settings!,
                notificationSettings: { ...settings!.notificationSettings, smsNotifications: e.target.checked }
              })}
            />
            SMS Notifications
          </label>
        </div>
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings?.notificationSettings.pushNotifications || false}
              onChange={(e) => setSettings({
                ...settings!,
                notificationSettings: { ...settings!.notificationSettings, pushNotifications: e.target.checked }
              })}
            />
            Push Notifications
          </label>
        </div>
      </div>

      <div className="notification-events">
        <h4>Admin Notifications</h4>
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings?.notificationSettings.notifyAdminOnNewUser || false}
              onChange={(e) => setSettings({
                ...settings!,
                notificationSettings: { ...settings!.notificationSettings, notifyAdminOnNewUser: e.target.checked }
              })}
            />
            Notify on New User Registration
          </label>
        </div>
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings?.notificationSettings.notifyAdminOnNewRequest || false}
              onChange={(e) => setSettings({
                ...settings!,
                notificationSettings: { ...settings!.notificationSettings, notifyAdminOnNewRequest: e.target.checked }
              })}
            />
            Notify on New Crop Request
          </label>
        </div>
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings?.notificationSettings.notifyAdminOnSystemError || false}
              onChange={(e) => setSettings({
                ...settings!,
                notificationSettings: { ...settings!.notificationSettings, notifyAdminOnSystemError: e.target.checked }
              })}
            />
            Notify on System Errors
          </label>
        </div>
      </div>

      <button
        className="btn btn-primary"
        onClick={() => handleUpdateSettings('notificationSettings', settings?.notificationSettings)}
        disabled={saving}
      >
        {saving ? 'Saving...' : 'Save Notification Settings'}
      </button>
    </div>
  );

  const renderUserManagementTab = () => (
    <div className="settings-section">
      <h3>👥 User Management</h3>
      <p className="section-description">Configure user registration and authentication settings</p>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings?.userSettings.autoVerifyUsers || false}
            onChange={(e) => setSettings({
              ...settings!,
              userSettings: { ...settings!.userSettings, autoVerifyUsers: e.target.checked }
            })}
          />
          Auto-verify New Users
        </label>
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings?.userSettings.requireEmailVerification || false}
            onChange={(e) => setSettings({
              ...settings!,
              userSettings: { ...settings!.userSettings, requireEmailVerification: e.target.checked }
            })}
          />
          Require Email Verification
        </label>
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings?.userSettings.requirePhoneVerification || false}
            onChange={(e) => setSettings({
              ...settings!,
              userSettings: { ...settings!.userSettings, requirePhoneVerification: e.target.checked }
            })}
          />
          Require Phone Verification
        </label>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Max Login Attempts</label>
          <input
            type="number"
            min="3"
            max="10"
            value={settings?.userSettings.maxLoginAttempts || 5}
            onChange={(e) => setSettings({
              ...settings!,
              userSettings: { ...settings!.userSettings, maxLoginAttempts: parseInt(e.target.value) }
            })}
          />
        </div>
        <div className="form-group">
          <label>Lockout Duration (minutes)</label>
          <input
            type="number"
            min="5"
            max="120"
            value={settings?.userSettings.lockoutDuration || 30}
            onChange={(e) => setSettings({
              ...settings!,
              userSettings: { ...settings!.userSettings, lockoutDuration: parseInt(e.target.value) }
            })}
          />
        </div>
      </div>

      <button
        className="btn btn-primary"
        onClick={() => handleUpdateSettings('userSettings', settings?.userSettings)}
        disabled={saving}
      >
        {saving ? 'Saving...' : 'Save User Settings'}
      </button>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="settings-section">
      <h3>🔒 Security Settings</h3>
      <p className="section-description">Configure password policies and security features</p>

      <div className="form-group">
        <label>Minimum Password Length</label>
        <input
          type="number"
          min="6"
          max="20"
          value={settings?.securitySettings.passwordMinLength || 6}
          onChange={(e) => setSettings({
            ...settings!,
            securitySettings: { ...settings!.securitySettings, passwordMinLength: parseInt(e.target.value) }
          })}
        />
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings?.securitySettings.passwordRequireUppercase || false}
            onChange={(e) => setSettings({
              ...settings!,
              securitySettings: { ...settings!.securitySettings, passwordRequireUppercase: e.target.checked }
            })}
          />
          Require Uppercase Letters
        </label>
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings?.securitySettings.passwordRequireNumbers || false}
            onChange={(e) => setSettings({
              ...settings!,
              securitySettings: { ...settings!.securitySettings, passwordRequireNumbers: e.target.checked }
            })}
          />
          Require Numbers
        </label>
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings?.securitySettings.passwordRequireSpecialChars || false}
            onChange={(e) => setSettings({
              ...settings!,
              securitySettings: { ...settings!.securitySettings, passwordRequireSpecialChars: e.target.checked }
            })}
          />
          Require Special Characters
        </label>
      </div>

      <div className="form-group">
        <label>Password Expiry (days, 0 = never)</label>
        <input
          type="number"
          min="0"
          max="365"
          value={settings?.securitySettings.passwordExpiryDays || 0}
          onChange={(e) => setSettings({
            ...settings!,
            securitySettings: { ...settings!.securitySettings, passwordExpiryDays: parseInt(e.target.value) }
          })}
        />
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings?.securitySettings.enableTwoFactor || false}
            onChange={(e) => setSettings({
              ...settings!,
              securitySettings: { ...settings!.securitySettings, enableTwoFactor: e.target.checked }
            })}
          />
          Enable Two-Factor Authentication
        </label>
      </div>

      <button
        className="btn btn-primary"
        onClick={() => handleUpdateSettings('securitySettings', settings?.securitySettings)}
        disabled={saving}
      >
        {saving ? 'Saving...' : 'Save Security Settings'}
      </button>
    </div>
  );

  const renderSessionTab = () => (
    <div className="settings-section">
      <h3>⏱️ Session Settings</h3>
      <p className="section-description">Configure session timeout and management</p>

      <div className="form-row">
        <div className="form-group">
          <label>Session Timeout (minutes)</label>
          <input
            type="number"
            min="15"
            max="480"
            value={settings?.sessionSettings.sessionTimeout || 60}
            onChange={(e) => setSettings({
              ...settings!,
              sessionSettings: { ...settings!.sessionSettings, sessionTimeout: parseInt(e.target.value) }
            })}
          />
        </div>
        <div className="form-group">
          <label>Max Concurrent Sessions</label>
          <input
            type="number"
            min="1"
            max="10"
            value={settings?.sessionSettings.maxConcurrentSessions || 3}
            onChange={(e) => setSettings({
              ...settings!,
              sessionSettings: { ...settings!.sessionSettings, maxConcurrentSessions: parseInt(e.target.value) }
            })}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Remember Me Duration (days)</label>
        <input
          type="number"
          min="1"
          max="90"
          value={settings?.sessionSettings.rememberMeDuration || 30}
          onChange={(e) => setSettings({
            ...settings!,
            sessionSettings: { ...settings!.sessionSettings, rememberMeDuration: parseInt(e.target.value) }
          })}
        />
      </div>

      <button
        className="btn btn-primary"
        onClick={() => handleUpdateSettings('sessionSettings', settings?.sessionSettings)}
        disabled={saving}
      >
        {saving ? 'Saving...' : 'Save Session Settings'}
      </button>
    </div>
  );

  const renderBackupTab = () => (
    <div className="settings-section">
      <h3>💾 Backup Settings</h3>
      <p className="section-description">Configure automatic database backups</p>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings?.backupSettings.autoBackup || false}
            onChange={(e) => setSettings({
              ...settings!,
              backupSettings: { ...settings!.backupSettings, autoBackup: e.target.checked }
            })}
          />
          Enable Automatic Backups
        </label>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Backup Frequency</label>
          <select
            value={settings?.backupSettings.backupFrequency || 'weekly'}
            onChange={(e) => setSettings({
              ...settings!,
              backupSettings: { ...settings!.backupSettings, backupFrequency: e.target.value }
            })}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <div className="form-group">
          <label>Backup Time (HH:MM)</label>
          <input
            type="time"
            value={settings?.backupSettings.backupTime || '02:00'}
            onChange={(e) => setSettings({
              ...settings!,
              backupSettings: { ...settings!.backupSettings, backupTime: e.target.value }
            })}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Retention Period (days)</label>
        <input
          type="number"
          min="7"
          max="365"
          value={settings?.backupSettings.retentionDays || 30}
          onChange={(e) => setSettings({
            ...settings!,
            backupSettings: { ...settings!.backupSettings, retentionDays: parseInt(e.target.value) }
          })}
        />
      </div>

      <button
        className="btn btn-primary"
        onClick={() => handleUpdateSettings('backupSettings', settings?.backupSettings)}
        disabled={saving}
      >
        {saving ? 'Saving...' : 'Save Backup Settings'}
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="settings-container">
        <div className="loading">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h2>⚙️ System Settings</h2>
        <p>Configure and manage system-wide settings</p>
      </div>

      {alert && (
        <div className={`alert alert-${alert.type}`}>
          {alert.message}
          <button className="close-alert" onClick={() => setAlert(null)}>×</button>
        </div>
      )}

      <div className="settings-tabs">
        <button
          className={`tab ${activeTab === 'maintenance' ? 'active' : ''}`}
          onClick={() => setActiveTab('maintenance')}
        >
          🔧 Maintenance
        </button>
        <button
          className={`tab ${activeTab === 'email' ? 'active' : ''}`}
          onClick={() => setActiveTab('email')}
        >
          📧 Email
        </button>
        <button
          className={`tab ${activeTab === 'sms' ? 'active' : ''}`}
          onClick={() => setActiveTab('sms')}
        >
          📱 SMS
        </button>
        <button
          className={`tab ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          🔔 Notifications
        </button>
        <button
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Users
        </button>
        <button
          className={`tab ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          🔒 Security
        </button>
        <button
          className={`tab ${activeTab === 'session' ? 'active' : ''}`}
          onClick={() => setActiveTab('session')}
        >
          ⏱️ Session
        </button>
        <button
          className={`tab ${activeTab === 'backup' ? 'active' : ''}`}
          onClick={() => setActiveTab('backup')}
        >
          💾 Backup
        </button>
      </div>

      <div className="settings-content">
        {activeTab === 'maintenance' && renderMaintenanceTab()}
        {activeTab === 'email' && renderEmailTab()}
        {activeTab === 'sms' && renderSMSTab()}
        {activeTab === 'notifications' && renderNotificationsTab()}
        {activeTab === 'users' && renderUserManagementTab()}
        {activeTab === 'security' && renderSecurityTab()}
        {activeTab === 'session' && renderSessionTab()}
        {activeTab === 'backup' && renderBackupTab()}
      </div>
    </div>
  );
};

export default Settings;
