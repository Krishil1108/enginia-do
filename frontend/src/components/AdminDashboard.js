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
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Section - Mobile Optimized */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg flex-shrink-0">
                <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 leading-tight">
                  Admin Dashboard
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  Welcome, {currentUser.name}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:hidden">
                  Manage users and permissions
                </p>
              </div>
            </div>
            <button
              onClick={onBack}
              className="w-full sm:w-auto bg-gray-500 text-white px-4 py-2.5 rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
            >
              Back to Main
            </button>
          </div>
          <p className="text-gray-600 mt-3 hidden sm:block">
            Manage users and permissions
          </p>
        </div>

        {/* Cards Grid - Mobile First Design */}
        <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6">
          {/* User Management Card */}
          <div className="bg-white rounded-xl shadow-md p-5 sm:p-6 hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100 hover:border-blue-200"
               onClick={() => setActiveView('users')}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Users className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">
              User Management
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 leading-relaxed">
              Add new users, assign roles, and manage user accounts. Set up user credentials and permissions.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex items-center text-xs sm:text-sm text-gray-500">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full mr-2 flex-shrink-0"></div>
                <span className="leading-tight">Create user accounts</span>
              </div>
              <div className="flex items-center text-xs sm:text-sm text-gray-500">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full mr-2 flex-shrink-0"></div>
                <span className="leading-tight">Assign roles</span>
              </div>
              <div className="flex items-center text-xs sm:text-sm text-gray-500">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full mr-2 flex-shrink-0"></div>
                <span className="leading-tight">Activate/deactivate</span>
              </div>
              <div className="flex items-center text-xs sm:text-sm text-gray-500">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full mr-2 flex-shrink-0"></div>
                <span className="leading-tight">Manage information</span>
              </div>
            </div>
          </div>

          {/* Role Management Card */}
          <div className="bg-white rounded-xl shadow-md p-5 sm:p-6 hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100 hover:border-purple-200"
               onClick={() => setActiveView('roles')}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">
              Role & Permission Management
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 leading-relaxed">
              Create custom roles with specific page permissions. Control which features users can access.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex items-center text-xs sm:text-sm text-gray-500">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full mr-2 flex-shrink-0"></div>
                <span className="leading-tight">Create custom roles</span>
              </div>
              <div className="flex items-center text-xs sm:text-sm text-gray-500">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full mr-2 flex-shrink-0"></div>
                <span className="leading-tight">Set permissions</span>
              </div>
              <div className="flex items-center text-xs sm:text-sm text-gray-500">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full mr-2 flex-shrink-0"></div>
                <span className="leading-tight">Control access</span>
              </div>
              <div className="flex items-center text-xs sm:text-sm text-gray-500">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full mr-2 flex-shrink-0"></div>
                <span className="leading-tight">Manage descriptions</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Bottom Spacing */}
        <div className="h-6 sm:h-0"></div>
      </div>
    </div>
  );
};

export default AdminDashboard;