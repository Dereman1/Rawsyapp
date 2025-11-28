import React, { useState, useEffect } from 'react';
import './UserManagement.css';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('authToken');

      const response = await fetch('http://localhost:4000/api/auth/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveSupplier = async (userId) => {
    try {
      setActionLoading(userId);
      const token = localStorage.getItem('authToken');

      const response = await fetch(`http://localhost:4000/api/admin/supplier/approve/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to approve supplier');
      }

      await fetchUsers();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectSupplier = async (userId) => {
    try {
      setActionLoading(userId);
      const token = localStorage.getItem('authToken');

      const response = await fetch(`http://localhost:4000/api/admin/supplier/reject/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to reject supplier');
      }

      await fetchUsers();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspendUser = async (userId) => {
    if (!window.confirm('Are you sure you want to suspend this user?')) {
      return;
    }

    try {
      setActionLoading(userId);
      const token = localStorage.getItem('authToken');

      const response = await fetch(`http://localhost:4000/api/auth/manufacturer/${userId}/suspend`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to suspend user');
      }

      await fetchUsers();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnsuspendUser = async (userId) => {
    try {
      setActionLoading(userId);
      const token = localStorage.getItem('authToken');

      const response = await fetch(`http://localhost:4000/api/auth/manufacturer/${userId}/unsuspend`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to unsuspend user');
      }

      await fetchUsers();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to deactivate this user account? This action will prevent them from accessing the system.')) {
      return;
    }

    try {
      setActionLoading(userId);
      const token = localStorage.getItem('authToken');

      const response = await fetch(`http://localhost:4000/api/auth/manufacturer/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to deactivate user');
      }

      await fetchUsers();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'approved':
      case 'active':
        return 'badge-success';
      case 'pending':
        return 'badge-warning';
      case 'suspended':
        return 'badge-danger';
      case 'rejected':
        return 'badge-error';
      case 'deactivated':
        return 'badge-deactivated';
      default:
        return 'badge-default';
    }
  };

  const filteredUsers = users.filter(user => {
    if (filter === 'all') return true;
    if (filter === 'supplier') return user.role === 'supplier';
    if (filter === 'manufacturer') return user.role === 'manufacturer';
    if (filter === 'pending') return user.status === 'pending';
    if (filter === 'suspended') return user.status === 'suspended';
    return true;
  });

  if (loading) {
    return (
      <div className="user-management">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-management">
      <div className="management-header">
        <h2>User Management</h2>
        <button onClick={fetchUsers} className="refresh-button">
          Refresh
        </button>
      </div>

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      <div className="filter-section">
        <button
          className={filter === 'all' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('all')}
        >
          All Users ({users.length})
        </button>
        <button
          className={filter === 'supplier' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('supplier')}
        >
          Suppliers ({users.filter(u => u.role === 'supplier').length})
        </button>
        <button
          className={filter === 'manufacturer' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('manufacturer')}
        >
          Manufacturers ({users.filter(u => u.role === 'manufacturer').length})
        </button>
        <button
          className={filter === 'pending' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('pending')}
        >
          Pending ({users.filter(u => u.status === 'pending').length})
        </button>
        <button
          className={filter === 'suspended' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('suspended')}
        >
          Suspended ({users.filter(u => u.status === 'suspended').length})
        </button>
      </div>

      <div className="table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Status</th>
              <th>Company</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>{user.name || 'N/A'}</td>
                  <td>{user.email || 'N/A'}</td>
                  <td>{user.phone || 'N/A'}</td>
                  <td>
                    <span className="role-badge">
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>{user.companyName || 'N/A'}</td>
                  <td>
                    <div className="action-buttons">
                      {user.role === 'supplier' && user.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApproveSupplier(user._id)}
                            disabled={actionLoading === user._id}
                            className="btn-approve"
                            title="Approve supplier account"
                          >
                            {actionLoading === user._id ? (
                              <span className="loading-spinner">⏳</span>
                            ) : (
                              <>✓ Approve</>
                            )}
                          </button>
                          <button
                            onClick={() => handleRejectSupplier(user._id)}
                            disabled={actionLoading === user._id}
                            className="btn-reject"
                            title="Reject supplier application"
                          >
                            {actionLoading === user._id ? (
                              <span className="loading-spinner">⏳</span>
                            ) : (
                              <>✕ Reject</>
                            )}
                          </button>
                        </>
                      )}

                      {user.role === 'manufacturer' && user.status !== 'deactivated' && (
                        <>
                          {user.status === 'suspended' ? (
                            <button
                              onClick={() => handleUnsuspendUser(user._id)}
                              disabled={actionLoading === user._id}
                              className="btn-unsuspend"
                              title="Reactivate manufacturer account"
                            >
                              {actionLoading === user._id ? (
                                <span className="loading-spinner">⏳</span>
                              ) : (
                                <>↻ Unsuspend</>
                              )}
                            </button>
                          ) : user.status === 'active' && (
                            <button
                              onClick={() => handleSuspendUser(user._id)}
                              disabled={actionLoading === user._id}
                              className="btn-suspend"
                              title="Temporarily suspend manufacturer access"
                            >
                              {actionLoading === user._id ? (
                                <span className="loading-spinner">⏳</span>
                              ) : (
                                <>⏸ Suspend</>
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            disabled={actionLoading === user._id}
                            className="btn-delete"
                            title="Permanently deactivate manufacturer account"
                          >
                            {actionLoading === user._id ? (
                              <span className="loading-spinner">⏳</span>
                            ) : (
                              <>🗑 Deactivate</>
                            )}
                          </button>
                        </>
                      )}

                      {user.role === 'supplier' && user.status !== 'pending' && user.status !== 'deactivated' && (
                        <>
                          {user.status === 'suspended' ? (
                            <button
                              onClick={() => handleUnsuspendUser(user._id)}
                              disabled={actionLoading === user._id}
                              className="btn-unsuspend"
                              title="Reactivate supplier account"
                            >
                              {actionLoading === user._id ? (
                                <span className="loading-spinner">⏳</span>
                              ) : (
                                <>↻ Unsuspend</>
                              )}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSuspendUser(user._id)}
                              disabled={actionLoading === user._id}
                              className="btn-suspend"
                              title="Temporarily suspend supplier access"
                            >
                              {actionLoading === user._id ? (
                                <span className="loading-spinner">⏳</span>
                              ) : (
                                <>⏸ Suspend</>
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            disabled={actionLoading === user._id}
                            className="btn-delete"
                            title="Permanently deactivate supplier account"
                          >
                            {actionLoading === user._id ? (
                              <span className="loading-spinner">⏳</span>
                            ) : (
                              <>🗑 Deactivate</>
                            )}
                          </button>
                        </>
                      )}

                      {user.status === 'deactivated' && (
                        <span className="deactivated-label">Account Deactivated</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserManagement;
