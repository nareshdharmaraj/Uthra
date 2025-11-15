import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import './MyCrops.css';

interface Crop {
  _id: string;
  name: string;
  category: string;
  quantity: {
    value: number;
    unit: string;
  };
  price: {
    value: number;
    unit: string;
  };
  status: string;
  availableFrom: string;
  availableTo: string;
  description?: string;
  organicCertified?: boolean;
  qualityGrade?: string;
  pickupLocation?: {
    district: string;
    state: string;
  };
  createdAt: string;
}

const MyCrops: React.FC = () => {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCrop, setEditingCrop] = useState<Crop | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'vegetables',
    quantity: { value: '', unit: 'kg' },
    price: { value: '', unit: 'per_kg' },
    description: '',
    availableFrom: '',
    availableTo: '',
    organicCertified: false,
    qualityGrade: '',
    pickupLocation: {
      district: '',
      state: ''
    }
  });

  useEffect(() => {
    fetchCrops();
  }, []);

  const fetchCrops = async () => {
    try {
      setLoading(true);
      const response = await api.get('/farmers/crops');
      setCrops(response.data.data || []);
    } catch (error) {
      console.error('Error fetching crops:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cropData = {
        ...formData,
        quantity: {
          value: parseFloat(formData.quantity.value),
          unit: formData.quantity.unit
        },
        price: {
          value: parseFloat(formData.price.value),
          unit: formData.price.unit
        }
      };

      await api.post('/farmers/crops', cropData);
      setShowAddModal(false);
      resetForm();
      fetchCrops();
    } catch (error) {
      console.error('Error adding crop:', error);
      alert('Failed to add crop. Please try again.');
    }
  };

  const handleUpdateCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCrop) return;

    try {
      const cropData = {
        ...formData,
        quantity: {
          value: parseFloat(formData.quantity.value),
          unit: formData.quantity.unit
        },
        price: {
          value: parseFloat(formData.price.value),
          unit: formData.price.unit
        }
      };

      await api.put(`/farmers/crops/${editingCrop._id}`, cropData);
      setEditingCrop(null);
      resetForm();
      fetchCrops();
    } catch (error) {
      console.error('Error updating crop:', error);
      alert('Failed to update crop. Please try again.');
    }
  };

  const handleDeleteCrop = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this crop?')) return;

    try {
      await api.delete(`/farmers/crops/${id}`);
      fetchCrops();
    } catch (error) {
      console.error('Error deleting crop:', error);
      alert('Failed to delete crop. Please try again.');
    }
  };

  const openEditModal = (crop: Crop) => {
    setEditingCrop(crop);
    setFormData({
      name: crop.name,
      category: crop.category,
      quantity: {
        value: crop.quantity.value.toString(),
        unit: crop.quantity.unit
      },
      price: {
        value: crop.price.value.toString(),
        unit: crop.price.unit
      },
      description: crop.description || '',
      availableFrom: crop.availableFrom?.split('T')[0] || '',
      availableTo: crop.availableTo?.split('T')[0] || '',
      organicCertified: crop.organicCertified || false,
      qualityGrade: crop.qualityGrade || '',
      pickupLocation: {
        district: crop.pickupLocation?.district || '',
        state: crop.pickupLocation?.state || ''
      }
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'vegetables',
      quantity: { value: '', unit: 'kg' },
      price: { value: '', unit: 'per_kg' },
      description: '',
      availableFrom: '',
      availableTo: '',
      organicCertified: false,
      qualityGrade: '',
      pickupLocation: {
        district: '',
        state: ''
      }
    });
  };

  const filteredCrops = crops.filter(crop => {
    if (filter === 'all') return true;
    return crop.status === filter;
  });

  const getStatusBadge = (status: string) => {
    const badges: any = {
      active: { text: 'Active', color: '#4CAF50' },
      reserved: { text: 'Reserved', color: '#FF9800' },
      sold: { text: 'Sold', color: '#2196F3' },
      removed: { text: 'Removed', color: '#9E9E9E' }
    };
    const badge = badges[status] || badges.active;
    return <span className="status-badge" style={{ backgroundColor: badge.color }}>{badge.text}</span>;
  };

  return (
    <div className="my-crops">
      <div className="crops-header">
        <div>
          <h1>My Crops 🌾</h1>
          <p>Manage your crop listings and inventory</p>
        </div>
        <button className="btn-add-crop" onClick={() => { resetForm(); setShowAddModal(true); }}>
          ➕ Add New Crop
        </button>
      </div>

      <div className="crops-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({crops.length})
        </button>
        <button 
          className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Active ({crops.filter(c => c.status === 'active').length})
        </button>
        <button 
          className={`filter-btn ${filter === 'reserved' ? 'active' : ''}`}
          onClick={() => setFilter('reserved')}
        >
          Reserved ({crops.filter(c => c.status === 'reserved').length})
        </button>
        <button 
          className={`filter-btn ${filter === 'sold' ? 'active' : ''}`}
          onClick={() => setFilter('sold')}
        >
          Sold ({crops.filter(c => c.status === 'sold').length})
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Loading crops...</div>
      ) : filteredCrops.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🌾</div>
          <h3>No crops found</h3>
          <p>Start by adding your first crop listing</p>
          <button className="btn-primary" onClick={() => { resetForm(); setShowAddModal(true); }}>
            Add Crop
          </button>
        </div>
      ) : (
        <div className="crops-grid">
          {filteredCrops.map((crop) => (
            <div key={crop._id} className="crop-card">
              <div className="crop-card-header">
                <h3>{crop.name}</h3>
                {getStatusBadge(crop.status)}
              </div>
              <div className="crop-card-body">
                <div className="crop-info">
                  <span className="crop-label">Category:</span>
                  <span className="crop-value">{crop.category}</span>
                </div>
                <div className="crop-info">
                  <span className="crop-label">Quantity:</span>
                  <span className="crop-value">{crop.quantity.value} {crop.quantity.unit}</span>
                </div>
                <div className="crop-info">
                  <span className="crop-label">Price:</span>
                  <span className="crop-value">₹{crop.price.value} {crop.price.unit}</span>
                </div>
                {crop.organicCertified && (
                  <div className="organic-badge">🌿 Organic Certified</div>
                )}
                {crop.qualityGrade && (
                  <div className="crop-info">
                    <span className="crop-label">Grade:</span>
                    <span className="crop-value">{crop.qualityGrade}</span>
                  </div>
                )}
                {crop.pickupLocation && (
                  <div className="crop-info">
                    <span className="crop-label">Location:</span>
                    <span className="crop-value">{crop.pickupLocation.district}, {crop.pickupLocation.state}</span>
                  </div>
                )}
                {crop.description && (
                  <p className="crop-description">{crop.description}</p>
                )}
              </div>
              <div className="crop-card-footer">
                <button className="btn-edit" onClick={() => openEditModal(crop)}>
                  ✏️ Edit
                </button>
                <button className="btn-delete" onClick={() => handleDeleteCrop(crop._id)}>
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Crop Modal */}
      {(showAddModal || editingCrop) && (
        <div className="modal-overlay" onClick={() => { setShowAddModal(false); setEditingCrop(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCrop ? 'Edit Crop' : 'Add New Crop'}</h2>
              <button className="modal-close" onClick={() => { setShowAddModal(false); setEditingCrop(null); }}>
                ✕
              </button>
            </div>
            <form onSubmit={editingCrop ? handleUpdateCrop : handleAddCrop} className="crop-form">
              <div className="form-group">
                <label>Crop Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder="e.g., Tomato, Rice, Wheat"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                  >
                    <option value="vegetables">Vegetables</option>
                    <option value="fruits">Fruits</option>
                    <option value="grains">Grains</option>
                    <option value="pulses">Pulses</option>
                    <option value="spices">Spices</option>
                    <option value="others">Others</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Quality Grade</label>
                  <input
                    type="text"
                    value={formData.qualityGrade}
                    onChange={(e) => setFormData({...formData, qualityGrade: e.target.value})}
                    placeholder="e.g., Grade A, Premium"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Quantity *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.quantity.value}
                    onChange={(e) => setFormData({...formData, quantity: {...formData.quantity, value: e.target.value}})}
                    required
                    placeholder="Amount"
                  />
                </div>
                <div className="form-group">
                  <label>Unit *</label>
                  <select
                    value={formData.quantity.unit}
                    onChange={(e) => setFormData({...formData, quantity: {...formData.quantity, unit: e.target.value}})}
                    required
                  >
                    <option value="kg">Kilograms (kg)</option>
                    <option value="quintal">Quintal</option>
                    <option value="ton">Ton</option>
                    <option value="bags">Bags</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price.value}
                    onChange={(e) => setFormData({...formData, price: {...formData.price, value: e.target.value}})}
                    required
                    placeholder="Amount in ₹"
                  />
                </div>
                <div className="form-group">
                  <label>Price Unit *</label>
                  <select
                    value={formData.price.unit}
                    onChange={(e) => setFormData({...formData, price: {...formData.price, unit: e.target.value}})}
                    required
                  >
                    <option value="per_kg">Per Kg</option>
                    <option value="per_quintal">Per Quintal</option>
                    <option value="per_ton">Per Ton</option>
                    <option value="per_bag">Per Bag</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Available From *</label>
                  <input
                    type="date"
                    value={formData.availableFrom}
                    onChange={(e) => setFormData({...formData, availableFrom: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Available To *</label>
                  <input
                    type="date"
                    value={formData.availableTo}
                    onChange={(e) => setFormData({...formData, availableTo: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>District *</label>
                  <input
                    type="text"
                    value={formData.pickupLocation.district}
                    onChange={(e) => setFormData({...formData, pickupLocation: {...formData.pickupLocation, district: e.target.value}})}
                    required
                    placeholder="e.g., Coimbatore"
                  />
                </div>
                <div className="form-group">
                  <label>State *</label>
                  <input
                    type="text"
                    value={formData.pickupLocation.state}
                    onChange={(e) => setFormData({...formData, pickupLocation: {...formData.pickupLocation, state: e.target.value}})}
                    required
                    placeholder="e.g., Tamil Nadu"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Add details about the crop quality, harvest date, etc."
                  rows={4}
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.organicCertified}
                    onChange={(e) => setFormData({...formData, organicCertified: e.target.checked})}
                  />
                  <span>🌿 Organic Certified</span>
                </label>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => { setShowAddModal(false); setEditingCrop(null); }}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {editingCrop ? 'Update Crop' : 'Add Crop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCrops;
