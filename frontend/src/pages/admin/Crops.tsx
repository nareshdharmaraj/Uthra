import React, { useEffect, useState } from 'react';
import { adminService } from '../../services';
import '../../styles/Admin.css';
import { formatQuantity, formatPriceWithUnit } from '../../utils/unitConversion';

interface Crop {
  _id: string;
  name: string;
  variety?: string;
  quantity: { value: number; unit: string };
  availableQuantity: { value: number; unit: string };
  price: { value: number; unit: string };
  category: string;
  description?: string;
  location?: {
    village?: string;
    taluk?: string;
    district?: string;
    state?: string;
    pincode?: string;
  };
  availableFrom: string;
  availableTo?: string;
  harvestDate?: string;
  status: string;
  isVerified: boolean;
  farmer: {
    _id: string;
    name: string;
    mobile: string;
    location?: any;
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

  const fetchCrops = React.useCallback(async () => {
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
  }, [filters]);

  useEffect(() => {
    fetchCrops();
  }, [fetchCrops]);

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
      case 'delete': return `Are you sure you want to delete crop "${selectedCrop?.name || 'this crop'}"? This action cannot be undone.`;
      case 'verify': return `Verify crop "${selectedCrop?.name || 'this crop'}"?`;
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
      <div className="admin-table-container" style={{ overflowX: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Crop Name</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Category</th>
              <th>Farmer</th>
              <th>Status</th>
              <th>Verified</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {crops.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>
                  No crops found
                </td>
              </tr>
            ) : (
              crops.map((crop) => {
                const quantityDisplay = formatQuantity(crop.quantity || crop.availableQuantity);
                const priceDisplay = formatPriceWithUnit(crop.price);
                
                return (
                <tr key={crop._id}>
                  <td>
                    <div>
                      <strong>{crop.name || 'N/A'}</strong>
                      {crop.variety && <div style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>{crop.variety}</div>}
                      {crop.location?.district && <div style={{ fontSize: '0.8rem', color: '#95a5a6' }}>{crop.location.district}</div>}
                    </div>
                  </td>
                  <td>{quantityDisplay}</td>
                  <td>{priceDisplay}</td>
                  <td>
                    <span className="status-badge" style={{ background: '#e3f2fd', color: '#0d47a1' }}>
                      {crop.category}
                    </span>
                  </td>
                  <td>
                    <div>
                      <div style={{ fontWeight: 600 }}>{crop.farmer?.name || 'N/A'}</div>
                      <div style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>
                        {crop.farmer?.mobile || ''}
                      </div>
                    </div>
                  </td>
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
                const quantityDisplay = formatQuantity(selectedCrop.quantity || selectedCrop.availableQuantity);
                const priceDisplay = formatPriceWithUnit(selectedCrop.price);
                const location = selectedCrop.location;
                const locationStr = location ? 
                  [location.village, location.taluk, location.district, location.state, location.pincode]
                    .filter(Boolean)
                    .join(', ') || 'Not specified' : 'Not specified';
                
                return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <strong>Crop Name:</strong> {selectedCrop.name || 'N/A'}
                  </div>
                  <div>
                    <strong>Variety:</strong> {selectedCrop.variety || 'N/A'}
                  </div>
                  <div>
                    <strong>Quantity:</strong> {quantityDisplay}
                  </div>
                  <div>
                    <strong>Price:</strong> {priceDisplay}
                  </div>
                  <div>
                    <strong>Original Quantity:</strong> {selectedCrop.quantity?.value || 0} {selectedCrop.quantity?.unit || 'kg'}
                  </div>
                  <div>
                    <strong>Category:</strong> {selectedCrop.category}
                  </div>
                  <div>
                    <strong>Description:</strong> {selectedCrop.description || 'No description'}
                  </div>
                  <div>
                    <strong>Location:</strong> {locationStr}
                  </div>
                  <div>
                    <strong>Farmer:</strong> {selectedCrop.farmer?.name || 'N/A'} ({selectedCrop.farmer?.mobile || 'N/A'})
                  </div>
                  <div>
                    <strong>Available From:</strong> {selectedCrop.availableFrom ? new Date(selectedCrop.availableFrom).toLocaleDateString('en-IN') : 'N/A'}
                  </div>
                  {selectedCrop.availableTo && (
                    <div>
                      <strong>Available To:</strong> {new Date(selectedCrop.availableTo).toLocaleDateString('en-IN')}
                    </div>
                  )}
                  {selectedCrop.harvestDate && (
                    <div>
                      <strong>Harvest Date:</strong> {new Date(selectedCrop.harvestDate).toLocaleDateString('en-IN')}
                    </div>
                  )}
                  <div>
                    <strong>Status:</strong> {selectedCrop.status}
                  </div>
                  <div>
                    <strong>Verified:</strong> {selectedCrop.isVerified ? 'Yes' : 'No'}
                  </div>
                  <div>
                    <strong>Added:</strong> {new Date(selectedCrop.createdAt).toLocaleString('en-IN')}
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
