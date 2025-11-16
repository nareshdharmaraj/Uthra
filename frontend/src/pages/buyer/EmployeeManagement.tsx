import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import './EmployeeManagement.css';

interface Employee {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    mobile: string;
  };
  role: string;
  permissions: {
    canCreateRequests: boolean;
    canManageWantedCrops: boolean;
    canViewReports: boolean;
    canManageEmployees: boolean;
    canEditCompanyProfile: boolean;
  };
  joinedAt: string;
  isActive: boolean;
}

interface EmployeesData {
  owner: any;
  employees: Employee[];
  pendingInvitations: any[];
  maxEmployees: number;
  canAddMore: boolean;
}

const EmployeeManagement: React.FC = () => {
  const [employeesData, setEmployeesData] = useState<EmployeesData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  
  // Add employee form
  const [addForm, setAddForm] = useState({
    email: '',
    mobile: '',
    role: 'staff',
    permissions: {
      canCreateRequests: true,
      canManageWantedCrops: false,
      canViewReports: false,
      canManageEmployees: false,
      canEditCompanyProfile: false
    }
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/buyers/company/employees');
      setEmployeesData(response.data.data);
    } catch (error: any) {
      console.error('Failed to fetch employees:', error);
      alert(error.response?.data?.message || 'Failed to load employees');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/buyers/company/employees', addForm);
      alert('Employee added successfully!');
      setShowAddModal(false);
      setAddForm({
        email: '',
        mobile: '',
        role: 'staff',
        permissions: {
          canCreateRequests: true,
          canManageWantedCrops: false,
          canViewReports: false,
          canManageEmployees: false,
          canEditCompanyProfile: false
        }
      });
      fetchEmployees();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to add employee');
    }
  };

  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    try {
      await api.put(`/buyers/company/employees/${selectedEmployee._id}`, {
        role: selectedEmployee.role,
        permissions: selectedEmployee.permissions,
        isActive: selectedEmployee.isActive
      });
      alert('Employee updated successfully!');
      setShowEditModal(false);
      setSelectedEmployee(null);
      fetchEmployees();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update employee');
    }
  };

  const handleRemoveEmployee = async (employeeId: string) => {
    if (!window.confirm('Are you sure you want to remove this employee?')) return;

    try {
      await api.delete(`/buyers/company/employees/${employeeId}`);
      alert('Employee removed successfully!');
      fetchEmployees();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to remove employee');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      manager: '#9C27B0',
      buyer: '#2196F3',
      procurement_officer: '#FF9800',
      staff: '#666'
    };
    return colors[role] || '#666';
  };

  if (isLoading) {
    return <div className="loading-container">Loading employees...</div>;
  }

  if (!employeesData) {
    return <div className="error-container">Failed to load employees</div>;
  }

  return (
    <div className="employee-management">
      <div className="page-header">
        <div>
          <h1>👥 Employee Management</h1>
          <p className="subtitle">
            {employeesData.employees.filter(e => e.isActive).length + 1} / {employeesData.maxEmployees} employees
          </p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => setShowAddModal(true)}
          disabled={!employeesData.canAddMore}
        >
          + Add Employee
        </button>
      </div>

      {!employeesData.canAddMore && (
        <div className="warning-banner">
          ⚠️ Employee limit reached. Upgrade your plan to add more employees.
        </div>
      )}

      {/* Owner Card */}
      <div className="owner-section">
        <h2>Company Owner</h2>
        <div className="employee-card owner-card">
          <div className="employee-avatar">👑</div>
          <div className="employee-info">
            <h3>{employeesData.owner.name}</h3>
            <p>{employeesData.owner.email}</p>
            <p>{employeesData.owner.mobile}</p>
          </div>
          <div className="employee-badge">
            <span className="role-badge" style={{ background: '#FFD700', color: '#333' }}>
              Owner
            </span>
          </div>
        </div>
      </div>

      {/* Employees List */}
      <div className="employees-section">
        <h2>Team Members ({employeesData.employees.length})</h2>
        {employeesData.employees.length === 0 ? (
          <div className="empty-state">
            <p>No employees yet. Add your first team member!</p>
          </div>
        ) : (
          <div className="employees-grid">
            {employeesData.employees.map((employee) => (
              <div 
                key={employee._id} 
                className={`employee-card ${!employee.isActive ? 'inactive' : ''}`}
              >
                <div className="employee-avatar">👤</div>
                <div className="employee-info">
                  <h3>{employee.user.name}</h3>
                  <p>{employee.user.email}</p>
                  <p>{employee.user.mobile}</p>
                  <p className="joined-date">
                    Joined: {new Date(employee.joinedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="employee-meta">
                  <span 
                    className="role-badge" 
                    style={{ background: getRoleBadgeColor(employee.role) }}
                  >
                    {employee.role.replace('_', ' ')}
                  </span>
                  {!employee.isActive && (
                    <span className="status-badge inactive-badge">Inactive</span>
                  )}
                </div>
                <div className="employee-permissions">
                  <small>Permissions:</small>
                  <div className="permission-chips">
                    {employee.permissions.canCreateRequests && <span>✓ Requests</span>}
                    {employee.permissions.canManageWantedCrops && <span>✓ Wanted Crops</span>}
                    {employee.permissions.canViewReports && <span>✓ Reports</span>}
                    {employee.permissions.canManageEmployees && <span>✓ Employees</span>}
                    {employee.permissions.canEditCompanyProfile && <span>✓ Profile</span>}
                  </div>
                </div>
                <div className="employee-actions">
                  <button 
                    className="btn-secondary"
                    onClick={() => {
                      setSelectedEmployee(employee);
                      setShowEditModal(true);
                    }}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn-danger"
                    onClick={() => handleRemoveEmployee(employee._id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add New Employee</h2>
            <form onSubmit={handleAddEmployee}>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  required
                />
                <small>Employee must be registered as a buyer</small>
              </div>

              <div className="form-group">
                <label>Mobile</label>
                <input
                  type="tel"
                  value={addForm.mobile}
                  onChange={(e) => setAddForm({ ...addForm, mobile: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Role *</label>
                <select
                  value={addForm.role}
                  onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                  required
                >
                  <option value="staff">Staff</option>
                  <option value="buyer">Buyer</option>
                  <option value="procurement_officer">Procurement Officer</option>
                  <option value="manager">Manager</option>
                </select>
              </div>

              <div className="form-group">
                <label>Permissions</label>
                <div className="permissions-checkboxes">
                  <label>
                    <input
                      type="checkbox"
                      checked={addForm.permissions.canCreateRequests}
                      onChange={(e) => setAddForm({
                        ...addForm,
                        permissions: { ...addForm.permissions, canCreateRequests: e.target.checked }
                      })}
                    />
                    Can Create Requests
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={addForm.permissions.canManageWantedCrops}
                      onChange={(e) => setAddForm({
                        ...addForm,
                        permissions: { ...addForm.permissions, canManageWantedCrops: e.target.checked }
                      })}
                    />
                    Can Manage Wanted Crops
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={addForm.permissions.canViewReports}
                      onChange={(e) => setAddForm({
                        ...addForm,
                        permissions: { ...addForm.permissions, canViewReports: e.target.checked }
                      })}
                    />
                    Can View Reports
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={addForm.permissions.canManageEmployees}
                      onChange={(e) => setAddForm({
                        ...addForm,
                        permissions: { ...addForm.permissions, canManageEmployees: e.target.checked }
                      })}
                    />
                    Can Manage Employees
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={addForm.permissions.canEditCompanyProfile}
                      onChange={(e) => setAddForm({
                        ...addForm,
                        permissions: { ...addForm.permissions, canEditCompanyProfile: e.target.checked }
                      })}
                    />
                    Can Edit Company Profile
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && selectedEmployee && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Employee</h2>
            <form onSubmit={handleUpdateEmployee}>
              <div className="form-group">
                <label>Name</label>
                <input type="text" value={selectedEmployee.user.name} disabled />
              </div>

              <div className="form-group">
                <label>Role *</label>
                <select
                  value={selectedEmployee.role}
                  onChange={(e) => setSelectedEmployee({
                    ...selectedEmployee,
                    role: e.target.value
                  })}
                  required
                >
                  <option value="staff">Staff</option>
                  <option value="buyer">Buyer</option>
                  <option value="procurement_officer">Procurement Officer</option>
                  <option value="manager">Manager</option>
                </select>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={selectedEmployee.isActive}
                    onChange={(e) => setSelectedEmployee({
                      ...selectedEmployee,
                      isActive: e.target.checked
                    })}
                  />
                  Active
                </label>
              </div>

              <div className="form-group">
                <label>Permissions</label>
                <div className="permissions-checkboxes">
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedEmployee.permissions.canCreateRequests}
                      onChange={(e) => setSelectedEmployee({
                        ...selectedEmployee,
                        permissions: { ...selectedEmployee.permissions, canCreateRequests: e.target.checked }
                      })}
                    />
                    Can Create Requests
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedEmployee.permissions.canManageWantedCrops}
                      onChange={(e) => setSelectedEmployee({
                        ...selectedEmployee,
                        permissions: { ...selectedEmployee.permissions, canManageWantedCrops: e.target.checked }
                      })}
                    />
                    Can Manage Wanted Crops
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedEmployee.permissions.canViewReports}
                      onChange={(e) => setSelectedEmployee({
                        ...selectedEmployee,
                        permissions: { ...selectedEmployee.permissions, canViewReports: e.target.checked }
                      })}
                    />
                    Can View Reports
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedEmployee.permissions.canManageEmployees}
                      onChange={(e) => setSelectedEmployee({
                        ...selectedEmployee,
                        permissions: { ...selectedEmployee.permissions, canManageEmployees: e.target.checked }
                      })}
                    />
                    Can Manage Employees
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={selectedEmployee.permissions.canEditCompanyProfile}
                      onChange={(e) => setSelectedEmployee({
                        ...selectedEmployee,
                        permissions: { ...selectedEmployee.permissions, canEditCompanyProfile: e.target.checked }
                      })}
                    />
                    Can Edit Company Profile
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Update Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;
