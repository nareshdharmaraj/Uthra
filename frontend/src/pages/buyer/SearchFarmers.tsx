import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { searchFarmers, fetchFarmerDetails, clearSelectedFarmer } from '../../features/buyer/buyerSlice';
import './SearchFarmers.css';

const SearchFarmers: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { searchResults, isFarmersLoading, selectedFarmer, isLoading } = useSelector(
    (state: RootState) => state.buyer
  );

  const [searchParams, setSearchParams] = useState({
    searchTerm: '',
    district: '',
    state: '',
    farmingType: '',
    hasActiveCrops: false,
    page: 1,
    limit: 20
  });

  const [showFarmerModal, setShowFarmerModal] = useState(false);

  const handleSearch = () => {
    dispatch(searchFarmers(searchParams));
  };

  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setSearchParams(prev => ({ ...prev, [name]: checked }));
    } else {
      setSearchParams(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams(prev => ({ ...prev, page: newPage }));
    dispatch(searchFarmers({ ...searchParams, page: newPage }));
  };

  const handleViewFarmer = (farmerId: string) => {
    dispatch(fetchFarmerDetails(farmerId));
    setShowFarmerModal(true);
  };

  const handleCloseModal = () => {
    setShowFarmerModal(false);
    dispatch(clearSelectedFarmer());
  };

  return (
    <div className="search-farmers">
      <h2>Search Farmers</h2>

      {/* Search Filters */}
      <div className="search-filters">
        <div className="filter-row">
          <div className="filter-group">
            <input
              type="text"
              name="searchTerm"
              placeholder="Search by name, village, or district..."
              value={searchParams.searchTerm}
              onChange={handleInputChange}
            />
          </div>
          <div className="filter-group">
            <input
              type="text"
              name="district"
              placeholder="District"
              value={searchParams.district}
              onChange={handleInputChange}
            />
          </div>
          <div className="filter-group">
            <input
              type="text"
              name="state"
              placeholder="State"
              value={searchParams.state}
              onChange={handleInputChange}
            />
          </div>
          <div className="filter-group">
            <select
              name="farmingType"
              value={searchParams.farmingType}
              onChange={handleInputChange}
            >
              <option value="">All Farming Types</option>
              <option value="organic">Organic</option>
              <option value="conventional">Conventional</option>
              <option value="mixed">Mixed</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        <div className="filter-row">
          <div className="filter-group checkbox-filter">
            <label>
              <input
                type="checkbox"
                name="hasActiveCrops"
                checked={searchParams.hasActiveCrops}
                onChange={handleInputChange}
              />
              Only farmers with active crops
            </label>
          </div>
          <button className="btn-search" onClick={handleSearch} disabled={isFarmersLoading}>
            {isFarmersLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Search Results */}
      <div className="search-results">
        <div className="results-header">
          <h3>Found {searchResults.total} farmers</h3>
          <span className="page-info">
            Page {searchResults.currentPage} of {searchResults.totalPages}
          </span>
        </div>

        {isFarmersLoading ? (
          <div className="loading">Loading farmers...</div>
        ) : (
          <>
            <div className="farmers-grid">
              {searchResults.farmers.map((farmer: any) => (
                <div key={farmer._id} className="farmer-card">
                  <div className="farmer-header">
                    <h4>{farmer.name}</h4>
                    <span className="crops-badge">{farmer.activeCrops || 0} crops</span>
                  </div>
                  <div className="farmer-details">
                    <p>
                      <strong>Mobile:</strong> {farmer.mobile}
                    </p>
                    {farmer.location?.village && (
                      <p>
                        <strong>Location:</strong> {farmer.location.village}
                        {farmer.location.district && `, ${farmer.location.district}`}
                      </p>
                    )}
                    {farmer.farmerDetails?.farmingType && (
                      <p>
                        <strong>Farming Type:</strong>{' '}
                        <span className="farming-type">
                          {farmer.farmerDetails.farmingType}
                        </span>
                      </p>
                    )}
                    {farmer.farmerDetails?.farmSize && (
                      <p>
                        <strong>Farm Size:</strong> {farmer.farmerDetails.farmSize} acres
                      </p>
                    )}
                  </div>
                  <button
                    className="btn-view"
                    onClick={() => handleViewFarmer(farmer._id)}
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>

            {searchResults.farmers.length === 0 && (
              <div className="no-results">
                <p>No farmers found matching your search criteria.</p>
              </div>
            )}

            {/* Pagination */}
            {searchResults.totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => handlePageChange(searchParams.page - 1)}
                  disabled={searchParams.page === 1}
                >
                  Previous
                </button>
                <span className="page-numbers">
                  {Array.from({ length: searchResults.totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      className={page === searchParams.page ? 'active' : ''}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  ))}
                </span>
                <button
                  onClick={() => handlePageChange(searchParams.page + 1)}
                  disabled={searchParams.page === searchResults.totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Farmer Details Modal */}
      {showFarmerModal && selectedFarmer && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Farmer Details</h3>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>
            
            {isLoading ? (
              <div className="loading">Loading farmer details...</div>
            ) : (
              <div className="modal-body">
                <div className="detail-section">
                  <h4>Basic Information</h4>
                  <p><strong>Name:</strong> {selectedFarmer.farmer.name}</p>
                  <p><strong>Mobile:</strong> {selectedFarmer.farmer.mobile}</p>
                  {selectedFarmer.farmer.location && (
                    <>
                      <p><strong>Address:</strong> {selectedFarmer.farmer.location.address}</p>
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
                    <p><strong>Preferred Language:</strong> {selectedFarmer.farmer.farmerDetails.preferredLanguage}</p>
                  </div>
                )}

                {selectedFarmer.crops && selectedFarmer.crops.length > 0 && (
                  <div className="detail-section">
                    <h4>Active Crops ({selectedFarmer.crops.length})</h4>
                    <div className="crops-list">
                      {selectedFarmer.crops.map((crop: any) => (
                        <div key={crop._id} className="crop-item">
                          <p><strong>{crop.name}</strong></p>
                          <p>Category: {crop.category}</p>
                          <p>Quantity: {crop.quantity?.value} {crop.quantity?.unit}</p>
                          <p>Price: ₹{crop.price?.value}/{crop.price?.unit}</p>
                          {crop.quality && <p>Quality: {crop.quality}</p>}
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
    </div>
  );
};

export default SearchFarmers;
