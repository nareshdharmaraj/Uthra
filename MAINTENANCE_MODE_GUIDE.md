# Maintenance Mode Testing Guide

## Implementation Summary

### Backend Changes:
1. ✅ Created `SystemSettings` model with maintenance mode tracking
2. ✅ Added admin controller methods for system settings management
3. ✅ Added routes for settings CRUD and maintenance toggle
4. ✅ Updated login methods to block farmers/buyers during maintenance
5. ✅ Admin login always works regardless of maintenance mode

### Frontend Changes:
1. ✅ Created comprehensive Settings page with 8 tabs
2. ✅ Added MaintenanceBanner component
3. ✅ Integrated banner into AdminLayout (shows on all admin pages)
4. ✅ Added service methods for system settings API calls
5. ✅ Real-time maintenance status check every 30 seconds

### Features Implemented:

#### Settings Tabs:
1. **🔧 Maintenance** - Toggle mode, view logs, custom message
2. **📧 Email** - SMTP configuration
3. **📱 SMS** - SMS provider settings
4. **🔔 Notifications** - Notification preferences
5. **👥 Users** - User management settings
6. **🔒 Security** - Password policies
7. **⏱️ Session** - Session management
8. **💾 Backup** - Backup configuration

#### Maintenance Mode Features:
- **Toggle with reason**: Admin can provide reason when enabling maintenance
- **Time logging**: Tracks start/end times of each maintenance period
- **History logs**: Shows all past maintenance sessions with duration
- **Admin-only access**: Only admins can login when maintenance is active
- **Custom message**: Configurable message shown to blocked users
- **Visual banner**: Fixed top banner visible on all admin pages
- **Auto-refresh**: Status checked every 30 seconds

## Testing Steps:

### 1. Start Backend Server
```powershell
cd c:\Users\nares\OneDrive\Desktop\Uthra\backend
node server.js
```

### 2. Start Frontend Dev Server
```powershell
cd c:\Users\nares\OneDrive\Desktop\Uthra\frontend
npm start
```

### 3. Test Admin Login (Normal Mode)
1. Go to http://localhost:3000
2. Login as admin
3. Navigate to Settings → Maintenance tab
4. Verify status shows "✅ System Operational"

### 4. Enable Maintenance Mode
1. Click "🔴 Enable Maintenance Mode"
2. Enter a reason (e.g., "Database migration")
3. Click the button again to confirm
4. Verify:
   - Status changes to "🔴 Maintenance Mode Active"
   - Red banner appears at the top
   - Maintenance log is created with timestamp

### 5. Test Farmer/Buyer Login (Maintenance Mode)
1. Open a new incognito/private window
2. Try to login as a farmer or buyer
3. **Expected Result**: 
   - Login should fail with message:
   - "System is currently under maintenance. If you perform any tasks, they will be lost. Please try after an hour."
   - Status code: 503

### 6. Test Admin Login (Maintenance Mode)
1. In the same private window, try to login as admin
2. **Expected Result**: 
   - Admin login should succeed
   - You can access admin panel normally
   - Banner shows maintenance mode is active

### 7. Disable Maintenance Mode
1. In admin panel, go to Settings → Maintenance
2. Click "✅ Disable Maintenance Mode"
3. Verify:
   - Status changes to "✅ System Operational"
   - Banner disappears
   - Previous maintenance log now has end time
   - Duration is calculated

### 8. Test Normal Operation
1. Try logging in as farmer/buyer again
2. **Expected Result**: Login should work normally

### 9. Check Maintenance Logs
1. In Settings → Maintenance tab
2. Scroll to "📋 Maintenance History"
3. Verify:
   - All maintenance sessions are logged
   - Start and end times are recorded
   - Duration is calculated
   - Admin who toggled is shown
   - Reason is displayed

## API Endpoints:

```
GET    /api/admin/settings/system          - Get all system settings
PUT    /api/admin/settings/system          - Update system settings
POST   /api/admin/settings/maintenance     - Toggle maintenance mode
GET    /api/admin/settings/maintenance/logs - Get maintenance history
```

## Database Schema:

```javascript
SystemSettings {
  isOperational: Boolean (true = operational, false = maintenance)
  maintenanceMessage: String
  currentMaintenanceStart: Date
  maintenanceLogs: [{
    status: 'enabled' | 'disabled'
    startTime: Date
    endTime: Date
    updatedBy: ObjectId (User)
    reason: String
  }]
  emailSettings: { ... }
  smsSettings: { ... }
  notificationSettings: { ... }
  userSettings: { ... }
  sessionSettings: { ... }
  securitySettings: { ... }
  apiSettings: { ... }
  backupSettings: { ... }
}
```

## Expected Behavior:

### During Maintenance Mode:
- ❌ Farmers cannot login
- ❌ Buyers cannot login
- ❌ Donors cannot login
- ✅ Admins can login
- ✅ Admins see banner on all pages
- ✅ All maintenance actions are logged

### Normal Operation:
- ✅ All users can login
- ✅ No banner shown
- ✅ System functions normally

## Build Status:
✅ Frontend built successfully: 250.74 kB (gzipped)
✅ No TypeScript errors
⚠️ Only ESLint warnings (non-blocking, useEffect dependencies)

## Files Created/Modified:

### Backend:
- `backend/models/SystemSettings.js` (NEW)
- `backend/middleware/maintenanceMode.js` (NEW)
- `backend/controllers/adminController.js` (MODIFIED)
- `backend/controllers/authController.js` (MODIFIED)
- `backend/routes/adminRoutes.js` (MODIFIED)

### Frontend:
- `frontend/src/pages/admin/Settings.tsx` (REPLACED)
- `frontend/src/styles/Settings.css` (NEW)
- `frontend/src/components/common/MaintenanceBanner.tsx` (NEW)
- `frontend/src/styles/MaintenanceBanner.css` (NEW)
- `frontend/src/components/layouts/AdminLayout.tsx` (MODIFIED)
- `frontend/src/services/adminService.ts` (MODIFIED)

## Next Steps:
1. Test all features thoroughly
2. Ensure maintenance mode blocks non-admin login
3. Verify admin can always access system
4. Check that banner appears correctly
5. Confirm logs are being recorded properly
