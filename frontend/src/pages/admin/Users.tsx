import React, { useEffect, useState } from 'react';
import { adminService } from '../../services';
import '../../styles/Admin.css';

interface User {
  _id: string;
  name: string;
  phone: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  district?: string;
  createdAt: string;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    isActive: ''
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState<'view' | 'delete' | 'verify' | 'activate' | 'deactivate'>('view');

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filters.role) params.role = filters.role;
      if (filters.isActive !== '') params.isActive = filters.isActive === 'true';
      
      const response = await adminService.getAllUsers(params);
      setUsers(response.data || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setError(error.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const openModal = (user: User, action: typeof modalAction) => {
    setSelectedUser(user);
    setModalAction(action);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const handleAction = async () => {
    if (!selectedUser) return;

    try {
      let response;
      switch (modalAction) {
        case 'delete':
          response = await adminService.deleteUser(selectedUser._id);
          break;
        case 'verify':
          response = await adminService.verifyUser(selectedUser._id);
          break;
        case 'activate':
          response = await adminService.activateUser(selectedUser._id);
          break;
        case 'deactivate':
          response = await adminService.deactivateUser(selectedUser._id);
          break;
        default:
          return;
      }
      
      alert(response.message || 'Action completed successfully');
      closeModal();
      fetchUsers();
    } catch (error: any) {
      console.error('Error performing action:', error);
      alert(error.response?.data?.message || 'Failed to perform action');
    }
  };

  const getActionButtonText = () => {
    switch (modalAction) {
      case 'delete': return 'Delete User';
      case 'verify': return 'Verify User';
      case 'activate': return 'Activate User';
      case 'deactivate': return 'Deactivate User';
      default: return 'OK';
    }
  };

  const getActionMessage = () => {
    switch (modalAction) {
      case 'delete': return `Are you sure you want to delete user "${selectedUser?.name}"? This action cannot be undone.`;
      case 'verify': return `Verify user "${selectedUser?.name}"?`;
      case 'activate': return `Activate user "${selectedUser?.name}"?`;
      case 'deactivate': return `Deactivate user "${selectedUser?.name}"?`;
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="admin-home">
        <div className="loading-spinner">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="admin-home">
      <div className="admin-header">
        <h1>User Management</h1>
        <p>Manage all platform users - Farmers, Buyers, and Admins</p>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-grid">
          <div className="filter-group">
            <label>Role</label>
            <select name="role" value={filters.role} onChange={handleFilterChange}>
              <option value="">All Roles</option>
              <option value="farmer">Farmer</option>
              <option value="buyer">Buyer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Status</label>
            <select name="isActive" value={filters.isActive} onChange={handleFilterChange}>
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Total Users</h3>
            <p className="stat-number">{users.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Active Users</h3>
            <p className="stat-number">{users.filter(u => u.isActive).length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔒</div>
          <div className="stat-content">
            <h3>Verified Users</h3>
            <p className="stat-number">{users.filter(u => u.isVerified).length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🌾</div>
          <div className="stat-content">
            <h3>Farmers</h3>
            <p className="stat-number">{users.filter(u => u.role === 'farmer').length}</p>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Role</th>
              <th>District</th>
              <th>Status</th>
              <th>Verified</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.phone}</td>
                  <td>
                    <span className="status-badge" style={{ 
                      background: user.role === 'farmer' ? '#d4edda' : 
                                 user.role === 'buyer' ? '#d1ecf1' : '#f8d7da',
                      color: user.role === 'farmer' ? '#155724' : 
                             user.role === 'buyer' ? '#0c5460' : '#721c24'
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td>{user.district || 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${user.isVerified ? 'verified' : 'pending'}`}>
                      {user.isVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="table-actions">
                      <button 
                        className="table-btn view" 
                        onClick={() => openModal(user, 'view')}
                      >
                        View
                      </button>
                      {!user.isVerified && (
                        <button 
                          className="table-btn verify" 
                          onClick={() => openModal(user, 'verify')}
                        >
                          Verify
                        </button>
                      )}
                      {user.isActive ? (
                        <button 
                          className="table-btn edit" 
                          onClick={() => openModal(user, 'deactivate')}
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button 
                          className="table-btn verify" 
                          onClick={() => openModal(user, 'activate')}
                        >
                          Activate
                        </button>
                      )}
                      <button 
                        className="table-btn delete" 
                        onClick={() => openModal(user, 'delete')}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && selectedUser && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modalAction === 'view' ? 'User Details' : 'Confirm Action'}</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              {modalAction === 'view' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <strong>Name:</strong> {selectedUser.name}
                  </div>
                  <div>
                    <strong>Phone:</strong> {selectedUser.phone}
                  </div>
                  <div>
                    <strong>Role:</strong> {selectedUser.role}
                  </div>
                  <div>
                    <strong>District:</strong> {selectedUser.district || 'N/A'}
                  </div>
                  <div>
                    <strong>Status:</strong> {selectedUser.isActive ? 'Active' : 'Inactive'}
                  </div>
                  <div>
                    <strong>Verified:</strong> {selectedUser.isVerified ? 'Yes' : 'No'}
                  </div>
                  <div>
                    <strong>Joined:</strong> {new Date(selectedUser.createdAt).toLocaleString()}
                  </div>
                </div>
              ) : (
                <p>{getActionMessage()}</p>
              )}
            </div>
            <div className="modal-footer">
              <button className="modal-btn cancel" onClick={closeModal}>
                Cancel
              </button>
              {modalAction !== 'view' && (
                <button 
                  className={`modal-btn confirm ${modalAction === 'delete' ? 'danger' : ''}`}
                  onClick={handleAction}
                  style={modalAction === 'delete' ? { background: '#e74c3c' } : {}}
                >
                  {getActionButtonText()}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
