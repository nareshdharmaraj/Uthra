import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { 
  fetchWantedCrops, 
  addWantedCrop, 
  updateWantedCrop, 
  deleteWantedCrop,
  clearError,
  clearSuccessMessage
} from '../../features/buyer/buyerSlice';
import './WantedCrops.css';

const WantedCrops: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { wantedCrops, isLoading, error, successMessage } = useSelector(
    (state: RootState) => state.buyer
  );

  const [showModal, setShowModal] = useState(false);
  const [editingCrop, setEditingCrop] = useState<any>(null);
  const [formData, setFormData] = useState({
    cropName: '',
    category: '',
    requiredQuantity: '',
    unit: 'kg',
    budgetPerUnit: '',
    frequency: 'one-time',
    districts: [] as string[],
    qualityPreference: 'any',
    notes: '',
    active: true
  });

  const [newDistrict, setNewDistrict] = useState('');

  useEffect(() => {
    dispatch(fetchWantedCrops());
  }, [dispatch]);

  useEffect(() => {
    if (successMessage) {
      setTimeout(() => {
        dispatch(clearSuccessMessage());
        handleCloseModal();
      }, 1500);
    }
  }, [successMessage, dispatch]);

  const handleOpenModal = (crop?: any) => {
    if (crop) {
      setEditingCrop(crop);
      setFormData({
        cropName: crop.cropName,
        category: crop.category || '',
        requiredQuantity: crop.requiredQuantity.toString(),
        unit: crop.unit,
        budgetPerUnit: crop.budgetPerUnit.toString(),
        frequency: crop.frequency,
        districts: crop.districts || [],
        qualityPreference: crop.qualityPreference || 'any',
        notes: crop.notes || '',
        active: crop.active
      });
    } else {
      setEditingCrop(null);
      setFormData({
        cropName: '',
        category: '',
        requiredQuantity: '',
        unit: 'kg',
        budgetPerUnit: '',
        frequency: 'one-time',
        districts: [],
        qualityPreference: 'any',
        notes: '',
        active: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCrop(null);
    setNewDistrict('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddDistrict = () => {
    if (newDistrict && !formData.districts.includes(newDistrict)) {
      setFormData(prev => ({
        ...prev,
        districts: [...prev.districts, newDistrict]
      }));
      setNewDistrict('');
    }
  };

  const handleRemoveDistrict = (district: string) => {
    setFormData(prev => ({
      ...prev,
      districts: prev.districts.filter(d => d !== district)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const cropData = {
      ...formData,
      requiredQuantity: parseFloat(formData.requiredQuantity),
      budgetPerUnit: parseFloat(formData.budgetPerUnit)
    };

    if (editingCrop) {
      dispatch(updateWantedCrop({ cropId: editingCrop._id, cropData }));
    } else {
      dispatch(addWantedCrop(cropData));
    }
  };

  const handleDelete = (cropId: string) => {
    if (window.confirm('Are you sure you want to delete this wanted crop?')) {
      dispatch(deleteWantedCrop(cropId));
    }
  };

  const handleToggleActive = (crop: any) => {
    dispatch(updateWantedCrop({
      cropId: crop._id,
      cropData: { active: !crop.active }
    }));
  };

  return (
    <div className="wanted-crops">
      <div className="header">
        <h2>My Wanted Crops</h2>
        <button className="btn-add" onClick={() => handleOpenModal()}>
          + Add Wanted Crop
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={() => dispatch(clearError())}>×</button>
        </div>
      )}

      {successMessage && (
        <div className="alert alert-success">
          {successMessage}
        </div>
      )}

      {isLoading && !showModal ? (
        <div className="loading">Loading wanted crops...</div>
      ) : (
        <>
          {wantedCrops.length === 0 ? (
            <div className="empty-state">
              <p>You haven't added any wanted crops yet.</p>
              <button className="btn-primary" onClick={() => handleOpenModal()}>
                Add Your First Wanted Crop
              </button>
            </div>
          ) : (
            <div className="crops-list">
              {wantedCrops.map((crop: any) => (
                <div key={crop._id} className={`crop-item ${!crop.active ? 'inactive' : ''}`}>
                  <div className="crop-header">
                    <div>
                      <h3>{crop.cropName}</h3>
                      {crop.category && <span className="category">{crop.category}</span>}
                    </div>
                    <div className="actions">
                      <button
                        className={`btn-toggle ${crop.active ? 'active' : 'inactive'}`}
                        onClick={() => handleToggleActive(crop)}
                        title={crop.active ? 'Deactivate' : 'Activate'}
                      >
                        {crop.active ? '✓ Active' : '✗ Inactive'}
                      </button>
                      <button className="btn-edit" onClick={() => handleOpenModal(crop)}>Edit</button>
                      <button className="btn-delete" onClick={() => handleDelete(crop._id)}>Delete</button>
                    </div>
                  </div>
                  <div className="crop-details">
                    <div className="detail-row">
                      <strong>Required Quantity:</strong> {crop.requiredQuantity} {crop.unit}
                    </div>
                    <div className="detail-row">
                      <strong>Budget:</strong> ₹{crop.budgetPerUnit}/{crop.unit}
                    </div>
                    <div className="detail-row">
                      <strong>Frequency:</strong> {crop.frequency}
                    </div>
                    {crop.qualityPreference && (
                      <div className="detail-row">
                        <strong>Quality:</strong> {crop.qualityPreference}
                      </div>
                    )}
                    {crop.districts && crop.districts.length > 0 && (
                      <div className="detail-row">
                        <strong>Preferred Districts:</strong>
                        <div className="tags">
                          {crop.districts.map((district: string, idx: number) => (
                            <span key={idx} className="tag">{district}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {crop.notes && (
                      <div className="detail-row">
                        <strong>Notes:</strong> {crop.notes}
                      </div>
                    )}
                    <div className="detail-row meta">
                      Added on {new Date(crop.createdAt).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingCrop ? 'Edit Wanted Crop' : 'Add Wanted Crop'}</h3>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-group">
                <label>Crop Name *</label>
                <input
                  type="text"
                  name="cropName"
                  value={formData.cropName}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Tomato, Rice, Wheat"
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="">Select Category</option>
                  <option value="vegetables">Vegetables</option>
                  <option value="fruits">Fruits</option>
                  <option value="grains">Grains</option>
                  <option value="pulses">Pulses</option>
                  <option value="spices">Spices</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Required Quantity *</label>
                  <input
                    type="number"
                    name="requiredQuantity"
                    value={formData.requiredQuantity}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label>Unit</label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                  >
                    <option value="kg">Kilogram (kg)</option>
                    <option value="ton">Ton</option>
                    <option value="quintal">Quintal</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Budget per Unit *</label>
                <input
                  type="number"
                  name="budgetPerUnit"
                  value={formData.budgetPerUnit}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="₹"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Frequency</label>
                  <select
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleChange}
                  >
                    <option value="one-time">One-time</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="seasonal">Seasonal</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Quality Preference</label>
                  <select
                    name="qualityPreference"
                    value={formData.qualityPreference}
                    onChange={handleChange}
                  >
                    <option value="any">Any</option>
                    <option value="organic">Organic</option>
                    <option value="conventional">Conventional</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Preferred Districts</label>
                <div className="tags">
                  {formData.districts.map((district, idx) => (
                    <span key={idx} className="tag">
                      {district}
                      <button type="button" onClick={() => handleRemoveDistrict(district)}>×</button>
                    </span>
                  ))}
                </div>
                <div className="add-tag">
                  <input
                    type="text"
                    value={newDistrict}
                    onChange={(e) => setNewDistrict(e.target.value)}
                    placeholder="Add district"
                  />
                  <button type="button" onClick={handleAddDistrict} className="btn-secondary">
                    Add
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Any additional requirements or notes..."
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleChange}
                  />
                  Active (farmers can see this requirement)
                </label>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={isLoading}>
                  {isLoading ? 'Saving...' : editingCrop ? 'Update Crop' : 'Add Crop'}
                </button>
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WantedCrops;
