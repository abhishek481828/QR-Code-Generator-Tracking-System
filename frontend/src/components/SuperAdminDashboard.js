import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import '../styles/Dashboard.css';

const SuperAdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [qrCodes, setQrCodes] = useState([]);
  const [stats, setStats] = useState({});
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, usersRes, qrCodesRes] = await Promise.all([
        axios.get('http://localhost:5000/api/superadmin/system-stats'),
        axios.get('http://localhost:5000/api/superadmin/users'),
        axios.get('http://localhost:5000/api/qrcode/all')
      ]);
      
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setQrCodes(qrCodesRes.data);
    } catch (error) {
      toast.error('Error fetching dashboard data');
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`http://localhost:5000/api/superadmin/users/${userId}`);
        toast.success('User deleted successfully');
        fetchDashboardData();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error deleting user');
      }
    }
  };

  const updateUser = async (userId, userData) => {
    try {
      await axios.patch(`http://localhost:5000/api/superadmin/users/${userId}`, userData);
      toast.success('User updated successfully');
      setEditingUser(null);
      fetchDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating user');
    }
  };

  const deleteQRCode = async (qrId) => {
    if (window.confirm('Are you sure you want to delete this QR code?')) {
      try {
        await axios.delete(`http://localhost:5000/api/superadmin/qrcodes/${qrId}`);
        toast.success('QR code deleted successfully');
        fetchDashboardData();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error deleting QR code');
      }
    }
  };

  const EditUserModal = ({ user, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onUpdate(user._id, formData);
    };

    return (
      <div className="modal-overlay">
        <div className="modal">
          <h3>Edit User</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="superadmin">SuperAdmin</option>
              </select>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                />
                Active
              </label>
            </div>
            <div className="modal-actions">
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Update
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>SuperAdmin Dashboard</h1>
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
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          Manage Users
        </button>
        <button 
          className={activeTab === 'qrcodes' ? 'active' : ''}
          onClick={() => setActiveTab('qrcodes')}
        >
          Manage QR Codes
        </button>
      </nav>

      <main className="dashboard-main">
        {activeTab === 'dashboard' && (
          <div className="dashboard-overview">
            <h2>System Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Users</h3>
                <div className="stat-number">{stats.totalUsers || 0}</div>
              </div>
              <div className="stat-card">
                <h3>Total Admins</h3>
                <div className="stat-number">{stats.totalAdmins || 0}</div>
              </div>
              <div className="stat-card">
                <h3>Regular Users</h3>
                <div className="stat-number">{stats.totalRegularUsers || 0}</div>
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
              <div className="stat-card">
                <h3>Recent Registrations</h3>
                <div className="stat-number">{stats.recentRegistrations || 0}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="users-section">
            <h2>Manage Users</h2>
            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Registered</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role ${user.role}`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </td>
                      <td>
                        <span className={`status ${user.isActive ? 'active' : 'inactive'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn btn-small"
                            onClick={() => setEditingUser(user)}
                          >
                            Edit
                          </button>
                          {user.role !== 'superadmin' && (
                            <button 
                              className="btn btn-small btn-danger"
                              onClick={() => deleteUser(user._id)}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'qrcodes' && (
          <div className="qrcodes-section">
            <h2>Manage QR Codes</h2>
            <div className="qr-codes-table">
              <table>
                <thead>
                  <tr>
                    <th>QR Code</th>
                    <th>Code</th>
                    <th>Status</th>
                    <th>Assigned To</th>
                    <th>Created By</th>
                    <th>Tracking</th>
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
                        {qr.createdBy ? qr.createdBy.name : 'Unknown'}
                      </td>
                      <td>
                        <span className={`status ${qr.isTracking ? 'active' : 'inactive'}`}>
                          {qr.isTracking ? 'Tracking' : 'Not tracking'}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn btn-small btn-danger"
                          onClick={() => deleteQRCode(qr._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onUpdate={updateUser}
        />
      )}
    </div>
  );
};

export default SuperAdminDashboard;
