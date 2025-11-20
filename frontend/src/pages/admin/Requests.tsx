import React, { useEffect, useState } from 'react';
import { adminService } from '../../services';
import '../../styles/Admin.css';
import CounterCard from '../../components/common/CounterCard';

interface Request {
  _id: string;
  crop: any;
  buyer: any;
  farmer: any;
  requestedQuantity: any;
  offeredPrice: any;
  status: string;
  counterOffer?: any;
  finalAgreement?: any;
  createdAt: string;
  updatedAt: string;
}

const Requests: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: ''
  });
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line
  }, [filters]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filters.status) params.status = filters.status;
      
      const response = await adminService.getAllRequests(params);
      setRequests(response.data || []);
      setError('');
    } catch (error: any) {
      console.error('Error fetching requests:', error);
      setError(error.response?.data?.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const openModal = (request: Request) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
  };

  const getQuantity = (qty: any) => {
    if (!qty) return 'N/A';
    return typeof qty === 'object' ? `${qty.value} ${qty.unit}` : qty;
  };

  const getPrice = (price: any) => {
    if (!price) return 'N/A';
    return typeof price === 'object' ? `₹${price.value}/${price.unit}` : `₹${price}`;
  };

  if (loading) {
    return (
      <div className="admin-home">
        <div className="loading-spinner">Loading requests...</div>
      </div>
    );
  }

  return (
    <div className="admin-home">
      <div className="admin-header">
        <h1>Request Management</h1>
        <p>Monitor and manage all crop purchase requests</p>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-grid">
          <div className="filter-group">
            <label>Status</label>
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <CounterCard
          icon="📋"
          title="Total Requests"
          value={requests.length}
          subtitle="All purchase requests"
          color="#3498db"
        />
        <CounterCard
          icon="⏳"
          title="Pending"
          value={requests.filter(r => r.status === 'pending').length}
          subtitle="Awaiting response"
          color="#f39c12"
        />
        <CounterCard
          icon="✅"
          title="Confirmed"
          value={requests.filter(r => r.status === 'confirmed').length}
          subtitle="Accepted by farmers"
          color="#27ae60"
        />
        <CounterCard
          icon="🎉"
          title="Completed"
          value={requests.filter(r => r.status === 'completed').length}
          subtitle="Successfully finished"
          color="#9b59b6"
        />
      </div>

      {/* Requests Table */}
      {requests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No Requests Found</h3>
          <p>There are no crop purchase requests at the moment.</p>
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Crop</th>
                <th>Buyer</th>
                <th>Farmer</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request._id}>
                  <td><strong>{request.crop?.cropType || request.crop?.name || 'Unknown'}</strong></td>
                  <td>
                    <div>
                      <div style={{ fontWeight: 600 }}>{request.buyer?.name || 'N/A'}</div>
                      <div style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>
                        {request.buyer?.phone || request.buyer?.mobile || ''}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <div style={{ fontWeight: 600 }}>{request.farmer?.name || 'N/A'}</div>
                      <div style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>
                        {request.farmer?.phone || request.farmer?.mobile || ''}
                      </div>
                    </div>
                  </td>
                  <td>{getQuantity(request.requestedQuantity)}</td>
                  <td>{getPrice(request.offeredPrice)}</td>
                  <td>
                    <span className={`status-badge ${request.status}`}>
                      {request.status}
                    </span>
                  </td>
                  <td>{new Date(request.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button 
                      className="table-btn view" 
                      onClick={() => openModal(request)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && selectedRequest && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Request Details</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <strong>Crop:</strong> {selectedRequest.crop?.cropType || selectedRequest.crop?.name || 'Unknown'}
                </div>
                <div>
                  <strong>Category:</strong> {selectedRequest.crop?.category || 'N/A'}
                </div>
                <div>
                  <strong>Buyer:</strong> {selectedRequest.buyer?.name} ({selectedRequest.buyer?.phone || selectedRequest.buyer?.mobile})
                </div>
                <div>
                  <strong>Buyer Type:</strong> {selectedRequest.buyer?.buyerType || 'N/A'}
                </div>
                <div>
                  <strong>Farmer:</strong> {selectedRequest.farmer?.name} ({selectedRequest.farmer?.phone || selectedRequest.farmer?.mobile})
                </div>
                <div>
                  <strong>Requested Quantity:</strong> {getQuantity(selectedRequest.requestedQuantity)}
                </div>
                <div>
                  <strong>Offered Price:</strong> {getPrice(selectedRequest.offeredPrice)}
                </div>
                {selectedRequest.counterOffer && (
                  <>
                    <div>
                      <strong>Counter Offer Quantity:</strong> {getQuantity(selectedRequest.counterOffer.quantity)}
                    </div>
                    <div>
                      <strong>Counter Offer Price:</strong> {getPrice(selectedRequest.counterOffer.price)}
                    </div>
                  </>
                )}
                {selectedRequest.finalAgreement && (
                  <>
                    <div>
                      <strong>Final Quantity:</strong> {getQuantity(selectedRequest.finalAgreement.quantity)}
                    </div>
                    <div>
                      <strong>Final Price:</strong> {getPrice(selectedRequest.finalAgreement.price)}
                    </div>
                  </>
                )}
                <div>
                  <strong>Status:</strong> <span className={`status-badge ${selectedRequest.status}`}>{selectedRequest.status}</span>
                </div>
                <div>
                  <strong>Created:</strong> {new Date(selectedRequest.createdAt).toLocaleString()}
                </div>
                <div>
                  <strong>Last Updated:</strong> {new Date(selectedRequest.updatedAt).toLocaleString()}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-btn cancel" onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Requests;
