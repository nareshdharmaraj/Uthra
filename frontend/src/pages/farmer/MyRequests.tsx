import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import './MyRequests.css';

interface Request {
  _id: string;
  buyer: {
    _id: string;
    name: string;
    mobile: string;
  };
  crop: {
    _id: string;
    name: string;
    category: string;
  };
  requestedQuantity: {
    value: number;
    unit: string;
  };
  offeredPrice: {
    value: number;
    unit: string;
  };
  status: string;
  message?: string;
  createdAt: string;
  updatedAt: string;
}

const MyRequests: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [counterOffer, setCounterOffer] = useState({ value: '', unit: 'per_kg' });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/farmers/requests');
      setRequests(response.data.data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    if (!window.confirm('Are you sure you want to accept this request?')) return;

    try {
      await api.put(`/farmers/requests/${requestId}/accept`);
      fetchRequests();
    } catch (error) {
      console.error('Error accepting request:', error);
      alert('Failed to accept request. Please try again.');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    if (!window.confirm('Are you sure you want to reject this request?')) return;

    try {
      await api.put(`/farmers/requests/${requestId}/reject`);
      fetchRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request. Please try again.');
    }
  };

  const handleCounterOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    try {
      const offerData = {
        offeredPrice: {
          value: parseFloat(counterOffer.value),
          unit: counterOffer.unit
        }
      };

      await api.put(`/farmers/requests/${selectedRequest._id}/counter`, offerData);
      setSelectedRequest(null);
      setCounterOffer({ value: '', unit: 'per_kg' });
      fetchRequests();
    } catch (error) {
      console.error('Error sending counter offer:', error);
      alert('Failed to send counter offer. Please try again.');
    }
  };

  const filteredRequests = requests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  const getStatusBadge = (status: string) => {
    const badges: any = {
      pending: { text: 'Pending', color: '#FF9800' },
      accepted: { text: 'Accepted', color: '#4CAF50' },
      rejected: { text: 'Rejected', color: '#f44336' },
      counter_offered: { text: 'Counter Offered', color: '#2196F3' },
      completed: { text: 'Completed', color: '#9C27B0' }
    };
    const badge = badges[status] || badges.pending;
    return <span className="status-badge" style={{ backgroundColor: badge.color }}>{badge.text}</span>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="my-requests">
      <div className="requests-header">
        <div>
          <h1>My Requests 📬</h1>
          <p>View and manage buyer requests for your crops</p>
        </div>
      </div>

      <div className="requests-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({requests.length})
        </button>
        <button 
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({requests.filter(r => r.status === 'pending').length})
        </button>
        <button 
          className={`filter-btn ${filter === 'accepted' ? 'active' : ''}`}
          onClick={() => setFilter('accepted')}
        >
          Accepted ({requests.filter(r => r.status === 'accepted').length})
        </button>
        <button 
          className={`filter-btn ${filter === 'counter_offered' ? 'active' : ''}`}
          onClick={() => setFilter('counter_offered')}
        >
          Counter Offers ({requests.filter(r => r.status === 'counter_offered').length})
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Loading requests...</div>
      ) : filteredRequests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No requests found</h3>
          <p>You haven't received any buyer requests yet</p>
        </div>
      ) : (
        <div className="requests-grid">
          {filteredRequests.map((request) => (
            <div key={request._id} className="request-card">
              <div className="request-card-header">
                <div>
                  <h3>{request.crop.name}</h3>
                  <p className="request-category">{request.crop.category}</p>
                </div>
                {getStatusBadge(request.status)}
              </div>

              <div className="request-card-body">
                <div className="request-section">
                  <h4>Buyer Information</h4>
                  <div className="request-info">
                    <span className="request-label">Name:</span>
                    <span className="request-value">{request.buyer.name}</span>
                  </div>
                  <div className="request-info">
                    <span className="request-label">Mobile:</span>
                    <span className="request-value">{request.buyer.mobile}</span>
                  </div>
                </div>

                <div className="request-section">
                  <h4>Request Details</h4>
                  <div className="request-info">
                    <span className="request-label">Quantity:</span>
                    <span className="request-value">{request.requestedQuantity.value} {request.requestedQuantity.unit}</span>
                  </div>
                  <div className="request-info">
                    <span className="request-label">Offered Price:</span>
                    <span className="request-value">₹{request.offeredPrice.value} {request.offeredPrice.unit}</span>
                  </div>
                  {request.message && (
                    <div className="request-message">
                      <span className="request-label">Message:</span>
                      <p>{request.message}</p>
                    </div>
                  )}
                </div>

                <div className="request-date">
                  Requested on: {formatDate(request.createdAt)}
                </div>
              </div>

              {request.status === 'pending' && (
                <div className="request-card-footer">
                  <button className="btn-accept" onClick={() => handleAcceptRequest(request._id)}>
                    ✓ Accept
                  </button>
                  <button 
                    className="btn-counter" 
                    onClick={() => {
                      setSelectedRequest(request);
                      setCounterOffer({ 
                        value: request.offeredPrice.value.toString(), 
                        unit: request.offeredPrice.unit 
                      });
                    }}
                  >
                    💰 Counter Offer
                  </button>
                  <button className="btn-reject" onClick={() => handleRejectRequest(request._id)}>
                    ✗ Reject
                  </button>
                </div>
              )}

              {request.status === 'accepted' && (
                <div className="request-status-message success">
                  ✓ Request accepted! Contact the buyer to proceed with the transaction.
                </div>
              )}

              {request.status === 'rejected' && (
                <div className="request-status-message error">
                  ✗ Request rejected
                </div>
              )}

              {request.status === 'counter_offered' && (
                <div className="request-status-message info">
                  💰 Counter offer sent. Waiting for buyer's response.
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Counter Offer Modal */}
      {selectedRequest && (
        <div className="modal-overlay" onClick={() => setSelectedRequest(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Send Counter Offer</h2>
              <button className="modal-close" onClick={() => setSelectedRequest(null)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleCounterOffer} className="counter-offer-form">
              <div className="current-offer">
                <h4>Current Offer</h4>
                <p className="offer-price">
                  ₹{selectedRequest.offeredPrice.value} {selectedRequest.offeredPrice.unit}
                </p>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Your Counter Offer Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={counterOffer.value}
                    onChange={(e) => setCounterOffer({...counterOffer, value: e.target.value})}
                    required
                    placeholder="Enter your price"
                  />
                </div>
                <div className="form-group">
                  <label>Price Unit *</label>
                  <select
                    value={counterOffer.unit}
                    onChange={(e) => setCounterOffer({...counterOffer, unit: e.target.value})}
                    required
                  >
                    <option value="per_kg">Per Kg</option>
                    <option value="per_quintal">Per Quintal</option>
                    <option value="per_ton">Per Ton</option>
                    <option value="per_bag">Per Bag</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setSelectedRequest(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Send Counter Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRequests;
