# Quick Reference: Maintenance Mode System

## 🚀 Quick Start

### Start the Application
```powershell
# Terminal 1: Backend
cd c:\Users\nares\OneDrive\Desktop\Uthra\backend
node server.js

# Terminal 2: Frontend
cd c:\Users\nares\OneDrive\Desktop\Uthra\frontend
npm start
```

### Access Admin Panel
1. Navigate to `http://localhost:3000`
2. Login as admin
3. Go to **Settings** → **Maintenance** tab

## 🔧 Maintenance Mode Operations

### Enable Maintenance Mode
1. Click **"🔴 Enable Maintenance Mode"**
2. (Optional) Enter reason in textarea
3. Click button again to confirm
4. **Result**: Red banner appears, non-admins blocked

### Disable Maintenance Mode
1. Click **"✅ Disable Maintenance Mode"**
2. **Result**: Banner disappears, all users can login

### Update Maintenance Message
1. Edit text in "Maintenance Message" textarea
2. Click **"Update Message"**
3. New message will be shown to blocked users

## 📋 Key API Endpoints

```javascript
// Get all system settings
GET /api/admin/settings/system

// Update settings
PUT /api/admin/settings/system
Body: { [settingSection]: { ...data } }

// Toggle maintenance mode
POST /api/admin/settings/maintenance
Body: { 
  isOperational: boolean,  // true = operational, false = maintenance
  reason: string           // optional
}

// Get maintenance history
GET /api/admin/settings/maintenance/logs?limit=20&page=1
```

## 🔍 Testing Scenarios

### Test 1: Block Non-Admin Users
```bash
# Enable maintenance mode in admin panel
# Then try this login request:

curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9876543210", "password": "farmer123"}'

# Expected Response (503):
{
  "success": false,
  "message": "System is currently under maintenance...",
  "maintenanceMode": true,
  "isOperational": false
}
```

### Test 2: Admin Access Always Works
```bash
# With maintenance mode enabled:

curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999", "password": "admin123"}'

# Expected Response (200):
{
  "success": true,
  "message": "Login successful",
  "data": { "token": "...", "user": { "role": "admin" } }
}
```

## 📊 Maintenance Log Structure

```javascript
{
  "_id": "...",
  "status": "enabled",           // or "disabled"
  "startTime": "2025-11-19T10:30:00.000Z",
  "endTime": "2025-11-19T11:15:00.000Z",  // null if still active
  "updatedBy": {
    "name": "Admin Name",
    "email": "admin@uthra.com"
  },
  "reason": "Database migration"
}
```

## 🎨 UI Components

### MaintenanceBanner
- **Location**: Top of all admin pages (fixed position)
- **Visibility**: Only when `isOperational = false`
- **Content**: Icon, message, start time
- **Auto-refresh**: Every 30 seconds

### Settings Page Tabs
1. 🔧 **Maintenance** - Primary control panel
2. 📧 **Email** - SMTP settings
3. 📱 **SMS** - SMS provider config
4. 🔔 **Notifications** - Alert preferences
5. 👥 **Users** - User management rules
6. 🔒 **Security** - Password policies
7. ⏱️ **Session** - Session timeout
8. 💾 **Backup** - Backup scheduling

## 🔐 Access Control Matrix

| User Type | Maintenance Mode OFF | Maintenance Mode ON |
|-----------|---------------------|---------------------|
| Admin     | ✅ Full Access      | ✅ Full Access      |
| Farmer    | ✅ Can Login        | ❌ Blocked (503)    |
| Buyer     | ✅ Can Login        | ❌ Blocked (503)    |
| Donor     | ✅ Can Login        | ❌ Blocked (503)    |

## 🐛 Troubleshooting

### Banner Not Showing
```javascript
// Check in browser console:
const settings = await adminService.getSystemSettings();
console.log('Is Operational:', settings.data.isOperational);
// If true, banner won't show (system is operational)
```

### Users Not Being Blocked
```javascript
// Check in backend authController.js
// Verify maintenance check is present (line 331-342)
const settings = await SystemSettings.getSettings();
if (!settings.isOperational) {
  return res.status(503).json({ ... });
}
```

### Settings Not Saving
```javascript
// Check backend logs for errors
// Verify MongoDB connection
// Check admin authentication token is valid
```

## 📱 Mobile Responsive Breakpoints

```css
@media (max-width: 768px) {
  /* Tabs scroll horizontally */
  /* Form inputs stack vertically */
  /* Tables show horizontal scroll */
  /* Banner padding reduced */
}
```

## 🔄 State Management

### Frontend State (AdminLayout)
```typescript
const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
const [maintenanceStart, setMaintenanceStart] = useState<Date | null>(null);

// Auto-refresh every 30 seconds
useEffect(() => {
  const checkMaintenanceMode = async () => { ... };
  checkMaintenanceMode();
  const interval = setInterval(checkMaintenanceMode, 30000);
  return () => clearInterval(interval);
}, []);
```

### Backend State (MongoDB)
```javascript
// Single document in systemsettings collection
{
  isOperational: true/false,
  maintenanceLogs: [...],
  ...otherSettings
}
```

## 📦 Dependencies

### Backend
- `mongoose` - MongoDB ODM
- `express` - Web framework
- Existing: bcryptjs, jsonwebtoken

### Frontend
- `react` - UI library
- `react-router-dom` - Routing
- `redux` - State management
- `axios` - HTTP client

## 🎯 Quick Commands

```powershell
# Build frontend
npm run build

# Check for errors
npm run build 2>&1 | Select-String "error"

# Start backend
node server.js

# Check MongoDB connection
# (Look for "MongoDB connected successfully" in console)

# Clean rebuild
Remove-Item -Recurse -Force build ; npm run build
```

## ✅ Production Checklist

- [ ] Environment variables set
- [ ] MongoDB URI configured
- [ ] JWT secret secured
- [ ] Backend running on port 5000
- [ ] Frontend built and served
- [ ] Maintenance mode tested
- [ ] Admin login verified
- [ ] Non-admin blocking confirmed
- [ ] Logs recording properly
- [ ] Banner displaying correctly

## 📖 Related Documentation

- **MAINTENANCE_MODE_GUIDE.md** - Complete testing guide
- **SETTINGS_IMPLEMENTATION_SUMMARY.md** - Full implementation details
- **README.md** - Project overview

---

**Quick Support**: Check console logs first, verify MongoDB connection, ensure authentication tokens are valid.
