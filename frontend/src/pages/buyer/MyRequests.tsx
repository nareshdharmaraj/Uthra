import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import './MyRequests.css';

interface Request {
  _id: string;
  crop: {
    _id: string;
    name: string;
    category: string;
    price: { value: number; unit: string };
    quantity?: { value: number; unit: string };
  };
  farmer: {
    _id: string;
    name: string;
    mobile: string;
    location?: { district?: string; state?: string };
  };
  requestedQuantity: { value: number; unit: string };
  offeredPrice: { value: number; unit: string };
  buyerNote?: string;
  farmerNote?: string;
  status: 'pending' | 'viewed' | 'farmer_accepted' | 'farmer_rejected' | 'farmer_countered' | 'buyer_accepted' | 'buyer_rejected' | 'confirmed' | 'in_transit' | 'completed' | 'cancelled' | 'expired';
  counterOffer?: { 
    price: { value: number; unit: string }; 
    quantity?: { value: number; unit: string };
    note?: string;
    offeredAt?: string;
  };
  createdAt: string;
  updatedAt: string;
}

const MyRequests: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, currentPage: 1, totalPages: 0 });

  useEffect(() => {
    fetchRequests();
  }, []);

  const filterRequests = () => {
    if (selectedStatus === 'all') {
      setFilteredRequests(requests);
    } else if (selectedStatus === 'accepted') {
      setFilteredRequests(requests.filter(r => 
        r.status === 'farmer_accepted' || 
        r.status === 'buyer_accepted' || 
        r.status === 'confirmed'
      ));
    } else if (selectedStatus === 'pending') {
      setFilteredRequests(requests.filter(r => r.status === 'pending' || r.status === 'viewed'));
    } else if (selectedStatus === 'farmer_countered') {
      setFilteredRequests(requests.filter(r => r.status === 'farmer_countered'));
    } else if (selectedStatus === 'rejected') {
      setFilteredRequests(requests.filter(r => r.status === 'farmer_rejected' || r.status === 'buyer_rejected'));
    } else if (selectedStatus === 'cancelled') {
      setFilteredRequests(requests.filter(r => r.status === 'cancelled' || r.status === 'expired'));
    } else if (selectedStatus === 'completed') {
      setFilteredRequests(requests.filter(r => r.status === 'completed' || r.status === 'in_transit'));
    } else {
      setFilteredRequests(requests.filter(req => req.status === selectedStatus));
    }
  };

  useEffect(() => {
    filterRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStatus, requests]);

  const fetchRequests = async (page = 1) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get(`/buyers/requests?page=${page}&limit=20`);
      setRequests(response.data.data);
      setPagination({
        total: response.data.total,
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (request: Request) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedRequest(null);
  };

  const handleAcceptCounterOffer = async (requestId: string) => {
    if (!window.confirm('Are you sure you want to accept this counter offer?')) {
      return;
    }

    try {
      await api.put(`/buyers/requests/${requestId}/accept`);
      alert('Counter offer accepted successfully!');
      fetchRequests(pagination.currentPage);
      setShowDetailModal(false);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to accept counter offer';
      setError(errorMessage);
      alert(errorMessage);
      console.error('Accept counter offer error:', err);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    if (window.confirm('Are you sure you want to cancel this request?')) {
      try {
        await api.put(`/buyers/requests/${requestId}/cancel`);
        fetchRequests(pagination.currentPage);
        setShowDetailModal(false);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to cancel request');
      }
    }
  };

  const getStatusBadgeClass = (status: string) => {
    const statusClasses: { [key: string]: string } = {
      pending: 'status-pending',
      viewed: 'status-pending',
      farmer_accepted: 'status-accepted',
      buyer_accepted: 'status-accepted',
      confirmed: 'status-accepted',
      farmer_rejected: 'status-rejected',
      buyer_rejected: 'status-rejected',
      rejected: 'status-rejected',
      farmer_countered: 'status-counter',
      cancelled: 'status-cancelled',
      completed: 'status-completed',
      in_transit: 'status-completed',
      expired: 'status-cancelled'
    };
    return statusClasses[status] || 'status-pending';
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      pending: 'Pending',
      viewed: 'Viewed',
      farmer_accepted: 'Accepted by Farmer',
      farmer_rejected: 'Rejected by Farmer',
      farmer_countered: 'Counter Offer',
      buyer_accepted: 'Accepted by You',
      buyer_rejected: 'Rejected by You',
      confirmed: 'Confirmed',
      in_transit: 'In Transit',
      completed: 'Completed',
      cancelled: 'Cancelled',
      expired: 'Expired'
    };
    return labels[status] || status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePageChange = (newPage: number) => {
    fetchRequests(newPage);
  };

  const getRequestStats = () => {
    const stats = {
      all: requests.length,
      pending: requests.filter(r => r.status === 'pending' || r.status === 'viewed').length,
      accepted: requests.filter(r => r.status === 'farmer_accepted' || r.status === 'buyer_accepted' || r.status === 'confirmed').length,
      farmer_countered: requests.filter(r => r.status === 'farmer_countered').length,
      rejected: requests.filter(r => r.status === 'farmer_rejected' || r.status === 'buyer_rejected').length,
      cancelled: requests.filter(r => r.status === 'cancelled' || r.status === 'expired').length,
      completed: requests.filter(r => r.status === 'completed' || r.status === 'in_transit').length
    };
    return stats;
  };

  const stats = getRequestStats();

  return (
    <div className="my-requests">
      <div className="header">
        <h2>My Requests</h2>
        <button className="btn-refresh" onClick={() => fetchRequests(pagination.currentPage)}>
          🔄 Refresh
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Status Filter */}
      <div className="status-filter">
        <button
          className={selectedStatus === 'all' ? 'active' : ''}
          onClick={() => setSelectedStatus('all')}
        >
          All ({stats.all})
        </button>
        <button
          className={selectedStatus === 'pending' ? 'active' : ''}
          onClick={() => setSelectedStatus('pending')}
        >
          Pending ({stats.pending})
        </button>
        <button
          className={selectedStatus === 'farmer_countered' ? 'active' : ''}
          onClick={() => setSelectedStatus('farmer_countered')}
        >
          Counter Offers ({stats.farmer_countered})
        </button>
        <button
          className={selectedStatus === 'accepted' ? 'active' : ''}
          onClick={() => setSelectedStatus('accepted')}
        >
          Accepted ({stats.accepted})
        </button>
        <button
          className={selectedStatus === 'completed' ? 'active' : ''}
          onClick={() => setSelectedStatus('completed')}
        >
          Completed ({stats.completed})
        </button>
        <button
          className={selectedStatus === 'rejected' ? 'active' : ''}
          onClick={() => setSelectedStatus('rejected')}
        >
          Rejected ({stats.rejected})
        </button>
      </div>

      {isLoading ? (
        <div className="loading">Loading requests...</div>
      ) : (
        <>
          {filteredRequests.length === 0 ? (
            <div className="empty-state">
              <p>
                {selectedStatus === 'all' 
                  ? "You haven't made any requests yet." 
                  : `No ${selectedStatus} requests found.`}
              </p>
            </div>
          ) : (
            <div className="requests-list">
              {filteredRequests.map((request) => (
                <div key={request._id} className="request-card">
                  <div className="card-header">
                    <div className="crop-info">
                      <h3>{request.crop?.name || 'Crop N/A'}</h3>
                      <span className="category">{request.crop?.category || 'N/A'}</span>
                    </div>
                    <span className={`status-badge ${getStatusBadgeClass(request.status)}`}>
                      {getStatusLabel(request.status)}
                    </span>
                  </div>

                  <div className="card-body">
                    <div className="info-row">
                      <div className="info-item">
                        <strong>Farmer:</strong> {request.farmer?.name || 'N/A'}
                      </div>
                      <div className="info-item">
                        <strong>Location:</strong> {request.farmer?.location?.district || 'N/A'}
                      </div>
                    </div>

                    <div className="info-row">
                      <div className="info-item">
                        <strong>Requested Qty:</strong> {request.requestedQuantity.value} {request.requestedQuantity.unit}
                      </div>
                      <div className="info-item">
                        <strong>Offered Price:</strong> ₹{request.offeredPrice.value}/{request.offeredPrice.unit}
                      </div>
                    </div>

                    {request.counterOffer && (
                      <div className="counter-offer-section">
                        <strong>Counter Offer:</strong> ₹{request.counterOffer.price.value}/{request.counterOffer.price.unit}
                        {request.counterOffer.note && <p className="counter-message">{request.counterOffer.note}</p>}
                      </div>
                    )}

                    <div className="request-meta">
                      <span>Requested on {formatDate(request.createdAt)}</span>
                    </div>
                  </div>

                  <div className="card-actions">
                    <button className="btn-view" onClick={() => handleViewDetails(request)}>
                      View Details
                    </button>
                    {request.status === 'farmer_countered' && (
                      <button 
                        className="btn-accept" 
                        onClick={() => handleAcceptCounterOffer(request._id)}
                      >
                        Accept Counter Offer
                      </button>
                    )}
                    {(request.status === 'pending' || request.status === 'farmer_countered') && (
                      <button 
                        className="btn-cancel" 
                        onClick={() => handleCancelRequest(request._id)}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => handlePageChange(pagination.currentPage - 1)} 
                disabled={pagination.currentPage === 1}
              >
                Previous
              </button>
              <span className="page-info">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button 
                onClick={() => handlePageChange(pagination.currentPage + 1)} 
                disabled={pagination.currentPage === pagination.totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Request Details</h3>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>

            <div className="modal-body">
              <div className="detail-section">
                <h4>Status</h4>
                <span className={`status-badge large ${getStatusBadgeClass(selectedRequest.status)}`}>
                  {getStatusLabel(selectedRequest.status)}
                </span>
              </div>

              <div className="detail-section">
                <h4>Crop Information</h4>
                <p><strong>Name:</strong> {selectedRequest.crop?.name || 'N/A'}</p>
                <p><strong>Category:</strong> {selectedRequest.crop?.category || 'N/A'}</p>
                <p><strong>Farmer's Price:</strong> ₹{selectedRequest.crop?.price?.value || 0}/{selectedRequest.crop?.price?.unit || 'unit'}</p>
                {selectedRequest.crop?.quantity && (
                  <p><strong>Available Quantity:</strong> {selectedRequest.crop.quantity.value} {selectedRequest.crop.quantity.unit}</p>
                )}
              </div>

              <div className="detail-section">
                <h4>Your Request</h4>
                <p><strong>Requested Quantity:</strong> {selectedRequest.requestedQuantity.value} {selectedRequest.requestedQuantity.unit}</p>
                <p><strong>Offered Price:</strong> ₹{selectedRequest.offeredPrice.value}/{selectedRequest.offeredPrice.unit}</p>
                {selectedRequest.buyerNote && (
                  <p><strong>Message:</strong> {selectedRequest.buyerNote}</p>
                )}
              </div>

              {selectedRequest.counterOffer && (
                <div className="detail-section counter-offer-detail">
                  <h4>Counter Offer from Farmer</h4>
                  <p><strong>Counter Price:</strong> ₹{selectedRequest.counterOffer.price.value}/{selectedRequest.counterOffer.price.unit}</p>
                  {selectedRequest.counterOffer.note && (
                    <p><strong>Farmer's Message:</strong> {selectedRequest.counterOffer.note}</p>
                  )}
                </div>
              )}

              <div className="detail-section">
                <h4>Farmer Details</h4>
                <p><strong>Name:</strong> {selectedRequest.farmer.name}</p>
                <p><strong>Mobile:</strong> {selectedRequest.farmer.mobile}</p>
                {selectedRequest.farmer.location && (
                  <>
                    <p><strong>District:</strong> {selectedRequest.farmer.location.district}</p>
                    <p><strong>State:</strong> {selectedRequest.farmer.location.state}</p>
                  </>
                )}
              </div>

              <div className="detail-section">
                <h4>Timeline</h4>
                <p><strong>Requested:</strong> {formatDate(selectedRequest.createdAt)}</p>
                <p><strong>Last Updated:</strong> {formatDate(selectedRequest.updatedAt)}</p>
              </div>

              <div className="modal-actions">
                {selectedRequest.status === 'farmer_countered' && (
                  <button 
                    className="btn-accept" 
                    onClick={() => handleAcceptCounterOffer(selectedRequest._id)}
                  >
                    Accept Counter Offer
                  </button>
                )}
                {(selectedRequest.status === 'pending' || selectedRequest.status === 'farmer_countered') && (
                  <button 
                    className="btn-cancel" 
                    onClick={() => handleCancelRequest(selectedRequest._id)}
                  >
                    Cancel Request
                  </button>
                )}
                <button className="btn-contact">Contact Farmer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRequests;
