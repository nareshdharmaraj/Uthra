import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { 
  fetchBuyerProfile, 
  updateBuyerProfile, 
  clearError, 
  clearSuccessMessage 
} from '../../features/buyer/buyerSlice';
import './BuyerProfile.css';

const BuyerProfile: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile, isProfileLoading, isLoading, error, successMessage } = useSelector(
    (state: RootState) => state.buyer
  );

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    address: '',
    village: '',
    district: '',
    state: '',
    pincode: '',
    businessName: '',
    businessType: '',
    organizationName: '',
    organizationDescription: '',
    yearEstablished: '',
    gstNumber: '',
    panNumber: '',
    website: '',
    preferredCategories: [] as string[],
    hasOwnTransport: false,
    maxDeliveryRadius: '',
    preferredPickupLocations: [] as string[],
    preferredMethod: 'bank_transfer',
    advancePayment: false,
    creditDays: 0,
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    accountHolderName: ''
  });

  const [newCategory, setNewCategory] = useState('');
  const [newLocation, setNewLocation] = useState('');

  useEffect(() => {
    dispatch(fetchBuyerProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        mobile: profile.mobile || '',
        address: profile.location?.address || '',
        village: profile.location?.village || '',
        district: profile.location?.district || '',
        state: profile.location?.state || '',
        pincode: profile.location?.pincode || '',
        businessName: profile.buyerDetails?.businessName || '',
        businessType: profile.buyerDetails?.businessType || '',
        organizationName: profile.buyerDetails?.organizationName || '',
        organizationDescription: profile.buyerDetails?.organizationDescription || '',
        yearEstablished: profile.buyerDetails?.yearEstablished?.toString() || '',
        gstNumber: profile.buyerDetails?.gstNumber || '',
        panNumber: profile.buyerDetails?.panNumber || '',
        website: profile.buyerDetails?.website || '',
        preferredCategories: profile.buyerDetails?.preferredCategories || [],
        hasOwnTransport: profile.buyerDetails?.deliveryCapabilities?.hasOwnTransport || false,
        maxDeliveryRadius: profile.buyerDetails?.deliveryCapabilities?.maxDeliveryRadius?.toString() || '',
        preferredPickupLocations: profile.buyerDetails?.deliveryCapabilities?.preferredPickupLocations || [],
        preferredMethod: profile.buyerDetails?.paymentTerms?.preferredMethod || 'bank_transfer',
        advancePayment: profile.buyerDetails?.paymentTerms?.advancePayment || false,
        creditDays: profile.buyerDetails?.paymentTerms?.creditDays || 0,
        accountNumber: profile.buyerDetails?.bankDetails?.accountNumber || '',
        ifscCode: profile.buyerDetails?.bankDetails?.ifscCode || '',
        bankName: profile.buyerDetails?.bankDetails?.bankName || '',
        accountHolderName: profile.buyerDetails?.bankDetails?.accountHolderName || ''
      });
    }
  }, [profile]);

  useEffect(() => {
    if (successMessage) {
      setTimeout(() => {
        dispatch(clearSuccessMessage());
        setIsEditing(false);
      }, 2000);
    }
  }, [successMessage, dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'creditDays') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddCategory = () => {
    if (newCategory && !formData.preferredCategories.includes(newCategory)) {
      setFormData(prev => ({
        ...prev,
        preferredCategories: [...prev.preferredCategories, newCategory]
      }));
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (category: string) => {
    setFormData(prev => ({
      ...prev,
      preferredCategories: prev.preferredCategories.filter(c => c !== category)
    }));
  };

  const handleAddLocation = () => {
    if (newLocation && !formData.preferredPickupLocations.includes(newLocation)) {
      setFormData(prev => ({
        ...prev,
        preferredPickupLocations: [...prev.preferredPickupLocations, newLocation]
      }));
      setNewLocation('');
    }
  };

  const handleRemoveLocation = (location: string) => {
    setFormData(prev => ({
      ...prev,
      preferredPickupLocations: prev.preferredPickupLocations.filter(l => l !== location)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const updateData = {
      name: formData.name,
      email: formData.email,
      location: {
        address: formData.address,
        village: formData.village,
        district: formData.district,
        state: formData.state,
        pincode: formData.pincode
      },
      buyerDetails: {
        businessName: formData.businessName,
        businessType: formData.businessType,
        organizationName: formData.organizationName,
        organizationDescription: formData.organizationDescription,
        yearEstablished: formData.yearEstablished ? parseInt(formData.yearEstablished) : undefined,
        gstNumber: formData.gstNumber,
        panNumber: formData.panNumber,
        website: formData.website,
        preferredCategories: formData.preferredCategories,
        deliveryCapabilities: {
          hasOwnTransport: formData.hasOwnTransport,
          maxDeliveryRadius: formData.maxDeliveryRadius ? parseFloat(formData.maxDeliveryRadius) : undefined,
          preferredPickupLocations: formData.preferredPickupLocations
        },
        paymentTerms: {
          preferredMethod: formData.preferredMethod,
          advancePayment: formData.advancePayment,
          creditDays: formData.creditDays
        },
        bankDetails: {
          accountNumber: formData.accountNumber,
          ifscCode: formData.ifscCode,
          bankName: formData.bankName,
          accountHolderName: formData.accountHolderName
        }
      }
    };

    dispatch(updateBuyerProfile(updateData));
  };

  if (isProfileLoading) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
    <div className="buyer-profile">
      <div className="profile-header">
        <h2>My Profile</h2>
        {!isEditing && (
          <button className="btn-primary" onClick={() => setIsEditing(true)}>
            Edit Profile
          </button>
        )}
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

      <form onSubmit={handleSubmit} className="profile-form">
        {/* Basic Information */}
        <section className="form-section">
          <h3>Basic Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                required
              />
            </div>
            <div className="form-group">
              <label>Mobile Number</label>
              <input
                type="text"
                name="mobile"
                value={formData.mobile}
                disabled
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </div>
        </section>

        {/* Organization Details */}
        <section className="form-section">
          <h3>Organization Details</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Business Name</label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className="form-group">
              <label>Business Type</label>
              <select
                name="businessType"
                value={formData.businessType}
                onChange={handleChange}
                disabled={!isEditing}
              >
                <option value="">Select Type</option>
                <option value="retailer">Retailer</option>
                <option value="wholesaler">Wholesaler</option>
                <option value="restaurant">Restaurant</option>
                <option value="exporter">Exporter</option>
                <option value="processor">Processor</option>
                <option value="individual">Individual</option>
              </select>
            </div>
            <div className="form-group">
              <label>Organization Name</label>
              <input
                type="text"
                name="organizationName"
                value={formData.organizationName}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className="form-group">
              <label>Year Established</label>
              <input
                type="number"
                name="yearEstablished"
                value={formData.yearEstablished}
                onChange={handleChange}
                disabled={!isEditing}
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>
            <div className="form-group form-group-full">
              <label>Organization Description</label>
              <textarea
                name="organizationDescription"
                value={formData.organizationDescription}
                onChange={handleChange}
                disabled={!isEditing}
                rows={3}
              />
            </div>
            <div className="form-group">
              <label>GST Number</label>
              <input
                type="text"
                name="gstNumber"
                value={formData.gstNumber}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className="form-group">
              <label>PAN Number</label>
              <input
                type="text"
                name="panNumber"
                value={formData.panNumber}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className="form-group">
              <label>Website</label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </div>
        </section>

        {/* Location Details */}
        <section className="form-section">
          <h3>Location Details</h3>
          <div className="form-grid">
            <div className="form-group form-group-full">
              <label>Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className="form-group">
              <label>Village</label>
              <input
                type="text"
                name="village"
                value={formData.village}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className="form-group">
              <label>District</label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className="form-group">
              <label>State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className="form-group">
              <label>Pincode</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </div>
        </section>

        {/* Preferred Categories */}
        <section className="form-section">
          <h3>Preferred Crop Categories</h3>
          <div className="tags-container">
            {formData.preferredCategories.map((category, index) => (
              <span key={index} className="tag">
                {category}
                {isEditing && (
                  <button type="button" onClick={() => handleRemoveCategory(category)}>×</button>
                )}
              </span>
            ))}
          </div>
          {isEditing && (
            <div className="add-tag">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Add crop category (e.g., Vegetables, Grains)"
              />
              <button type="button" onClick={handleAddCategory} className="btn-secondary">
                Add
              </button>
            </div>
          )}
        </section>

        {/* Delivery Capabilities */}
        <section className="form-section">
          <h3>Delivery Capabilities</h3>
          <div className="form-grid">
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="hasOwnTransport"
                  checked={formData.hasOwnTransport}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
                Has Own Transport
              </label>
            </div>
            <div className="form-group">
              <label>Max Delivery Radius (km)</label>
              <input
                type="number"
                name="maxDeliveryRadius"
                value={formData.maxDeliveryRadius}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Preferred Pickup Locations</label>
            <div className="tags-container">
              {formData.preferredPickupLocations.map((location, index) => (
                <span key={index} className="tag">
                  {location}
                  {isEditing && (
                    <button type="button" onClick={() => handleRemoveLocation(location)}>×</button>
                  )}
                </span>
              ))}
            </div>
            {isEditing && (
              <div className="add-tag">
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="Add pickup location (e.g., Coimbatore, Salem)"
                />
                <button type="button" onClick={handleAddLocation} className="btn-secondary">
                  Add
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Payment Terms */}
        <section className="form-section">
          <h3>Payment Terms</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Preferred Payment Method</label>
              <select
                name="preferredMethod"
                value={formData.preferredMethod}
                onChange={handleChange}
                disabled={!isEditing}
              >
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="upi">UPI</option>
                <option value="cheque">Cheque</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="advancePayment"
                  checked={formData.advancePayment}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
                Advance Payment
              </label>
            </div>
            <div className="form-group">
              <label>Credit Days</label>
              <input
                type="number"
                name="creditDays"
                value={formData.creditDays}
                onChange={handleChange}
                disabled={!isEditing}
                min="0"
              />
            </div>
          </div>
        </section>

        {/* Bank Details */}
        <section className="form-section">
          <h3>Bank Details</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Account Holder Name</label>
              <input
                type="text"
                name="accountHolderName"
                value={formData.accountHolderName}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className="form-group">
              <label>Account Number</label>
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className="form-group">
              <label>IFSC Code</label>
              <input
                type="text"
                name="ifscCode"
                value={formData.ifscCode}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            <div className="form-group">
              <label>Bank Name</label>
              <input
                type="text"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </div>
        </section>

        {isEditing && (
          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={() => setIsEditing(false)}
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default BuyerProfile;
