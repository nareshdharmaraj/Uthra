import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import api from '../../services/api';
import './Settings.css';

const Settings: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  const [activeTab, setActiveTab] = useState('notifications');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Notification settings
  const [notificationPrefs, setNotificationPrefs] = useState({
    emailNotifications: true,
    smsNotifications: true,
    ivrCalls: false,
    newCropAlerts: true,
    priceChangeAlerts: true,
    requestUpdates: true,
    promotionalMessages: false
  });

  // Account settings
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showContactInfo: true,
    allowFarmerContact: true,
    dataSharing: false
  });

  // Language settings
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    fetchUserSettings();
  }, []);

  const fetchUserSettings = async () => {
    try {
      const response = await api.get('/buyers/settings');
      if (response.data.success) {
        const settings = response.data.data;
        if (settings.notifications) setNotificationPrefs(settings.notifications);
        if (settings.privacy) setPrivacySettings(settings.privacy);
        if (settings.language) setLanguage(settings.language);
      }
    } catch (error) {
      // Settings might not exist yet, using defaults
      console.log('Using default settings');
    }
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotificationPrefs(prev => ({ ...prev, [key]: value }));
  };

  const handlePrivacyChange = (key: string, value: any) => {
    setPrivacySettings(prev => ({ ...prev, [key]: value }));
  };

  const saveNotificationSettings = async () => {
    try {
      await api.put('/buyers/settings/notifications', notificationPrefs);
      setSuccessMessage('Notification settings saved successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Failed to save settings');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMessage('New passwords do not match');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    try {
      await api.put('/buyers/settings/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setSuccessMessage('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Failed to change password');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const savePrivacySettings = async () => {
    try {
      await api.put('/buyers/settings/privacy', privacySettings);
      setSuccessMessage('Privacy settings saved successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Failed to save settings');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const saveLanguageSettings = async () => {
    try {
      await api.put('/buyers/settings/language', { language });
      setSuccessMessage('Language preference saved successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Failed to save settings');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const exportData = async () => {
    try {
      const response = await api.get('/buyers/settings/export-data', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `buyer-data-${Date.now()}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setSuccessMessage('Data exported successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Failed to export data');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const deleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      const confirmText = prompt('Type "DELETE" to confirm account deletion:');
      if (confirmText === 'DELETE') {
        try {
          await api.delete('/buyers/settings/delete-account');
          setSuccessMessage('Account deletion request submitted');
          // Logout after 2 seconds
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        } catch (error: any) {
          setErrorMessage(error.response?.data?.message || 'Failed to delete account');
          setTimeout(() => setErrorMessage(''), 3000);
        }
      }
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h2>Settings</h2>
      </div>

      {successMessage && (
        <div className="alert alert-success">
          {successMessage}
          <button onClick={() => setSuccessMessage('')}>×</button>
        </div>
      )}

      {errorMessage && (
        <div className="alert alert-error">
          {errorMessage}
          <button onClick={() => setErrorMessage('')}>×</button>
        </div>
      )}

      <div className="settings-container">
        <div className="settings-tabs">
          <button
            className={activeTab === 'notifications' ? 'active' : ''}
            onClick={() => setActiveTab('notifications')}
          >
            🔔 Notifications
          </button>
          <button
            className={activeTab === 'account' ? 'active' : ''}
            onClick={() => setActiveTab('account')}
          >
            👤 Account
          </button>
          <button
            className={activeTab === 'privacy' ? 'active' : ''}
            onClick={() => setActiveTab('privacy')}
          >
            🔒 Privacy
          </button>
          <button
            className={activeTab === 'language' ? 'active' : ''}
            onClick={() => setActiveTab('language')}
          >
            🌐 Language
          </button>
          <button
            className={activeTab === 'data' ? 'active' : ''}
            onClick={() => setActiveTab('data')}
          >
            📦 Data & Account
          </button>
        </div>

        <div className="settings-content">
          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h3>Notification Preferences</h3>
              <p className="section-desc">Manage how you receive notifications</p>

              <div className="settings-group">
                <h4>Communication Channels</h4>
                <div className="setting-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={notificationPrefs.emailNotifications}
                      onChange={(e) => handleNotificationChange('emailNotifications', e.target.checked)}
                    />
                    <div>
                      <strong>Email Notifications</strong>
                      <span>Receive updates via email</span>
                    </div>
                  </label>
                </div>
                <div className="setting-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={notificationPrefs.smsNotifications}
                      onChange={(e) => handleNotificationChange('smsNotifications', e.target.checked)}
                    />
                    <div>
                      <strong>SMS Notifications</strong>
                      <span>Receive important updates via SMS</span>
                    </div>
                  </label>
                </div>
                <div className="setting-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={notificationPrefs.ivrCalls}
                      onChange={(e) => handleNotificationChange('ivrCalls', e.target.checked)}
                    />
                    <div>
                      <strong>IVR Calls</strong>
                      <span>Receive automated voice calls</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="settings-group">
                <h4>Alert Types</h4>
                <div className="setting-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={notificationPrefs.newCropAlerts}
                      onChange={(e) => handleNotificationChange('newCropAlerts', e.target.checked)}
                    />
                    <div>
                      <strong>New Crop Alerts</strong>
                      <span>Get notified when new crops matching your preferences are available</span>
                    </div>
                  </label>
                </div>
                <div className="setting-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={notificationPrefs.priceChangeAlerts}
                      onChange={(e) => handleNotificationChange('priceChangeAlerts', e.target.checked)}
                    />
                    <div>
                      <strong>Price Change Alerts</strong>
                      <span>Receive alerts when crop prices change significantly</span>
                    </div>
                  </label>
                </div>
                <div className="setting-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={notificationPrefs.requestUpdates}
                      onChange={(e) => handleNotificationChange('requestUpdates', e.target.checked)}
                    />
                    <div>
                      <strong>Request Updates</strong>
                      <span>Get notified about status changes in your requests</span>
                    </div>
                  </label>
                </div>
                <div className="setting-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={notificationPrefs.promotionalMessages}
                      onChange={(e) => handleNotificationChange('promotionalMessages', e.target.checked)}
                    />
                    <div>
                      <strong>Promotional Messages</strong>
                      <span>Receive offers and promotional content</span>
                    </div>
                  </label>
                </div>
              </div>

              <button className="btn-save" onClick={saveNotificationSettings}>
                Save Notification Settings
              </button>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="settings-section">
              <h3>Account Settings</h3>
              <p className="section-desc">Manage your account credentials</p>

              <div className="settings-group">
                <h4>Account Information</h4>
                <div className="info-item">
                  <strong>Name:</strong> {user?.name}
                </div>
                <div className="info-item">
                  <strong>Mobile:</strong> {user?.mobile}
                </div>
                <div className="info-item">
                  <strong>Email:</strong> {user?.email || 'Not provided'}
                </div>
                <div className="info-item">
                  <strong>Role:</strong> Buyer
                </div>
              </div>

              <div className="settings-group">
                <h4>Change Password</h4>
                <form onSubmit={changePassword} className="password-form">
                  <div className="form-group">
                    <label>Current Password</label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                  <button type="submit" className="btn-save">
                    Change Password
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="settings-section">
              <h3>Privacy Settings</h3>
              <p className="section-desc">Control your privacy and visibility</p>

              <div className="settings-group">
                <h4>Profile Visibility</h4>
                <div className="setting-item">
                  <label>
                    <strong>Who can see your profile?</strong>
                    <select
                      value={privacySettings.profileVisibility}
                      onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                    >
                      <option value="public">Public (All farmers)</option>
                      <option value="verified">Verified Farmers Only</option>
                      <option value="private">Private</option>
                    </select>
                  </label>
                </div>
              </div>

              <div className="settings-group">
                <h4>Contact & Communication</h4>
                <div className="setting-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={privacySettings.showContactInfo}
                      onChange={(e) => handlePrivacyChange('showContactInfo', e.target.checked)}
                    />
                    <div>
                      <strong>Show Contact Information</strong>
                      <span>Display your mobile number to farmers</span>
                    </div>
                  </label>
                </div>
                <div className="setting-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={privacySettings.allowFarmerContact}
                      onChange={(e) => handlePrivacyChange('allowFarmerContact', e.target.checked)}
                    />
                    <div>
                      <strong>Allow Farmer Contact</strong>
                      <span>Allow farmers to send you direct messages</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="settings-group">
                <h4>Data Sharing</h4>
                <div className="setting-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={privacySettings.dataSharing}
                      onChange={(e) => handlePrivacyChange('dataSharing', e.target.checked)}
                    />
                    <div>
                      <strong>Share Anonymous Data</strong>
                      <span>Help improve the platform by sharing anonymous usage data</span>
                    </div>
                  </label>
                </div>
              </div>

              <button className="btn-save" onClick={savePrivacySettings}>
                Save Privacy Settings
              </button>
            </div>
          )}

          {activeTab === 'language' && (
            <div className="settings-section">
              <h3>Language & Region</h3>
              <p className="section-desc">Choose your preferred language</p>

              <div className="settings-group">
                <h4>Display Language</h4>
                <div className="setting-item">
                  <label>
                    <strong>Select Language</strong>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                    >
                      <option value="en">English</option>
                      <option value="hi">हिन्दी (Hindi)</option>
                      <option value="ta">தமிழ் (Tamil)</option>
                      <option value="te">తెలుగు (Telugu)</option>
                      <option value="kn">ಕನ್ನಡ (Kannada)</option>
                      <option value="ml">മലയാളം (Malayalam)</option>
                      <option value="mr">मराठी (Marathi)</option>
                      <option value="gu">ગુજરાતી (Gujarati)</option>
                      <option value="bn">বাংলা (Bengali)</option>
                      <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
                    </select>
                  </label>
                </div>
              </div>

              <button className="btn-save" onClick={saveLanguageSettings}>
                Save Language Preference
              </button>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="settings-section">
              <h3>Data & Account Management</h3>
              <p className="section-desc">Manage your data and account</p>

              <div className="settings-group">
                <h4>Export Data</h4>
                <p>Download a copy of your data including profile, requests, and settings.</p>
                <button className="btn-export" onClick={exportData}>
                  📥 Export My Data
                </button>
              </div>

              <div className="settings-group danger-zone">
                <h4>Danger Zone</h4>
                <p>Once you delete your account, there is no going back. Please be certain.</p>
                <button className="btn-delete" onClick={deleteAccount}>
                  🗑️ Delete My Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
