import React, { useState, useEffect } from 'react';
import { Shield, Plus, Edit2, Trash2, Save, X, Check } from 'lucide-react';
import axios from 'axios';
import API_URL from '../config';

const RoleManagement = ({ currentUser, onBack }) => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: {
      dashboard: true,
      tasks: true,
      projects: false,
      users: false,
      associates: false,
      notifications: true,
      reports: false,
      settings: false,
      analytics: false,
      calendar: true
    }
  });
  const [errors, setErrors] = useState({});

  const permissionLabels = {
    dashboard: 'Dashboard',
    tasks: 'Tasks & To-Do Lists',
    projects: 'Project Management',
    users: 'User Management',
    associates: 'Associate Management',
    notifications: 'Notifications',
    reports: 'Reports & Analytics',
    settings: 'System Settings',
    analytics: 'Analytics Dashboard',
    calendar: 'Calendar View'
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/roles`, {
        params: { requestingUser: currentUser.username }
      });
      setRoles(response.data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      if (editingRole) {
        await axios.put(`${API_URL}/admin/roles/${editingRole._id}`, formData, {
          params: { requestingUser: currentUser.username }
        });
      } else {
        await axios.post(`${API_URL}/admin/roles`, formData, {
          params: { requestingUser: currentUser.username }
        });
      }
      
      setShowForm(false);
      setEditingRole(null);
      resetForm();
      fetchRoles();
    } catch (error) {
      console.error('Error saving role:', error);
      setErrors({
        general: error.response?.data?.message || 'Error saving role'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      permissions: {
        dashboard: true,
        tasks: true,
        projects: false,
        users: false,
        associates: false,
        notifications: true,
        reports: false,
        settings: false,
        analytics: false,
        calendar: true
      }
    });
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || '',
      permissions: { ...role.permissions }
    });
    setShowForm(true);
  };

  const handleDelete = async (role) => {
    if (window.confirm(`Are you sure you want to delete the role "${role.name}"? This action cannot be undone.`)) {
      try {
        await axios.delete(`${API_URL}/admin/roles/${role._id}`, {
          params: { requestingUser: currentUser.username }
        });
        fetchRoles();
      } catch (error) {
        console.error('Error deleting role:', error);
        alert(error.response?.data?.message || 'Error deleting role');
      }
    }
  };

  const handlePermissionChange = (permission, value) => {
    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions,
        [permission]: value
      }
    });
  };

  const getPermissionCount = (permissions) => {
    return Object.values(permissions).filter(Boolean).length;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-800">Role & Permission Management</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Role
          </button>
          <button
            onClick={onBack}
            className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
            Back
          </button>
        </div>
      </div>

      {/* Role Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingRole ? 'Edit Role' : 'Create New Role'}
            </h2>
            
            {errors.general && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                    placeholder="e.g. Sales Team, Marketing Assistant"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows="3"
                    placeholder="Describe what this role is for and what kind of users should have it"
                  />
                </div>
              </div>

              {/* Permissions Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Page Permissions</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Select which pages and features users with this role can access:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(permissionLabels).map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center">
                        <div className="flex-1">
                          <label className="text-sm font-medium text-gray-700">
                            {label}
                          </label>
                          <p className="text-xs text-gray-500 mt-1">
                            {getPermissionDescription(key)}
                          </p>
                        </div>
                      </div>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.permissions[key] || false}
                          onChange={(e) => handlePermissionChange(key, e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`relative w-10 h-6 rounded-full transition-colors ${
                          formData.permissions[key] ? 'bg-purple-600' : 'bg-gray-300'
                        }`}>
                          <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                            formData.permissions[key] ? 'translate-x-4' : 'translate-x-0'
                          }`} />
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingRole(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  <Save className="w-4 h-4 inline mr-2" />
                  {editingRole ? 'Update' : 'Create'} Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <div key={role._id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{role.name}</h3>
                  <p className="text-sm text-gray-500">
                    {getPermissionCount(role.permissions)} of {Object.keys(permissionLabels).length} permissions
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleEdit(role)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit Role"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(role)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Role"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {role.description && (
              <p className="text-sm text-gray-600 mb-4">{role.description}</p>
            )}

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Permissions:</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(role.permissions).map(([key, hasPermission]) => (
                  <div key={key} className="flex items-center gap-2 text-xs">
                    <div className={`w-3 h-3 rounded-full ${
                      hasPermission ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                    <span className={hasPermission ? 'text-gray-700' : 'text-gray-400'}>
                      {permissionLabels[key]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Created: {new Date(role.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {roles.length === 0 && (
        <div className="text-center py-12">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No roles found</h3>
          <p className="text-gray-500">Create your first custom role to get started with permission management.</p>
        </div>
      )}
    </div>
  );
};

// Helper function to get permission descriptions
const getPermissionDescription = (key) => {
  const descriptions = {
    dashboard: 'View main dashboard and overview',
    tasks: 'Create, edit, and manage tasks',
    projects: 'Access project management features',
    users: 'Manage user accounts and settings',
    associates: 'Manage associate relationships',
    notifications: 'Receive and manage notifications',
    reports: 'Generate and view reports',
    settings: 'Access system configuration',
    analytics: 'View analytics and insights',
    calendar: 'Access calendar functionality'
  };
  return descriptions[key] || 'Access this feature';
};

export default RoleManagement;