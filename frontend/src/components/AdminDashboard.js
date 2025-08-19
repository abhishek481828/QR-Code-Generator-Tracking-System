import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import '../styles/Dashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [qrCodes, setQrCodes] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [generateCount, setGenerateCount] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, qrCodesRes, usersRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/dashboard'),
        axios.get('http://localhost:5000/api/qrcode/all'),
        axios.get('http://localhost:5000/api/admin/users')
      ]);
      
      setStats(statsRes.data);
      setQrCodes(qrCodesRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      toast.error('Error fetching dashboard data');
    }
  };

  const generateQRCodes = async () => {
    if (generateCount < 1 || generateCount > 100) {
      toast.error('Count must be between 1 and 100');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/qrcode/generate', {
        count: generateCount
      });
      
      toast.success(response.data.message);
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error generating QR codes');
    } finally {
      setLoading(false);
    }
  };

  const toggleQRActive = async (qrId) => {
    try {
      const response = await axios.patch(`http://localhost:5000/api/qrcode/${qrId}/toggle-active`);
      toast.success(response.data.message);
      fetchDashboardData();
    } catch (error) {
      toast.error('Error updating QR code status');
    }
  };

  const assignQRToUser = async (qrId, userId) => {
    try {
      const response = await axios.post(`http://localhost:5000/api/qrcode/${qrId}/assign`, {
        userId
      });
      toast.success(response.data.message);
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error assigning QR code');
    }
  };

  const downloadQRCode = (qrCode) => {
    const link = document.createElement('a');
    link.download = `qr-${qrCode.code}.png`;
    link.href = qrCode.qrImage;
    link.click();
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Admin Dashboard</h1>
          <div className="user-info">
            <span>Welcome, {user.name}</span>
            <button onClick={logout} className="btn btn-secondary">Logout</button>
          </div>
        </div>
      </header>

      <nav className="dashboard-nav">
        <button 
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={activeTab === 'generate' ? 'active' : ''}
          onClick={() => setActiveTab('generate')}
        >
          Generate QR Codes
        </button>
        <button 
          className={activeTab === 'manage' ? 'active' : ''}
          onClick={() => setActiveTab('manage')}
        >
          Manage QR Codes
        </button>
        <button 
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
      </nav>

      <main className="dashboard-main">
        {activeTab === 'dashboard' && (
          <div className="dashboard-overview">
            <h2>Dashboard Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Users</h3>
                <div className="stat-number">{stats.totalUsers || 0}</div>
              </div>
              <div className="stat-card">
                <h3>Total QR Codes</h3>
                <div className="stat-number">{stats.totalQRCodes || 0}</div>
              </div>
              <div className="stat-card">
                <h3>Active QR Codes</h3>
                <div className="stat-number">{stats.activeQRCodes || 0}</div>
              </div>
              <div className="stat-card">
                <h3>Assigned QR Codes</h3>
                <div className="stat-number">{stats.assignedQRCodes || 0}</div>
              </div>
              <div className="stat-card">
                <h3>Tracking QR Codes</h3>
                <div className="stat-number">{stats.trackingQRCodes || 0}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'generate' && (
          <div className="generate-section">
            <h2>Generate QR Codes</h2>
            <div className="generate-form">
              <div className="form-group">
                <label>Number of QR Codes to Generate (1-100)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={generateCount}
                  onChange={(e) => setGenerateCount(parseInt(e.target.value))}
                />
              </div>
              <button 
                className="btn btn-primary"
                onClick={generateQRCodes}
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Generate QR Codes'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'manage' && (
          <div className="manage-section">
            <h2>Manage QR Codes</h2>
            <div className="qr-codes-table">
              <table>
                <thead>
                  <tr>
                    <th>QR Code</th>
                    <th>Code</th>
                    <th>Status</th>
                    <th>Assigned To</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {qrCodes.map(qr => (
                    <tr key={qr._id}>
                      <td>
                        <img src={qr.qrImage} alt="QR" className="qr-thumbnail" />
                      </td>
                      <td>{qr.code}</td>
                      <td>
                        <span className={`status ${qr.isActive ? 'active' : 'inactive'}`}>
                          {qr.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        {qr.assignedTo ? qr.assignedTo.name : 'Not assigned'}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn btn-small"
                            onClick={() => toggleQRActive(qr._id)}
                          >
                            {qr.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button 
                            className="btn btn-small"
                            onClick={() => downloadQRCode(qr)}
                          >
                            Download
                          </button>
                          <select 
                            onChange={(e) => {
                              if (e.target.value) {
                                assignQRToUser(qr._id, e.target.value);
                              }
                            }}
                            value=""
                          >
                            <option value="">Assign to user</option>
                            {users.map(user => (
                              <option key={user._id} value={user._id}>
                                {user.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="users-section">
            <h2>Users</h2>
            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`status ${user.isActive ? 'active' : 'inactive'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
