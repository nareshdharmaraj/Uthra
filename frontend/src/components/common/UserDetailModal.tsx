import React, { useEffect, useState } from 'react';
import { adminService } from '../../services';
import '../../styles/Admin.css';

interface UserDetailModalProps {
  userId: string;
  userType: 'farmer' | 'buyer' | 'admin';
  onClose: () => void;
  onUpdate?: () => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ userId, userType, onClose, onUpdate }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUserDetails();
    // eslint-disable-next-line
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await adminService.getUserDetails(userId);
      setUser(response.data);
      setError('');
    } catch (error: any) {
      console.error('Error fetching user details:', error);
      setError(error.response?.data?.message || 'Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    try {
      setActionLoading(true);
      await adminService.verifyUser(userId);
      await fetchUserDetails();
      if (onUpdate) onUpdate();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to verify user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async () => {
    try {
      setActionLoading(true);
      if (user.isActive) {
        await adminService.deactivateUser(userId);
      } else {
        await adminService.activateUser(userId);
      }
      await fetchUserDetails();
      if (onUpdate) onUpdate();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update user status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    try {
      setActionLoading(true);
      await adminService.deleteUser(userId);
      if (onUpdate) onUpdate();
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete user');
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
          <div className="loading-spinner" style={{ minHeight: '300px' }}>Loading user details...</div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="error-message">{error || 'User not found'}</div>
          <button className="modal-btn cancel" onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>User Details - {user.name}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body user-detail-modal">
          {/* Basic Information */}
          <div className="detail-section">
            <h3>Basic Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <strong>Name:</strong> {user.name}
              </div>
              <div className="detail-item">
                <strong>Email:</strong> {user.email || 'N/A'}
              </div>
              <div className="detail-item">
                <strong>Phone:</strong> {user.phone || user.mobile || 'N/A'}
              </div>
              <div className="detail-item">
                <strong>User Type:</strong> <span className={`status-badge ${userType}`}>{userType}</span>
              </div>
              <div className="detail-item">
                <strong>Status:</strong> <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="detail-item">
                <strong>Verified:</strong> <span className={`status-badge ${user.isVerified ? 'verified' : 'pending'}`}>
                  {user.isVerified ? 'Verified' : 'Not Verified'}
                </span>
              </div>
            </div>
          </div>

          {/* Location Information */}
          {(user.address || user.village || user.district || user.state) && (
            <div className="detail-section">
              <h3>Location</h3>
              <div className="detail-grid">
                {user.address && (
                  <div className="detail-item full-width">
                    <strong>Address:</strong> {user.address}
                  </div>
                )}
                {user.village && (
                  <div className="detail-item">
                    <strong>Village:</strong> {user.village}
                  </div>
                )}
                {user.district && (
                  <div className="detail-item">
                    <strong>District:</strong> {user.district}
                  </div>
                )}
                {user.state && (
                  <div className="detail-item">
                    <strong>State:</strong> {user.state}
                  </div>
                )}
                {user.pincode && (
                  <div className="detail-item">
                    <strong>Pincode:</strong> {user.pincode}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Farmer Specific Information */}
          {userType === 'farmer' && user.roleDetails && (
            <div className="detail-section">
              <h3>Farmer Information</h3>
              <div className="detail-grid">
                {user.roleDetails.farmSize && (
                  <div className="detail-item">
                    <strong>Farm Size:</strong> {typeof user.roleDetails.farmSize === 'object' ? `${user.roleDetails.farmSize.value} ${user.roleDetails.farmSize.unit}` : user.roleDetails.farmSize}
                  </div>
                )}
                {user.roleDetails.experienceYears && (
                  <div className="detail-item">
                    <strong>Experience:</strong> {user.roleDetails.experienceYears} years
                  </div>
                )}
                {user.roleDetails.crops && user.roleDetails.crops.length > 0 && (
                  <div className="detail-item">
                    <strong>Crops Grown:</strong> {user.roleDetails.crops.join(', ')}
                  </div>
                )}
                {user.roleDetails.preferredLanguage && (
                  <div className="detail-item">
                    <strong>Preferred Language:</strong> {user.roleDetails.preferredLanguage}
                  </div>
                )}
                {user.roleDetails.landDetails && (
                  <div className="detail-item">
                    <strong>Land Details:</strong> {user.roleDetails.landDetails}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Buyer Specific Information */}
          {userType === 'buyer' && user.roleDetails && (
            <div className="detail-section">
              <h3>Buyer Information</h3>
              <div className="detail-grid">
                {user.roleDetails.buyerType && (
                  <div className="detail-item">
                    <strong>Buyer Type:</strong> {user.roleDetails.buyerType}
                  </div>
                )}
                {user.roleDetails.companyName && (
                  <div className="detail-item">
                    <strong>Company:</strong> {user.roleDetails.companyName}
                  </div>
                )}
                {user.roleDetails.businessRegistration && (
                  <div className="detail-item">
                    <strong>Registration:</strong> {user.roleDetails.businessRegistration}
                  </div>
                )}
                {user.roleDetails.interestedCrops && user.roleDetails.interestedCrops.length > 0 && (
                  <div className="detail-item">
                    <strong>Interested Crops:</strong> {user.roleDetails.interestedCrops.join(', ')}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="detail-section">
            <h3>Account Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <strong>Registered:</strong> {new Date(user.createdAt).toLocaleString()}
              </div>
              <div className="detail-item">
                <strong>Last Updated:</strong> {new Date(user.updatedAt).toLocaleString()}
              </div>
              {user.lastLogin && (
                <div className="detail-item">
                  <strong>Last Login:</strong> {new Date(user.lastLogin).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {!user.isVerified && (
              <button 
                className="modal-btn confirm" 
                onClick={handleVerify}
                disabled={actionLoading}
              >
                ✓ Verify User
              </button>
            )}
            <button 
              className={`modal-btn ${user.isActive ? 'warning' : 'confirm'}`}
              onClick={handleToggleActive}
              disabled={actionLoading}
            >
              {user.isActive ? '⏸ Deactivate' : '▶ Activate'}
            </button>
            <button 
              className="modal-btn danger" 
              onClick={handleDelete}
              disabled={actionLoading}
            >
              🗑️ Delete
            </button>
            <button 
              className="modal-btn cancel" 
              onClick={onClose}
              style={{ marginLeft: 'auto' }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;
