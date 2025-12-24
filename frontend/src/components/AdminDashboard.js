import React, { useState } from 'react';
import { Settings, Users, Shield, ArrowRight, Lock } from 'lucide-react';
import UserManagement from './UserManagement';
import RoleManagement from './RoleManagement';

const AdminDashboard = ({ currentUser, onBack }) => {
  const [activeView, setActiveView] = useState('dashboard');

  // Only allow owner Vaishal Shah to access
  if (currentUser.username !== 'vaishal') {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <Lock className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-800 mb-2">Access Denied</h2>
          <p className="text-red-600 mb-4">
            Only owner Vaishal Shah can access the admin dashboard.
          </p>
          <button
            onClick={onBack}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (activeView === 'users') {
    return (
      <UserManagement 
        currentUser={currentUser} 
        onBack={() => setActiveView('dashboard')} 
      />
    );
  }

  if (activeView === 'roles') {
    return (
      <RoleManagement 
        currentUser={currentUser} 
        onBack={() => setActiveView('dashboard')} 
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Settings className="w-8 h-8 text-indigo-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome, {currentUser.name} - Manage users and permissions</p>
          </div>
        </div>
        <button
          onClick={onBack}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
        >
          Back to Main
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Management Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-blue-200"
             onClick={() => setActiveView('users')}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">User Management</h2>
          <p className="text-gray-600 mb-4">
            Add new users, assign roles, and manage user accounts. Set up user credentials and permissions.
          </p>
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-500">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Create new user accounts
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Assign system and custom roles
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Activate/deactivate users
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Manage user information
            </div>
          </div>
        </div>

        {/* Role Management Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-purple-200"
             onClick={() => setActiveView('roles')}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Shield className="w-8 h-8 text-purple-600" />
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Role & Permission Management</h2>
          <p className="text-gray-600 mb-4">
            Create custom roles with specific page permissions. Control which features users can access.
          </p>
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-500">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              Create custom roles (e.g., Salesman)
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              Set page-specific permissions
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              Control feature access
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              Manage role descriptions
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Admin Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-indigo-600 mb-1">Owner Access</div>
            <div className="text-sm text-gray-600">Full system control</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">Unlimited</div>
            <div className="text-sm text-gray-600">Users & roles</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">10</div>
            <div className="text-sm text-gray-600">Permission types</div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Getting Started</h3>
        <div className="text-yellow-700 space-y-2">
          <p><strong>Step 1:</strong> Create custom roles in Role Management (e.g., "Salesman", "Marketing Team")</p>
          <p><strong>Step 2:</strong> Set specific page permissions for each role using the checkboxes</p>
          <p><strong>Step 3:</strong> Add users in User Management and assign them to roles</p>
          <p><strong>Step 4:</strong> Users will only see the pages you've given them permission to access</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;