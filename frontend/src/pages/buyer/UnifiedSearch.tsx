import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { searchFarmers, fetchFarmerDetails, clearSelectedFarmer } from '../../features/buyer/buyerSlice';
import { searchCrops, browseCrops } from '../../services/buyerService';
import './UnifiedSearch.css';

interface Crop {
  _id: string;
  name: string;
  category: string;
  quantity: { value: number; unit: string };
  price: { value: number; unit: string };
  quality?: string;
  description?: string;
  availableFrom: string;
  availableTo: string;
  pickupLocation: { village?: string; district?: string };
  farmer: { _id: string; name: string; mobile: string };
  viewCount?: number;
  requestCount?: number;
}

const UnifiedSearch: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { searchResults: farmerResults, isFarmersLoading, selectedFarmer, isLoading } = useSelector(
    (state: RootState) => state.buyer
  );

  const [searchMode, setSearchMode] = useState<'crops' | 'farmers'>('crops');
  
  // Crop search state
  const [crops, setCrops] = useState<Crop[]>([]);
  const [isCropsLoading, setIsCropsLoading] = useState(false);
  const [cropError, setCropError] = useState<string | null>(null);
  const [cropPagination, setCropPagination] = useState({ total: 0, currentPage: 1, totalPages: 0 });
  
  // Common search params
  const [searchTerm, setSearchTerm] = useState('');
  const [district, setDistrict] = useState('');
  
  // Crop-specific params
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  
  // Farmer-specific params
  const [state, setState] = useState('');
  const [farmingType, setFarmingType] = useState('');
  const [hasActiveCrops, setHasActiveCrops] = useState(false);
  
  const [page, setPage] = useState(1);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);

  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchMode]);

  const handleSearch = async () => {
    setPage(1);
    if (searchMode === 'crops') {
      await searchCropsData(1);
    } else {
      await searchFarmersData(1);
    }
  };

  const searchCropsData = async (pageNum: number) => {
    try {
      setIsCropsLoading(true);
      setCropError(null);

      if (searchTerm || category) {
        const filters: any = {};
        if (category) filters.category = category;
        if (district) filters.district = district;

        const response = await searchCrops({
          searchTerm: searchTerm || undefined,
          filters: Object.keys(filters).length > 0 ? filters : undefined,
          page: pageNum,
          limit: 20
        });
        
        setCrops(response.data);
        setCropPagination({
          total: response.total,
          currentPage: response.currentPage,
          totalPages: response.totalPages
        });
      } else {
        const response = await browseCrops({
          category: category || undefined,
          district: district || undefined,
          minPrice: minPrice ? parseFloat(minPrice) : undefined,
          maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
          page: pageNum,
          limit: 20
        });
        
        setCrops(response.data);
        setCropPagination({
          total: response.total,
          currentPage: response.currentPage,
          totalPages: response.totalPages
        });
      }
    } catch (err: any) {
      setCropError(err.response?.data?.message || 'Failed to fetch crops');
    } finally {
      setIsCropsLoading(false);
    }
  };

  const searchFarmersData = async (pageNum: number) => {
    dispatch(searchFarmers({
      searchTerm: searchTerm || undefined,
      district: district || undefined,
      state: state || undefined,
      farmingType: farmingType || undefined,
      hasActiveCrops,
      page: pageNum,
      limit: 20
    }));
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    if (searchMode === 'crops') {
      searchCropsData(newPage);
    } else {
      searchFarmersData(newPage);
    }
  };

  const handleViewFarmer = (farmerId: string) => {
    dispatch(fetchFarmerDetails(farmerId));
    setShowDetailModal(true);
  };

  const handleViewCrop = (crop: Crop) => {
    setSelectedCrop(crop);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    if (searchMode === 'farmers') {
      dispatch(clearSelectedFarmer());
    } else {
      setSelectedCrop(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="unified-search">
      <div className="search-header">
        <h2>Search</h2>
        <div className="search-mode-toggle">
          <button
            className={searchMode === 'crops' ? 'active' : ''}
            onClick={() => setSearchMode('crops')}
          >
            🌾 Search Crops
          </button>
          <button
            className={searchMode === 'farmers' ? 'active' : ''}
            onClick={() => setSearchMode('farmers')}
          >
            🚜 Search Farmers
          </button>
        </div>
      </div>

      {/* Search Filters */}
      <div className="search-filters">
        <div className="filter-row">
          <div className="filter-group">
            <input
              type="text"
              placeholder={searchMode === 'crops' ? 'Search crops...' : 'Search farmers...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <input
              type="text"
              placeholder="District"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            />
          </div>
          
          {searchMode === 'crops' ? (
            <>
              <div className="filter-group">
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="">All Categories</option>
                  <option value="vegetables">Vegetables</option>
                  <option value="fruits">Fruits</option>
                  <option value="grains">Grains</option>
                  <option value="pulses">Pulses</option>
                  <option value="spices">Spices</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </>
          ) : (
            <>
              <div className="filter-group">
                <input
                  type="text"
                  placeholder="State"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
              </div>
              <div className="filter-group">
                <select value={farmingType} onChange={(e) => setFarmingType(e.target.value)}>
                  <option value="">All Farming Types</option>
                  <option value="organic">Organic</option>
                  <option value="conventional">Conventional</option>
                  <option value="mixed">Mixed</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </>
          )}
        </div>
        
        <div className="filter-row">
          {searchMode === 'crops' ? (
            <>
              <div className="filter-group">
                <input
                  type="number"
                  placeholder="Min Price (₹)"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  min="0"
                />
              </div>
              <div className="filter-group">
                <input
                  type="number"
                  placeholder="Max Price (₹)"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  min="0"
                />
              </div>
            </>
          ) : (
            <div className="filter-group checkbox-filter">
              <label>
                <input
                  type="checkbox"
                  checked={hasActiveCrops}
                  onChange={(e) => setHasActiveCrops(e.target.checked)}
                />
                Only farmers with active crops
              </label>
            </div>
          )}
          <button 
            className="btn-search" 
            onClick={handleSearch} 
            disabled={searchMode === 'crops' ? isCropsLoading : isFarmersLoading}
          >
            {(searchMode === 'crops' ? isCropsLoading : isFarmersLoading) ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {cropError && searchMode === 'crops' && (
        <div className="alert alert-error">
          {cropError}
          <button onClick={() => setCropError(null)}>×</button>
        </div>
      )}

      {/* Results */}
      <div className="search-results">
        {searchMode === 'crops' ? (
          <>
            <div className="results-header">
              <h3>Found {cropPagination.total} crops</h3>
              <span className="page-info">Page {cropPagination.currentPage} of {cropPagination.totalPages}</span>
            </div>

            {isCropsLoading ? (
              <div className="loading">Loading crops...</div>
            ) : (
              <>
                <div className="results-grid crops-grid">
                  {crops.map((crop) => (
                    <div key={crop._id} className="result-card crop-card">
                      <div className="card-header">
                        <h4>{crop.name}</h4>
                        <span className="category-badge">{crop.category}</span>
                      </div>
                      <div className="card-details">
                        <div className="price-info">
                          <span className="price">₹{crop.price.value}/{crop.price.unit}</span>
                          <span className="quantity">{crop.quantity.value} {crop.quantity.unit}</span>
                        </div>
                        {crop.quality && <p><strong>Quality:</strong> <span className="quality-badge">{crop.quality}</span></p>}
                        <p><strong>Location:</strong> {crop.pickupLocation.village}, {crop.pickupLocation.district}</p>
                        <p><strong>Farmer:</strong> {crop.farmer.name}</p>
                        <p><strong>Available until:</strong> {formatDate(crop.availableTo)}</p>
                        <div className="card-stats">
                          <span>👁️ {crop.viewCount || 0}</span>
                          <span>📋 {crop.requestCount || 0}</span>
                        </div>
                      </div>
                      <button className="btn-view" onClick={() => handleViewCrop(crop)}>View Details</button>
                    </div>
                  ))}
                </div>

                {crops.length === 0 && (
                  <div className="no-results">
                    <p>No crops found matching your search criteria.</p>
                  </div>
                )}

                {cropPagination.totalPages > 1 && (
                  <div className="pagination">
                    <button onClick={() => handlePageChange(page - 1)} disabled={page === 1}>Previous</button>
                    <span className="page-numbers">
                      {Array.from({ length: Math.min(cropPagination.totalPages, 5) }, (_, i) => {
                        let pageNum;
                        if (cropPagination.totalPages <= 5) pageNum = i + 1;
                        else if (page <= 3) pageNum = i + 1;
                        else if (page >= cropPagination.totalPages - 2) pageNum = cropPagination.totalPages - 4 + i;
                        else pageNum = page - 2 + i;
                        return (
                          <button
                            key={pageNum}
                            className={pageNum === page ? 'active' : ''}
                            onClick={() => handlePageChange(pageNum)}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </span>
                    <button onClick={() => handlePageChange(page + 1)} disabled={page === cropPagination.totalPages}>Next</button>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <>
            <div className="results-header">
              <h3>Found {farmerResults.total} farmers</h3>
              <span className="page-info">Page {farmerResults.currentPage} of {farmerResults.totalPages}</span>
            </div>

            {isFarmersLoading ? (
              <div className="loading">Loading farmers...</div>
            ) : (
              <>
                <div className="results-grid farmers-grid">
                  {farmerResults.farmers.map((farmer: any) => (
                    <div key={farmer._id} className="result-card farmer-card">
                      <div className="card-header">
                        <h4>{farmer.name}</h4>
                        <span className="crops-badge">{farmer.activeCrops || 0} crops</span>
                      </div>
                      <div className="card-details">
                        <p><strong>Mobile:</strong> {farmer.mobile}</p>
                        {farmer.location?.village && (
                          <p><strong>Location:</strong> {farmer.location.village}{farmer.location.district && `, ${farmer.location.district}`}</p>
                        )}
                        {farmer.farmerDetails?.farmingType && (
                          <p><strong>Farming Type:</strong> <span className="farming-type">{farmer.farmerDetails.farmingType}</span></p>
                        )}
                        {farmer.farmerDetails?.farmSize && (
                          <p><strong>Farm Size:</strong> {farmer.farmerDetails.farmSize} acres</p>
                        )}
                      </div>
                      <button className="btn-view" onClick={() => handleViewFarmer(farmer._id)}>View Details</button>
                    </div>
                  ))}
                </div>

                {farmerResults.farmers.length === 0 && (
                  <div className="no-results">
                    <p>No farmers found matching your search criteria.</p>
                  </div>
                )}

                {farmerResults.totalPages > 1 && (
                  <div className="pagination">
                    <button onClick={() => handlePageChange(page - 1)} disabled={page === 1}>Previous</button>
                    <span className="page-numbers">
                      {Array.from({ length: Math.min(farmerResults.totalPages, 5) }, (_, i) => {
                        let pageNum;
                        if (farmerResults.totalPages <= 5) pageNum = i + 1;
                        else if (page <= 3) pageNum = i + 1;
                        else if (page >= farmerResults.totalPages - 2) pageNum = farmerResults.totalPages - 4 + i;
                        else pageNum = page - 2 + i;
                        return (
                          <button
                            key={pageNum}
                            className={pageNum === page ? 'active' : ''}
                            onClick={() => handlePageChange(pageNum)}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </span>
                    <button onClick={() => handlePageChange(page + 1)} disabled={page === farmerResults.totalPages}>Next</button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && searchMode === 'farmers' && selectedFarmer && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Farmer Details</h3>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>
            {isLoading ? (
              <div className="loading">Loading details...</div>
            ) : (
              <div className="modal-body">
                <div className="detail-section">
                  <h4>Basic Information</h4>
                  <p><strong>Name:</strong> {selectedFarmer.farmer.name}</p>
                  <p><strong>Mobile:</strong> {selectedFarmer.farmer.mobile}</p>
                  {selectedFarmer.farmer.location && (
                    <>
                      <p><strong>Village:</strong> {selectedFarmer.farmer.location.village}</p>
                      <p><strong>District:</strong> {selectedFarmer.farmer.location.district}</p>
                      <p><strong>State:</strong> {selectedFarmer.farmer.location.state}</p>
                    </>
                  )}
                </div>
                {selectedFarmer.farmer.farmerDetails && (
                  <div className="detail-section">
                    <h4>Farming Details</h4>
                    <p><strong>Farm Size:</strong> {selectedFarmer.farmer.farmerDetails.farmSize} acres</p>
                    <p><strong>Farming Type:</strong> {selectedFarmer.farmer.farmerDetails.farmingType}</p>
                  </div>
                )}
                {selectedFarmer.crops && selectedFarmer.crops.length > 0 && (
                  <div className="detail-section">
                    <h4>Active Crops ({selectedFarmer.crops.length})</h4>
                    <div className="crops-list">
                      {selectedFarmer.crops.map((crop: any) => (
                        <div key={crop._id} className="crop-item">
                          <p><strong>{crop.name}</strong></p>
                          <p>Quantity: {crop.quantity?.value} {crop.quantity?.unit}</p>
                          <p>Price: ₹{crop.price?.value}/{crop.price?.unit}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {showDetailModal && searchMode === 'crops' && selectedCrop && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedCrop.name}</h3>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <div className="detail-grid">
                  <div><strong>Category:</strong> {selectedCrop.category}</div>
                  <div><strong>Quality:</strong> {selectedCrop.quality || 'Standard'}</div>
                  <div><strong>Price:</strong> ₹{selectedCrop.price.value}/{selectedCrop.price.unit}</div>
                  <div><strong>Quantity:</strong> {selectedCrop.quantity.value} {selectedCrop.quantity.unit}</div>
                </div>
              </div>
              {selectedCrop.description && (
                <div className="detail-section">
                  <h4>Description</h4>
                  <p>{selectedCrop.description}</p>
                </div>
              )}
              <div className="detail-section">
                <h4>Availability</h4>
                <p><strong>From:</strong> {formatDate(selectedCrop.availableFrom)}</p>
                <p><strong>To:</strong> {formatDate(selectedCrop.availableTo)}</p>
              </div>
              <div className="detail-section">
                <h4>Pickup Location</h4>
                <p>{selectedCrop.pickupLocation.village}, {selectedCrop.pickupLocation.district}</p>
              </div>
              <div className="detail-section">
                <h4>Farmer Details</h4>
                <p><strong>Name:</strong> {selectedCrop.farmer.name}</p>
                <p><strong>Mobile:</strong> {selectedCrop.farmer.mobile}</p>
              </div>
              <div className="modal-actions">
                <button className="btn-request">Send Request</button>
                <button className="btn-contact">Contact Farmer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedSearch;
