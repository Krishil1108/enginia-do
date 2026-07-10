import React, { useState } from 'react';
import { Settings, Users, Shield, ArrowRight, Lock } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
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

      {/* Interactive Data Dashboards */}
      <div className="mt-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">System Overview</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Role Distribution Donut Chart */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.05)] p-6 border border-gray-100">
            <h4 className="text-lg font-semibold text-gray-700 mb-4">User Role Distribution</h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Employees', value: 45 },
                      { name: 'Managers', value: 12 },
                      { name: 'Team Leads', value: 8 },
                      { name: 'Admins', value: 3 },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    animationDuration={1500}
                    animationEasing="ease-out"
                  >
                    {[
                      { name: 'Employees', value: 45 },
                      { name: 'Managers', value: 12 },
                      { name: 'Team Leads', value: 8 },
                      { name: 'Admins', value: 3 },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'][index % 4]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle"/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Activity Bar Chart */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.05)] p-6 border border-gray-100">
            <h4 className="text-lg font-semibold text-gray-700 mb-4">Weekly Task Activity</h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: 'Mon', Created: 12, Completed: 8 },
                    { name: 'Tue', Created: 19, Completed: 15 },
                    { name: 'Wed', Created: 15, Completed: 22 },
                    { name: 'Thu', Created: 22, Completed: 18 },
                    { name: 'Fri', Created: 8, Completed: 25 },
                  ]}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <RechartsTooltip
                    cursor={{ fill: '#F3F4F6' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                  />
                  <Legend iconType="circle" />
                  <Bar dataKey="Created" fill="#818CF8" radius={[4, 4, 0, 0]} animationDuration={1500} />
                  <Bar dataKey="Completed" fill="#34D399" radius={[4, 4, 0, 0]} animationDuration={1500} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;