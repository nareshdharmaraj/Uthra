import React, { useEffect, useState } from 'react';
import { adminService } from '../../services';
import UserDetailModal from '../../components/common/UserDetailModal';
import PasswordChangeModal from '../../components/common/PasswordChangeModal';
import CounterCard from '../../components/common/CounterCard';
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
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserType, setSelectedUserType] = useState<'farmer' | 'buyer' | 'admin'>('farmer');
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUserName, setSelectedUserName] = useState('');

  const fetchUsers = React.useCallback(async () => {
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
  }, [filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const openModal = (user: User) => {
    setSelectedUserId(user._id);
    setSelectedUserType(user.role as 'farmer' | 'buyer' | 'admin');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUserId(null);
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
        <CounterCard icon="👥" title="Total Users" value={users.length} />
        <CounterCard icon="✅" title="Active Users" value={users.filter(u => u.isActive).length} />
        <CounterCard icon="🔒" title="Verified Users" value={users.filter(u => u.isVerified).length} />
        <CounterCard icon="🌾" title="Farmers" value={users.filter(u => u.role === 'farmer').length} />
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
                        onClick={() => openModal(user)}
                      >
                        View Details
                      </button>
                      <button 
                        className="table-btn edit"
                        onClick={() => {
                          setSelectedUserId(user._id);
                          setSelectedUserName(user.name);
                          setShowPasswordModal(true);
                        }}
                        style={{ marginLeft: '0.5rem' }}
                      >
                        🔑 Password
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* User Detail Modal */}
      {showModal && selectedUserId && (
        <UserDetailModal
          userId={selectedUserId}
          userType={selectedUserType}
          onClose={closeModal}
          onUpdate={fetchUsers}
        />
      )}

      {/* Password Change Modal */}
      {showPasswordModal && selectedUserId && (
        <PasswordChangeModal
          userId={selectedUserId}
          userName={selectedUserName}
          onClose={() => {
            setShowPasswordModal(false);
            setSelectedUserId(null);
            setSelectedUserName('');
          }}
          onSuccess={() => {
            alert('Password changed successfully');
            fetchUsers();
          }}
        />
      )}
    </div>
  );
};

export default Users;
