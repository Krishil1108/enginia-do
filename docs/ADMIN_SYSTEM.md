# Admin Panel for Owner Vaishal Shah

## Overview
This admin panel allows owner Vaishal Shah to manage users and roles with granular page permissions. The system is designed to control which pages and features each user can access based on their assigned role.

## Features

### 🔐 Access Control
- Only owner **Vaishal Shah** (username: `vaishal`) can access the Admin Panel
- Secure role-based permission system
- Page-level access control

### 👥 User Management
- Create new user accounts with username and password
- Assign system roles (Admin, Manager, Team Lead, Employee, Associate)
- Assign custom roles with specific permissions
- Activate/deactivate user accounts
- Edit user information and departments

### 🛡️ Role & Permission Management
- Create custom roles (e.g., "Salesman", "Marketing Team")
- Set page-specific permissions using checkboxes
- 10 different permission types available:
  - **Dashboard**: View main dashboard and overview
  - **Tasks**: Create, edit, and manage tasks
  - **Projects**: Access project management features
  - **Users**: Manage user accounts (admin only)
  - **Associates**: Manage associate relationships
  - **Notifications**: Receive and manage notifications
  - **Reports**: Generate and view reports
  - **Settings**: Access system configuration
  - **Analytics**: View analytics and insights
  - **Calendar**: Access calendar functionality

## How to Use

### Step 1: Access Admin Panel
1. Login as **vaishal** (owner)
2. Click "Admin Panel" button in navigation
3. You'll see the Admin Dashboard with two main options

### Step 2: Create Roles
1. Click "Role & Permission Management"
2. Click "Create Role" button
3. Enter role name (e.g., "Salesman")
4. Add description
5. Use checkboxes to set page permissions
6. Save the role

### Step 3: Add Users
1. Click "User Management"
2. Click "Add User" button
3. Fill in user details:
   - Username (for login)
   - Password
   - Full name
   - Email
   - System role (default roles)
   - Custom role (optional - your created roles)
   - Department
4. Save the user

### Step 4: Assign Permissions
- Users with custom roles will only see pages you've given them permission for
- System roles have default permissions
- Custom roles override system role permissions

## Example Use Cases

### Salesman Role
```
✅ Dashboard - Can see overview
✅ Tasks - Can manage their tasks
✅ Calendar - Can view calendar
❌ Projects - Cannot access projects
❌ Users - Cannot manage users
❌ Reports - Cannot generate reports
```

### Marketing Team Role
```
✅ Dashboard - Can see overview
✅ Tasks - Can manage tasks
✅ Projects - Can access projects
✅ Analytics - Can view analytics
✅ Reports - Can generate reports
❌ Users - Cannot manage users
```

## Default Roles Created
Run the seed script to create default roles:
```bash
cd backend
node create-default-roles.js
```

This creates:
- **Salesman**: Basic access (tasks, calendar only)
- **Marketing Team**: Marketing access (includes projects, analytics)
- **Support Agent**: Support access (basic features)
- **Project Manager**: Management access (projects, associates, reports)

## Technical Details

### Backend Routes
- `POST /api/admin/roles` - Create role
- `GET /api/admin/roles` - Get all roles
- `PUT /api/admin/roles/:id` - Update role
- `DELETE /api/admin/roles/:id` - Delete role
- `POST /api/admin/users` - Create user
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id` - Update user
- `GET /api/admin/user-permissions/:username` - Get user permissions

### Permission Checking
The frontend checks user permissions via:
```javascript
// Get user permissions
const response = await axios.get(`${API_URL}/admin/user-permissions/${username}`);
const { permissions } = response.data;

// Check if user has access to specific page
if (permissions.projects) {
  // User can access projects
}
```

### Security
- All admin routes require `requestingUser` parameter
- Backend validates that only `vaishal` can access admin functions
- Role assignments are validated server-side
- Password hashing with bcrypt

## User Experience
- Users only see navigation items they have permissions for
- Attempting to access restricted pages shows access denied
- Smooth integration with existing UI
- Mobile-responsive admin interface

## Support
For any issues or questions about the admin system, contact the development team.