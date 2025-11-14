import React, { useState, useEffect } from 'react';
import { searchCrops, browseCrops } from '../../services/buyerService';
import './SearchCrops.css';

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
  quality?: string;
  description?: string;
  availableFrom: string;
  availableTo: string;
  pickupLocation: {
    village?: string;
    district?: string;
  };
  farmer: {
    _id: string;
    name: string;
    mobile: string;
  };
  viewCount?: number;
  requestCount?: number;
}

const SearchCrops: React.FC = () => {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [searchParams, setSearchParams] = useState({
    searchTerm: '',
    category: '',
    district: '',
    minPrice: '',
    maxPrice: '',
    page: 1,
    limit: 20
  });

  const [pagination, setPagination] = useState({
    total: 0,
    currentPage: 1,
    totalPages: 0
  });

  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);

  useEffect(() => {
    handleBrowse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBrowse = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await browseCrops({
        category: searchParams.category || undefined,
        district: searchParams.district || undefined,
        minPrice: searchParams.minPrice ? parseFloat(searchParams.minPrice) : undefined,
        maxPrice: searchParams.maxPrice ? parseFloat(searchParams.maxPrice) : undefined,
        page: searchParams.page,
        limit: searchParams.limit
      });
      
      setCrops(response.data);
      setPagination({
        total: response.total,
        currentPage: response.currentPage,
        totalPages: response.totalPages
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch crops');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const filters: any = {};
      if (searchParams.category) filters.category = searchParams.category;
      if (searchParams.district) filters.district = searchParams.district;

      const response = await searchCrops({
        searchTerm: searchParams.searchTerm || undefined,
        filters: Object.keys(filters).length > 0 ? filters : undefined,
        page: searchParams.page,
        limit: searchParams.limit
      });
      
      setCrops(response.data);
      setPagination({
        total: response.total,
        currentPage: response.currentPage,
        totalPages: response.totalPages
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to search crops');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams(prev => ({ ...prev, page: newPage }));
    if (searchParams.searchTerm) {
      searchCrops({ ...searchParams, page: newPage });
    } else {
      handleBrowse();
    }
  };

  const handleViewCrop = (crop: Crop) => {
    setSelectedCrop(crop);
    setShowCropModal(true);
  };

  const handleCloseModal = () => {
    setShowCropModal(false);
    setSelectedCrop(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="search-crops">
      <h2>Browse & Search Crops</h2>

      {/* Search Filters */}
      <div className="search-filters">
        <div className="filter-row">
          <div className="filter-group">
            <input
              type="text"
              name="searchTerm"
              placeholder="Search crops by name or description..."
              value={searchParams.searchTerm}
              onChange={handleInputChange}
            />
          </div>
          <div className="filter-group">
            <select
              name="category"
              value={searchParams.category}
              onChange={handleInputChange}
            >
              <option value="">All Categories</option>
              <option value="vegetables">Vegetables</option>
              <option value="fruits">Fruits</option>
              <option value="grains">Grains</option>
              <option value="pulses">Pulses</option>
              <option value="spices">Spices</option>
              <option value="other">Other</option>
            </select>
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
        </div>
        <div className="filter-row">
          <div className="filter-group">
            <input
              type="number"
              name="minPrice"
              placeholder="Min Price (₹)"
              value={searchParams.minPrice}
              onChange={handleInputChange}
              min="0"
            />
          </div>
          <div className="filter-group">
            <input
              type="number"
              name="maxPrice"
              placeholder="Max Price (₹)"
              value={searchParams.maxPrice}
              onChange={handleInputChange}
              min="0"
            />
          </div>
          <button className="btn-search" onClick={searchParams.searchTerm ? handleSearch : handleBrowse} disabled={isLoading}>
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Search Results */}
      <div className="search-results">
        <div className="results-header">
          <h3>Found {pagination.total} crops</h3>
          <span className="page-info">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
        </div>

        {isLoading ? (
          <div className="loading">Loading crops...</div>
        ) : (
          <>
            <div className="crops-grid">
              {crops.map((crop) => (
                <div key={crop._id} className="crop-card">
                  <div className="crop-header">
                    <h4>{crop.name}</h4>
                    <span className="category-badge">{crop.category}</span>
                  </div>
                  <div className="crop-details">
                    <div className="price-info">
                      <span className="price">₹{crop.price.value}/{crop.price.unit}</span>
                      <span className="quantity">
                        {crop.quantity.value} {crop.quantity.unit} available
                      </span>
                    </div>
                    {crop.quality && (
                      <p>
                        <strong>Quality:</strong>{' '}
                        <span className="quality-badge">{crop.quality}</span>
                      </p>
                    )}
                    <p>
                      <strong>Location:</strong> {crop.pickupLocation.village}
                      {crop.pickupLocation.district && `, ${crop.pickupLocation.district}`}
                    </p>
                    <p>
                      <strong>Farmer:</strong> {crop.farmer.name}
                    </p>
                    <p>
                      <strong>Available until:</strong> {formatDate(crop.availableTo)}
                    </p>
                    {crop.description && (
                      <p className="description">{crop.description.substring(0, 80)}...</p>
                    )}
                    <div className="crop-stats">
                      <span>👁️ {crop.viewCount || 0} views</span>
                      <span>📋 {crop.requestCount || 0} requests</span>
                    </div>
                  </div>
                  <button
                    className="btn-view"
                    onClick={() => handleViewCrop(crop)}
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>

            {crops.length === 0 && (
              <div className="no-results">
                <p>No crops found matching your search criteria.</p>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => handlePageChange(searchParams.page - 1)}
                  disabled={searchParams.page === 1}
                >
                  Previous
                </button>
                <span className="page-numbers">
                  {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                    let page;
                    if (pagination.totalPages <= 5) {
                      page = i + 1;
                    } else if (searchParams.page <= 3) {
                      page = i + 1;
                    } else if (searchParams.page >= pagination.totalPages - 2) {
                      page = pagination.totalPages - 4 + i;
                    } else {
                      page = searchParams.page - 2 + i;
                    }
                    return (
                      <button
                        key={page}
                        className={page === searchParams.page ? 'active' : ''}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    );
                  })}
                </span>
                <button
                  onClick={() => handlePageChange(searchParams.page + 1)}
                  disabled={searchParams.page === pagination.totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Crop Details Modal */}
      {showCropModal && selectedCrop && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedCrop.name}</h3>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="detail-section">
                <div className="detail-grid">
                  <div>
                    <strong>Category:</strong> {selectedCrop.category}
                  </div>
                  <div>
                    <strong>Quality:</strong> {selectedCrop.quality || 'Standard'}
                  </div>
                  <div>
                    <strong>Price:</strong> ₹{selectedCrop.price.value}/{selectedCrop.price.unit}
                  </div>
                  <div>
                    <strong>Quantity:</strong> {selectedCrop.quantity.value} {selectedCrop.quantity.unit}
                  </div>
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

export default SearchCrops;
