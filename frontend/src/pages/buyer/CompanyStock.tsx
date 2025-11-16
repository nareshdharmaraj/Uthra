import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import './CompanyStock.css';

interface StockData {
  completedRequests: any[];
  stockByCrop: Array<{
    _id: { cropName: string; category: string };
    totalQuantity: number;
    totalValue: number;
    avgPrice: number;
    count: number;
    lastPurchased: string;
  }>;
  stockByCategory: Array<{
    _id: string;
    totalQuantity: number;
    totalValue: number;
    count: number;
  }>;
  summary: {
    totalTransactions: number;
    totalQuantity: number;
    totalValue: number;
    uniqueCrops: number;
  };
}

const CompanyStock: React.FC = () => {
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'crops' | 'categories' | 'transactions'>('crops');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/buyers/company/stock');
      setStockData(response.data.data);
    } catch (error: any) {
      console.error('Failed to fetch stock:', error);
      alert(error.response?.data?.message || 'Failed to load stock data');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCrops = stockData?.stockByCrop.filter(item =>
    item._id.cropName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item._id.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTransactions = stockData?.completedRequests.filter(req =>
    req.crop?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.farmer?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <div className="loading-container">Loading stock data...</div>;
  }

  if (!stockData) {
    return <div className="error-container">Failed to load stock data</div>;
  }

  return (
    <div className="company-stock">
      <div className="page-header">
        <div>
          <h1>📦 Company Stock & Inventory</h1>
          <p className="subtitle">Track your purchased crops and inventory</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="stock-summary">
        <div className="summary-card">
          <div className="summary-icon">🛒</div>
          <div className="summary-content">
            <h3>Total Transactions</h3>
            <p className="summary-number">{stockData.summary.totalTransactions}</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">⚖️</div>
          <div className="summary-content">
            <h3>Total Stock</h3>
            <p className="summary-number">{stockData.summary.totalQuantity.toLocaleString()} kg</p>
          </div>
        </div>
        <div className="summary-card highlight">
          <div className="summary-icon">💰</div>
          <div className="summary-content">
            <h3>Total Value</h3>
            <p className="summary-number">₹{stockData.summary.totalValue.toLocaleString()}</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon">🌾</div>
          <div className="summary-content">
            <h3>Unique Crops</h3>
            <p className="summary-number">{stockData.summary.uniqueCrops}</p>
          </div>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="view-tabs">
        <button
          className={`tab ${viewMode === 'crops' ? 'active' : ''}`}
          onClick={() => setViewMode('crops')}
        >
          By Crops
        </button>
        <button
          className={`tab ${viewMode === 'categories' ? 'active' : ''}`}
          onClick={() => setViewMode('categories')}
        >
          By Categories
        </button>
        <button
          className={`tab ${viewMode === 'transactions' ? 'active' : ''}`}
          onClick={() => setViewMode('transactions')}
        >
          All Transactions
        </button>
      </div>

      {/* Search Bar */}
      {(viewMode === 'crops' || viewMode === 'transactions') && (
        <div className="search-bar">
          <input
            type="text"
            placeholder={viewMode === 'crops' ? 'Search crops or categories...' : 'Search transactions...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      {/* Content Area */}
      <div className="stock-content">
        {viewMode === 'crops' && (
          <div className="crops-view">
            {filteredCrops && filteredCrops.length > 0 ? (
              <div className="crops-grid">
                {filteredCrops.map((item, index) => (
                  <div key={index} className="crop-card">
                    <div className="crop-header">
                      <h3>{item._id.cropName}</h3>
                      <span className="crop-category">{item._id.category}</span>
                    </div>
                    <div className="crop-stats">
                      <div className="stat-row">
                        <span className="stat-label">Total Quantity:</span>
                        <span className="stat-value">{item.totalQuantity.toLocaleString()} kg</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">Total Value:</span>
                        <span className="stat-value">₹{item.totalValue.toLocaleString()}</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">Avg Price:</span>
                        <span className="stat-value">₹{item.avgPrice.toFixed(2)}/kg</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">Purchases:</span>
                        <span className="stat-value">{item.count}</span>
                      </div>
                      <div className="stat-row">
                        <span className="stat-label">Last Purchased:</span>
                        <span className="stat-value">
                          {item.lastPurchased ? new Date(item.lastPurchased).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">No crops found</div>
            )}
          </div>
        )}

        {viewMode === 'categories' && (
          <div className="categories-view">
            {stockData.stockByCategory.length > 0 ? (
              <div className="categories-grid">
                {stockData.stockByCategory.map((item, index) => (
                  <div key={index} className="category-card">
                    <div className="category-icon">🌾</div>
                    <div className="category-info">
                      <h3>{item._id || 'Other'}</h3>
                      <div className="category-stats">
                        <div className="stat-item">
                          <span className="stat-label">Quantity:</span>
                          <span className="stat-value">{item.totalQuantity.toLocaleString()} kg</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Value:</span>
                          <span className="stat-value">₹{item.totalValue.toLocaleString()}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Transactions:</span>
                          <span className="stat-value">{item.count}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">No stock data available</div>
            )}
          </div>
        )}

        {viewMode === 'transactions' && (
          <div className="transactions-view">
            {filteredTransactions && filteredTransactions.length > 0 ? (
              <div className="transactions-table">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Crop</th>
                      <th>Farmer</th>
                      <th>Buyer</th>
                      <th>Quantity</th>
                      <th>Price/kg</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((req: any) => (
                      <tr key={req._id}>
                        <td>
                          {req.completedAt ? new Date(req.completedAt).toLocaleDateString() : 
                           new Date(req.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <strong>{req.crop?.name || 'N/A'}</strong>
                          <br />
                          <small>{req.crop?.category}</small>
                        </td>
                        <td>
                          {req.farmer?.name || 'N/A'}
                          <br />
                          <small>{req.farmer?.mobile}</small>
                        </td>
                        <td>
                          {req.buyer?.name || req.buyer?.businessName || 'N/A'}
                        </td>
                        <td>{req.quantity} kg</td>
                        <td>₹{req.agreedPrice || req.offeredPrice}</td>
                        <td className="total-price">
                          ₹{((req.agreedPrice || req.offeredPrice) * req.quantity).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">No transactions found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyStock;
