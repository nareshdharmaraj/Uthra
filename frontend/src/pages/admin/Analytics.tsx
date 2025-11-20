import React, { useEffect, useState } from 'react';
import { adminService } from '../../services';
import '../../styles/Admin.css';
import CounterCard from '../../components/common/CounterCard';
import {
  RegistrationTrendChart,
  CropCategoryChart,
  RequestStatusChart,
  TransactionTrendChart,
  BuyerTypeChart,
  TopDistrictsChart
} from '../../components/common/Charts';

interface AnalyticsData {
  crops?: {
    total: number;
    active: number;
    soldOut: number;
    removed: number;
    cropsByCategory: Array<{ _id: string; count: number; totalQuantity: number }>;
    topFarmers: Array<{ farmer: any; cropCount: number }>;
    priceAnalysis: Array<{ _id: string; minPrice: number; maxPrice: number; avgPrice: number }>;
    recentCrops: any[];
  };
  users?: {
    totalFarmers: number;
    totalBuyers: number;
    totalAdmins: number;
    activeFarmers: number;
    activeBuyers: number;
    verifiedFarmers: number;
    verifiedBuyers: number;
    registrationTrend: Array<{ date: string; farmers: number; buyers: number }>;
    buyerTypes: Array<{ _id: string; count: number }>;
    topDistricts: Array<{ _id: string; count: number }>;
    activeUsers: any[];
  };
  transactions?: {
    totalRequests: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    rejected: number;
    transactionTrend: Array<{ date: string; count: number; totalValue: number }>;
    totalTransactionValue: number;
    avgCompletionTime: number;
    topCrops: Array<{ _id: string; count: number; totalQuantity: number }>;
    counterOfferStats: { total: number; accepted: number; acceptanceRate: number };
  };
}

const Analytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'crops' | 'users' | 'transactions'>('overview');
  const [analytics, setAnalytics] = useState<AnalyticsData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAllAnalytics();
  }, []);

  const fetchAllAnalytics = async () => {
    try {
      setLoading(true);
      const [cropsRes, usersRes, transactionsRes] = await Promise.all([
        adminService.getCropAnalytics(),
        adminService.getUserAnalytics(),
        adminService.getTransactionAnalytics()
      ]);
      
      setAnalytics({
        crops: cropsRes.data,
        users: usersRes.data,
        transactions: transactionsRes.data
      });
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      setError(error.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-home">
        <div className="loading-spinner">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-home">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="admin-home">
      <div className="admin-header">
        <h1>Analytics Dashboard</h1>
        <p>Comprehensive insights and data analysis</p>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button 
          className={`action-btn ${activeTab === 'overview' ? 'primary' : 'secondary'}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`action-btn ${activeTab === 'crops' ? 'success' : 'secondary'}`}
          onClick={() => setActiveTab('crops')}
        >
          Crop Analytics
        </button>
        <button 
          className={`action-btn ${activeTab === 'users' ? 'info' : 'secondary'}`}
          onClick={() => setActiveTab('users')}
        >
          User Analytics
        </button>
        <button 
          className={`action-btn ${activeTab === 'transactions' ? 'warning' : 'secondary'}`}
          onClick={() => setActiveTab('transactions')}
        >
          Transaction Analytics
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          <h2>Platform Overview</h2>
          <div className="stats-grid">
            <CounterCard
              icon="🌾"
              title="Total Crops"
              value={analytics.crops?.total || 0}
              subtitle={`${analytics.crops?.active || 0} active`}
              color="#27ae60"
            />
            <CounterCard
              icon="👥"
              title="Total Users"
              value={(analytics.users?.totalFarmers || 0) + (analytics.users?.totalBuyers || 0)}
              subtitle={`${analytics.users?.totalFarmers || 0} farmers, ${analytics.users?.totalBuyers || 0} buyers`}
              color="#3498db"
            />
            <CounterCard
              icon="📋"
              title="Total Requests"
              value={analytics.transactions?.totalRequests || 0}
              subtitle={`${analytics.transactions?.completed || 0} completed`}
              color="#9b59b6"
            />
            <CounterCard
              icon="💰"
              title="Transaction Value"
              value={analytics.transactions?.totalTransactionValue || 0}
              subtitle="Total business value"
              color="#e67e22"
            />
          </div>
        </div>
      )}

      {/* Crop Analytics Tab */}
      {activeTab === 'crops' && analytics.crops && (
        <div>
          <h2>Crop Analytics</h2>
          
          {/* Crop Status Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🌾</div>
              <div className="stat-content">
                <h3>Total Crops</h3>
                <p className="stat-number">{analytics.crops.total}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <h3>Active</h3>
                <p className="stat-number">{analytics.crops.active}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📦</div>
              <div className="stat-content">
                <h3>Sold Out</h3>
                <p className="stat-number">{analytics.crops.soldOut}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">❌</div>
              <div className="stat-content">
                <h3>Removed</h3>
                <p className="stat-number">{analytics.crops.removed}</p>
              </div>
            </div>
          </div>

          {/* Crops by Category */}
          <div className="chart-card" style={{ marginTop: '2rem' }}>
            <h3>Crops by Category</h3>
            {analytics.crops.cropsByCategory && analytics.crops.cropsByCategory.length > 0 ? (
              <CropCategoryChart data={analytics.crops.cropsByCategory} height={350} />
            ) : (
              <p style={{ textAlign: 'center', padding: '2rem', color: '#95a5a6' }}>No crop category data available</p>
            )}
            <div className="admin-table-container" style={{ marginTop: '1rem' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Count</th>
                    <th>Total Quantity (approx)</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.crops?.cropsByCategory?.map((cat) => (
                    <tr key={cat._id}>
                      <td><strong>{cat._id || 'Uncategorized'}</strong></td>
                      <td>{cat.count}</td>
                      <td>{cat.totalQuantity.toFixed(0)} units</td>
                    </tr>
                  )) || <tr><td colSpan={3}>No data available</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Farmers */}
          <div className="chart-card" style={{ marginTop: '2rem' }}>
            <h3>Top 10 Farmers by Crop Count</h3>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Farmer</th>
                    <th>Phone</th>
                    <th>Crop Count</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.crops?.topFarmers?.map((item, index) => (
                    <tr key={index}>
                      <td><strong>{item.farmer?.name || 'N/A'}</strong></td>
                      <td>{item.farmer?.phone || 'N/A'}</td>
                      <td>{item.cropCount}</td>
                    </tr>
                  )) || <tr><td colSpan={3}>No data available</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          {/* Price Analysis */}
          <div className="chart-card" style={{ marginTop: '2rem' }}>
            <h3>Price Analysis by Category</h3>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Min Price</th>
                    <th>Max Price</th>
                    <th>Avg Price</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.crops?.priceAnalysis?.map((price) => (
                    <tr key={price._id}>
                      <td><strong>{price._id || 'Uncategorized'}</strong></td>
                      <td>₹{price.minPrice}</td>
                      <td>₹{price.maxPrice}</td>
                      <td>₹{price.avgPrice.toFixed(2)}</td>
                    </tr>
                  )) || <tr><td colSpan={4}>No data available</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* User Analytics Tab */}
      {activeTab === 'users' && analytics.users && (
        <div>
          <h2>User Analytics</h2>
          
          {/* User Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👨‍🌾</div>
              <div className="stat-content">
                <h3>Farmers</h3>
                <p className="stat-number">{analytics.users.totalFarmers}</p>
                <p style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>
                  {analytics.users.activeFarmers} active
                </p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🛒</div>
              <div className="stat-content">
                <h3>Buyers</h3>
                <p className="stat-number">{analytics.users.totalBuyers}</p>
                <p style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>
                  {analytics.users.activeBuyers} active
                </p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🔒</div>
              <div className="stat-content">
                <h3>Verified Farmers</h3>
                <p className="stat-number">{analytics.users.verifiedFarmers}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🔒</div>
              <div className="stat-content">
                <h3>Verified Buyers</h3>
                <p className="stat-number">{analytics.users.verifiedBuyers}</p>
              </div>
            </div>
          </div>

          {/* Buyer Types */}
          <div className="chart-card" style={{ marginTop: '2rem' }}>
            <h3>Buyer Types Distribution</h3>
            {analytics.users.buyerTypes && analytics.users.buyerTypes.length > 0 ? (
              <BuyerTypeChart data={analytics.users.buyerTypes} height={300} />
            ) : (
              <p style={{ textAlign: 'center', padding: '2rem', color: '#95a5a6' }}>No buyer type data available</p>
            )}
            <div className="stats-grid" style={{ marginTop: '1rem' }}>
              {analytics.users?.buyerTypes?.map((type) => (
                <div key={type._id} className="stat-card">
                  <div className="stat-content">
                    <h3>{type._id || 'Unspecified'}</h3>
                    <p className="stat-number">{type.count}</p>
                  </div>
                </div>
              )) || <div className="stat-card"><div className="stat-content"><p>No data available</p></div></div>}
            </div>
          </div>

          {/* Top Districts */}
          <div className="chart-card" style={{ marginTop: '2rem' }}>
            <h3>Top 10 Districts by User Count</h3>
            {analytics.users.topDistricts && analytics.users.topDistricts.length > 0 ? (
              <TopDistrictsChart data={analytics.users.topDistricts} height={400} />
            ) : (
              <p style={{ textAlign: 'center', padding: '2rem', color: '#95a5a6' }}>No district data available</p>
            )}
            <div className="admin-table-container" style={{ marginTop: '1rem' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>District</th>
                    <th>User Count</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.users?.topDistricts?.slice(0, 10).map((district) => (
                    <tr key={district._id}>
                      <td><strong>{district._id || 'Unknown'}</strong></td>
                      <td>{district.count}</td>
                    </tr>
                  )) || <tr><td colSpan={2}>No data available</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          {/* Registration Trend */}
          {analytics.users?.registrationTrend && analytics.users.registrationTrend.length > 0 && (
            <div className="chart-card" style={{ marginTop: '2rem' }}>
              <h3>Registration Trend (Last 30 Days)</h3>
              <RegistrationTrendChart data={analytics.users.registrationTrend} height={350} />
              <div className="admin-table-container" style={{ marginTop: '1rem' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Farmers</th>
                      <th>Buyers</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.users.registrationTrend.map((trend) => (
                      <tr key={trend.date}>
                        <td>{new Date(trend.date).toLocaleDateString()}</td>
                        <td>{trend.farmers}</td>
                        <td>{trend.buyers}</td>
                        <td><strong>{trend.farmers + trend.buyers}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Transaction Analytics Tab */}
      {activeTab === 'transactions' && analytics.transactions && (
        <div>
          <h2>Transaction Analytics</h2>
          
          {/* Transaction Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📋</div>
              <div className="stat-content">
                <h3>Total Requests</h3>
                <p className="stat-number">{analytics.transactions.totalRequests}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏳</div>
              <div className="stat-content">
                <h3>Pending</h3>
                <p className="stat-number">{analytics.transactions.pending}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <h3>Completed</h3>
                <p className="stat-number">{analytics.transactions.completed}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <h3>Total Value</h3>
                <p className="stat-number">₹{analytics.transactions.totalTransactionValue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Status Distribution */}
          <div className="chart-card" style={{ marginTop: '2rem' }}>
            <h3>Request Status Distribution</h3>
            <RequestStatusChart 
              data={[
                { name: 'Pending', value: analytics.transactions.pending },
                { name: 'Confirmed', value: analytics.transactions.confirmed },
                { name: 'Completed', value: analytics.transactions.completed },
                { name: 'Cancelled', value: analytics.transactions.cancelled },
                { name: 'Rejected', value: analytics.transactions.rejected }
              ].filter(item => item.value > 0)}
              height={350}
            />
            <div className="stats-grid" style={{ marginTop: '1rem' }}>
              <div className="stat-card">
                <div className="stat-content">
                  <h3>Confirmed</h3>
                  <p className="stat-number">{analytics.transactions.confirmed}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-content">
                  <h3>Cancelled</h3>
                  <p className="stat-number">{analytics.transactions.cancelled}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-content">
                  <h3>Rejected</h3>
                  <p className="stat-number">{analytics.transactions.rejected}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Counter Offer Stats */}
          <div className="chart-card" style={{ marginTop: '2rem' }}>
            <h3>Counter Offer Statistics</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-content">
                  <h3>Total Counter Offers</h3>
                  <p className="stat-number">{analytics.transactions.counterOfferStats.total}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-content">
                  <h3>Accepted</h3>
                  <p className="stat-number">{analytics.transactions.counterOfferStats.accepted}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-content">
                  <h3>Acceptance Rate</h3>
                  <p className="stat-number">{analytics.transactions.counterOfferStats.acceptanceRate.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Top Requested Crops */}
          <div className="chart-card" style={{ marginTop: '2rem' }}>
            <h3>Top 10 Requested Crops</h3>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Crop</th>
                    <th>Request Count</th>
                    <th>Total Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.transactions?.topCrops?.map((crop) => (
                    <tr key={crop._id}>
                      <td><strong>{crop._id || 'Unknown'}</strong></td>
                      <td>{crop.count}</td>
                      <td>{crop.totalQuantity.toFixed(0)} units</td>
                    </tr>
                  )) || (
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'center', color: '#999' }}>
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Transaction Trend */}
          {analytics.transactions?.transactionTrend && analytics.transactions.transactionTrend.length > 0 && (
            <div className="chart-card" style={{ marginTop: '2rem' }}>
              <h3>Transaction Trend (Last 30 Days)</h3>
              <TransactionTrendChart 
                data={analytics.transactions.transactionTrend.map((trend: any) => ({
                  date: new Date(trend._id || trend.date).toLocaleDateString('en-IN'),
                  count: trend.count || 0,
                  totalValue: trend.totalValue || 0
                }))}
                height={350}
              />
              <div className="admin-table-container" style={{ marginTop: '1rem' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Count</th>
                      <th>Total Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.transactions.transactionTrend.map((trend: any, index: number) => (
                      <tr key={trend._id || index}>
                        <td>{new Date(trend._id).toLocaleDateString('en-IN')}</td>
                        <td>{trend.count || 0}</td>
                        <td>₹{(trend.totalValue || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Analytics;
