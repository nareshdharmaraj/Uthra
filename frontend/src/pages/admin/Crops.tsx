import React, { useEffect, useState } from 'react';
import { adminService } from '../../services';
import '../../styles/Admin.css';

interface Crop {
  _id: string;
  cropType: string;
  variety?: string;
  quantity: number | { value: number; unit: string };
  unit?: string;
  pricePerUnit: number | { value: number; unit: string };
  category: string;
  description?: string;
  location: string;
  district: string;
  taluk: string;
  availableDate: string;
  harvestDate?: string;
  status: string;
  isVerified: boolean;
  farmer: {
    _id: string;
    name: string;
    phone: string;
  };
  createdAt: string;
}

const Crops: React.FC = () => {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: ''
  });
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState<'view' | 'delete' | 'verify'>('view');

  useEffect(() => {
    fetchCrops();
  }, [filters]);

  const fetchCrops = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filters.status) params.status = filters.status;
      
      const response = await adminService.getAllCrops(params);
      setCrops(response.data || []);
    } catch (error: any) {
      console.error('Error fetching crops:', error);
      setError(error.response?.data?.message || 'Failed to load crops');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const openModal = (crop: Crop, action: typeof modalAction) => {
    setSelectedCrop(crop);
    setModalAction(action);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCrop(null);
  };

  const handleAction = async () => {
    if (!selectedCrop) return;

    try {
      let response;
      switch (modalAction) {
        case 'delete':
          response = await adminService.deleteCrop(selectedCrop._id);
          break;
        case 'verify':
          response = await adminService.verifyCrop(selectedCrop._id);
          break;
        default:
          return;
      }
      
      alert(response.message || 'Action completed successfully');
      closeModal();
      fetchCrops();
    } catch (error: any) {
      console.error('Error performing action:', error);
      alert(error.response?.data?.message || 'Failed to perform action');
    }
  };

  const getActionButtonText = () => {
    switch (modalAction) {
      case 'delete': return 'Delete Crop';
      case 'verify': return 'Verify Crop';
      default: return 'OK';
    }
  };

  const getActionMessage = () => {
    switch (modalAction) {
      case 'delete': return `Are you sure you want to delete crop "${selectedCrop?.cropType}"? This action cannot be undone.`;
      case 'verify': return `Verify crop "${selectedCrop?.cropType}"?`;
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="admin-home">
        <div className="loading-spinner">Loading crops...</div>
      </div>
    );
  }

  return (
    <div className="admin-home">
      <div className="admin-header">
        <h1>Crop Management</h1>
        <p>Manage all crops listed by farmers</p>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-grid">
          <div className="filter-group">
            <label>Status</label>
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="sold_out">Sold Out</option>
              <option value="removed">Removed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-icon">🌾</div>
          <div className="stat-content">
            <h3>Total Crops</h3>
            <p className="stat-number">{crops.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Active Crops</h3>
            <p className="stat-number">{crops.filter(c => c.status === 'active').length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔒</div>
          <div className="stat-content">
            <h3>Verified Crops</h3>
            <p className="stat-number">{crops.filter(c => c.isVerified).length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>Sold Out</h3>
            <p className="stat-number">{crops.filter(c => c.status === 'sold_out').length}</p>
          </div>
        </div>
      </div>

      {/* Crops Table */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Crop Type</th>
              <th>Variety</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Category</th>
              <th>Farmer</th>
              <th>District</th>
              <th>Status</th>
              <th>Verified</th>
              <th>Added</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {crops.length === 0 ? (
              <tr>
                <td colSpan={11} style={{ textAlign: 'center', padding: '2rem' }}>
                  No crops found
                </td>
              </tr>
            ) : (
              crops.map((crop) => {
                const quantity = typeof crop.quantity === 'object' ? crop.quantity.value : crop.quantity;
                const unit = typeof crop.quantity === 'object' ? crop.quantity.unit : crop.unit;
                const price = typeof crop.pricePerUnit === 'object' ? crop.pricePerUnit.value : crop.pricePerUnit;
                
                return (
                <tr key={crop._id}>
                  <td><strong>{crop.cropType}</strong></td>
                  <td>{crop.variety || 'N/A'}</td>
                  <td>{quantity} {unit}</td>
                  <td>₹{price}/{unit}</td>
                  <td>
                    <span className="status-badge" style={{ background: '#e3f2fd', color: '#0d47a1' }}>
                      {crop.category}
                    </span>
                  </td>
                  <td>
                    <div>
                      <div style={{ fontWeight: 600 }}>{crop.farmer?.name || 'N/A'}</div>
                      <div style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>
                        {crop.farmer?.phone || ''}
                      </div>
                    </div>
                  </td>
                  <td>{crop.district}</td>
                  <td>
                    <span className={`status-badge ${
                      crop.status === 'active' ? 'active' :
                      crop.status === 'sold_out' ? 'completed' : 'inactive'
                    }`}>
                      {crop.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${crop.isVerified ? 'verified' : 'pending'}`}>
                      {crop.isVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </td>
                  <td>{new Date(crop.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="table-actions">
                      <button 
                        className="table-btn view" 
                        onClick={() => openModal(crop, 'view')}
                      >
                        View
                      </button>
                      {!crop.isVerified && (
                        <button 
                          className="table-btn verify" 
                          onClick={() => openModal(crop, 'verify')}
                        >
                          Verify
                        </button>
                      )}
                      <button 
                        className="table-btn delete" 
                        onClick={() => openModal(crop, 'delete')}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && selectedCrop && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modalAction === 'view' ? 'Crop Details' : 'Confirm Action'}</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              {modalAction === 'view' ? (() => {
                const quantity = typeof selectedCrop.quantity === 'object' ? selectedCrop.quantity.value : selectedCrop.quantity;
                const unit = typeof selectedCrop.quantity === 'object' ? selectedCrop.quantity.unit : selectedCrop.unit;
                const price = typeof selectedCrop.pricePerUnit === 'object' ? selectedCrop.pricePerUnit.value : selectedCrop.pricePerUnit;
                const totalValue = quantity * price;
                
                return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <strong>Crop Type:</strong> {selectedCrop.cropType}
                  </div>
                  <div>
                    <strong>Variety:</strong> {selectedCrop.variety || 'N/A'}
                  </div>
                  <div>
                    <strong>Quantity:</strong> {quantity} {unit}
                  </div>
                  <div>
                    <strong>Price:</strong> ₹{price}/{unit}
                  </div>
                  <div>
                    <strong>Total Value:</strong> ₹{totalValue.toLocaleString()}
                  </div>
                  <div>
                    <strong>Category:</strong> {selectedCrop.category}
                  </div>
                  <div>
                    <strong>Description:</strong> {selectedCrop.description || 'No description'}
                  </div>
                  <div>
                    <strong>Location:</strong> {selectedCrop.location}, {selectedCrop.taluk}, {selectedCrop.district}
                  </div>
                  <div>
                    <strong>Farmer:</strong> {selectedCrop.farmer?.name} ({selectedCrop.farmer?.phone})
                  </div>
                  <div>
                    <strong>Available Date:</strong> {new Date(selectedCrop.availableDate).toLocaleDateString()}
                  </div>
                  {selectedCrop.harvestDate && (
                    <div>
                      <strong>Harvest Date:</strong> {new Date(selectedCrop.harvestDate).toLocaleDateString()}
                    </div>
                  )}
                  <div>
                    <strong>Status:</strong> {selectedCrop.status}
                  </div>
                  <div>
                    <strong>Verified:</strong> {selectedCrop.isVerified ? 'Yes' : 'No'}
                  </div>
                  <div>
                    <strong>Added:</strong> {new Date(selectedCrop.createdAt).toLocaleString()}
                  </div>
                </div>
                );
              })() : (
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

export default Crops;
