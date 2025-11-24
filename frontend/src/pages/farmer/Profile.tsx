import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../types';
import api from '../../services/api';
import './Profile.css';

interface FarmerProfile {
  name: string;
  mobile: string;
  email?: string;
  farmerDetails?: {
    farmSize?: {
      value: number;
      unit: string;
    };
    primaryCrops?: string[];
    farmingExperience?: number;
    farmLocation?: {
      village?: string;
      district?: string;
      state?: string;
      pincode?: string;
    };
    bankDetails?: {
      accountNumber?: string;
      ifscCode?: string;
      bankName?: string;
      branchName?: string;
    };
    organicCertified?: boolean;
  };
}

const Profile: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [profile, setProfile] = useState<FarmerProfile>({
    name: '',
    mobile: '',
    email: '',
    farmerDetails: {
      farmSize: { value: 0, unit: 'acres' },
      primaryCrops: [],
      farmingExperience: 0,
      farmLocation: {
        village: '',
        district: '',
        state: '',
        pincode: ''
      },
      bankDetails: {
        accountNumber: '',
        ifscCode: '',
        bankName: '',
        branchName: ''
      },
      organicCertified: false
    }
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newCrop, setNewCrop] = useState('');

  const fetchProfile = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/farmers/profile');
      const userData = response.data.data || user;
      
      // Helper to create proper farmSize object
      const createFarmSize = (farmSizeValue: any): { value: number; unit: string; } => {
        if (typeof farmSizeValue === 'number') {
          return { value: farmSizeValue, unit: 'acres' };
        }
        if (farmSizeValue && typeof farmSizeValue === 'object' && farmSizeValue.value !== undefined) {
          return farmSizeValue;
        }
        return { value: 0, unit: 'acres' };
      };
      
      // Transform backend data structure to match frontend expectations
      if (userData) {
        console.log('🔍 Profile data received:', userData); // Debug log
        const userAny = userData as any;
        
        setProfile({
          name: userData.name || '',
          mobile: userData.mobile || '',
          email: userData.email || '',
          farmerDetails: {
            farmSize: createFarmSize(userAny.farmSize),
            primaryCrops: userAny.crops || [],
            farmingExperience: userAny.farmingExperience || 0,
            farmLocation: {
              village: userData.location?.village || '',
              district: userData.location?.district || '',
              state: userData.location?.state || '', // Will be empty as per DB data
              pincode: userData.location?.pincode || ''
            },
            bankDetails: {
              accountNumber: userAny.bankDetails?.accountNumber || '',
              ifscCode: userAny.bankDetails?.ifscCode || '',
              bankName: userAny.bankDetails?.bankName || '',
              branchName: userAny.bankDetails?.branchName || '' // Not in DB, will be empty
            },
            organicCertified: (userData as any).farmingType === 'organic' || false
          }
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Use user from Redux if API fails
      if (user) {
        // Transform user data to match profile structure
        const userAny = user as any;
        
        // Helper to create proper farmSize object
        const createFarmSize = (farmSizeValue: any): { value: number; unit: string; } => {
          if (typeof farmSizeValue === 'number') {
            return { value: farmSizeValue, unit: 'acres' };
          }
          if (farmSizeValue && typeof farmSizeValue === 'object' && farmSizeValue.value !== undefined) {
            return farmSizeValue;
          }
          return { value: 0, unit: 'acres' };
        };
        
        setProfile({
          name: user.name || '',
          mobile: user.mobile || '',
          email: user.email || '',
          farmerDetails: {
            farmSize: createFarmSize(userAny.farmSize),
            primaryCrops: userAny.crops || [],
            farmingExperience: userAny.farmingExperience || 0,
            farmLocation: {
              village: user.location?.village || '',
              district: user.location?.district || '',
              state: user.location?.state || '',
              pincode: user.location?.pincode || ''
            },
            bankDetails: {
              accountNumber: userAny.bankDetails?.accountNumber || '',
              ifscCode: userAny.bankDetails?.ifscCode || '',
              bankName: userAny.bankDetails?.bankName || '',
              branchName: userAny.bankDetails?.branchName || ''
            },
            organicCertified: (user as any).farmingType === 'organic' || false
          }
        });
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async () => {
    try {
      await api.put('/farmers/profile', profile);
      alert('Profile updated successfully!');
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleAddCrop = () => {
    if (newCrop.trim() && profile.farmerDetails) {
      const crops = profile.farmerDetails.primaryCrops || [];
      setProfile({
        ...profile,
        farmerDetails: {
          ...profile.farmerDetails,
          primaryCrops: [...crops, newCrop.trim()]
        }
      });
      setNewCrop('');
    }
  };

  const handleRemoveCrop = (index: number) => {
    if (profile.farmerDetails && profile.farmerDetails.primaryCrops) {
      const crops = [...profile.farmerDetails.primaryCrops];
      crops.splice(index, 1);
      setProfile({
        ...profile,
        farmerDetails: {
          ...profile.farmerDetails,
          primaryCrops: crops
        }
      });
    }
  };

  if (loading) {
    return <div className="loading-state">Loading profile...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>👤 My Profile</h1>
        <button 
          className={`btn-edit ${isEditing ? 'btn-cancel' : ''}`}
          onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
        >
          {isEditing ? '✕ Cancel' : '✏️ Edit Profile'}
        </button>
      </div>

      <div className="profile-content">
        {/* Basic Information */}
        <div className="profile-section">
          <h2>Basic Information</h2>
          <div className="profile-grid">
            <div className="profile-field">
              <label>Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                />
              ) : (
                <p>{profile.name || 'Not provided'}</p>
              )}
            </div>
            <div className="profile-field">
              <label>Mobile</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={profile.mobile}
                  onChange={(e) => setProfile({...profile, mobile: e.target.value})}
                />
              ) : (
                <p>{profile.mobile || 'Not provided'}</p>
              )}
            </div>
            <div className="profile-field">
              <label>Email</label>
              {isEditing ? (
                <input
                  type="email"
                  value={profile.email || ''}
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                />
              ) : (
                <p>{profile.email || 'Not provided'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Farm Information */}
        <div className="profile-section">
          <h2>Farm Information</h2>
          <div className="profile-grid">
            <div className="profile-field">
              <label>Farm Size</label>
              {isEditing ? (
                <div className="input-group">
                  <input
                    type="number"
                    step="0.1"
                    value={profile.farmerDetails?.farmSize?.value || 0}
                    onChange={(e) => setProfile({
                      ...profile,
                      farmerDetails: {
                        ...profile.farmerDetails,
                        farmSize: {
                          value: parseFloat(e.target.value),
                          unit: profile.farmerDetails?.farmSize?.unit || 'acres'
                        }
                      }
                    })}
                  />
                  <select
                    value={profile.farmerDetails?.farmSize?.unit || 'acres'}
                    onChange={(e) => setProfile({
                      ...profile,
                      farmerDetails: {
                        ...profile.farmerDetails,
                        farmSize: {
                          value: profile.farmerDetails?.farmSize?.value || 0,
                          unit: e.target.value
                        }
                      }
                    })}
                  >
                    <option value="acres">Acres</option>
                    <option value="hectares">Hectares</option>
                  </select>
                </div>
              ) : (
                <p>{profile.farmerDetails?.farmSize?.value || 0} {profile.farmerDetails?.farmSize?.unit || 'acres'}</p>
              )}
            </div>
            <div className="profile-field">
              <label>Farming Experience (years)</label>
              {isEditing ? (
                <input
                  type="number"
                  value={profile.farmerDetails?.farmingExperience || 0}
                  onChange={(e) => setProfile({
                    ...profile,
                    farmerDetails: {
                      ...profile.farmerDetails,
                      farmingExperience: parseInt(e.target.value)
                    }
                  })}
                />
              ) : (
                <p>{profile.farmerDetails?.farmingExperience || 0} years</p>
              )}
            </div>
            <div className="profile-field">
              <label>Organic Certified</label>
              {isEditing ? (
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={profile.farmerDetails?.organicCertified || false}
                    onChange={(e) => setProfile({
                      ...profile,
                      farmerDetails: {
                        ...profile.farmerDetails,
                        organicCertified: e.target.checked
                      }
                    })}
                  />
                  <span>Yes, I have organic certification</span>
                </label>
              ) : (
                <p>{profile.farmerDetails?.organicCertified ? '✓ Yes' : '✗ No'}</p>
              )}
            </div>
          </div>

          {/* Primary Crops */}
          <div className="profile-field full-width">
            <label>Primary Crops</label>
            {isEditing ? (
              <div className="crops-input">
                <div className="input-with-button">
                  <input
                    type="text"
                    value={newCrop}
                    onChange={(e) => setNewCrop(e.target.value)}
                    placeholder="Enter crop name"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCrop())}
                  />
                  <button type="button" onClick={handleAddCrop} className="btn-add-crop">+ Add</button>
                </div>
                <div className="crops-tags">
                  {profile.farmerDetails?.primaryCrops?.map((crop, index) => (
                    <span key={index} className="crop-tag">
                      {crop}
                      <button type="button" onClick={() => handleRemoveCrop(index)}>✕</button>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="crops-tags">
                {profile.farmerDetails?.primaryCrops?.length ? (
                  profile.farmerDetails.primaryCrops.map((crop, index) => (
                    <span key={index} className="crop-tag">{crop}</span>
                  ))
                ) : (
                  <p>No crops added</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Location Information */}
        <div className="profile-section">
          <h2>Farm Location</h2>
          <div className="profile-grid">
            <div className="profile-field">
              <label>Village</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.farmerDetails?.farmLocation?.village || ''}
                  onChange={(e) => setProfile({
                    ...profile,
                    farmerDetails: {
                      ...profile.farmerDetails,
                      farmLocation: {
                        ...profile.farmerDetails?.farmLocation,
                        village: e.target.value
                      }
                    }
                  })}
                />
              ) : (
                <p>{profile.farmerDetails?.farmLocation?.village || 'Not provided'}</p>
              )}
            </div>
            <div className="profile-field">
              <label>District</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.farmerDetails?.farmLocation?.district || ''}
                  onChange={(e) => setProfile({
                    ...profile,
                    farmerDetails: {
                      ...profile.farmerDetails,
                      farmLocation: {
                        ...profile.farmerDetails?.farmLocation,
                        district: e.target.value
                      }
                    }
                  })}
                />
              ) : (
                <p>{profile.farmerDetails?.farmLocation?.district || 'Not provided'}</p>
              )}
            </div>
            <div className="profile-field">
              <label>State</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.farmerDetails?.farmLocation?.state || ''}
                  onChange={(e) => setProfile({
                    ...profile,
                    farmerDetails: {
                      ...profile.farmerDetails,
                      farmLocation: {
                        ...profile.farmerDetails?.farmLocation,
                        state: e.target.value
                      }
                    }
                  })}
                />
              ) : (
                <p>{profile.farmerDetails?.farmLocation?.state || 'Not provided'}</p>
              )}
            </div>
            <div className="profile-field">
              <label>Pincode</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.farmerDetails?.farmLocation?.pincode || ''}
                  onChange={(e) => setProfile({
                    ...profile,
                    farmerDetails: {
                      ...profile.farmerDetails,
                      farmLocation: {
                        ...profile.farmerDetails?.farmLocation,
                        pincode: e.target.value
                      }
                    }
                  })}
                />
              ) : (
                <p>{profile.farmerDetails?.farmLocation?.pincode || 'Not provided'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div className="profile-section">
          <h2>Bank Details</h2>
          <div className="profile-grid">
            <div className="profile-field">
              <label>Bank Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.farmerDetails?.bankDetails?.bankName || ''}
                  onChange={(e) => setProfile({
                    ...profile,
                    farmerDetails: {
                      ...profile.farmerDetails,
                      bankDetails: {
                        ...profile.farmerDetails?.bankDetails,
                        bankName: e.target.value
                      }
                    }
                  })}
                />
              ) : (
                <p>{profile.farmerDetails?.bankDetails?.bankName || 'Not provided'}</p>
              )}
            </div>
            <div className="profile-field">
              <label>Branch Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.farmerDetails?.bankDetails?.branchName || ''}
                  onChange={(e) => setProfile({
                    ...profile,
                    farmerDetails: {
                      ...profile.farmerDetails,
                      bankDetails: {
                        ...profile.farmerDetails?.bankDetails,
                        branchName: e.target.value
                      }
                    }
                  })}
                />
              ) : (
                <p>{profile.farmerDetails?.bankDetails?.branchName || 'Not provided'}</p>
              )}
            </div>
            <div className="profile-field">
              <label>Account Number</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.farmerDetails?.bankDetails?.accountNumber || ''}
                  onChange={(e) => setProfile({
                    ...profile,
                    farmerDetails: {
                      ...profile.farmerDetails,
                      bankDetails: {
                        ...profile.farmerDetails?.bankDetails,
                        accountNumber: e.target.value
                      }
                    }
                  })}
                />
              ) : (
                <p>{profile.farmerDetails?.bankDetails?.accountNumber ? '****' + profile.farmerDetails.bankDetails.accountNumber.slice(-4) : 'Not provided'}</p>
              )}
            </div>
            <div className="profile-field">
              <label>IFSC Code</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.farmerDetails?.bankDetails?.ifscCode || ''}
                  onChange={(e) => setProfile({
                    ...profile,
                    farmerDetails: {
                      ...profile.farmerDetails,
                      bankDetails: {
                        ...profile.farmerDetails?.bankDetails,
                        ifscCode: e.target.value.toUpperCase()
                      }
                    }
                  })}
                />
              ) : (
                <p>{profile.farmerDetails?.bankDetails?.ifscCode || 'Not provided'}</p>
              )}
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="profile-actions">
            <button className="btn-save" onClick={handleSave}>
              💾 Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
