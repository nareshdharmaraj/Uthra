# 🌾 Uthra - How to Run

**Light of Communication between Farmers and Buyers**

---

## ✅ Prerequisites

1. **MongoDB** must be running on `localhost:27017`
2. **Node.js** installed (v14 or higher)
3. **npm** package manager

---

## 🚀 Quick Start

### **Backend Server**

```powershell
# From the project root directory
node server.js
```

**Expected Output:**
```
✅ Mongoose configured in database.js
✅ Middleware configured
🔄 Connecting to MongoDB...
✅ MongoDB Connected: localhost
✅ Database: Uthra
✅ Connection State: 1
✅ Collections found: 6
✅ Disabled buffering after connection established
✅ Database connection ready and verified!
✅ Routes configured

╔═══════════════════════════════════════╗
║                                       ║
║        🌾 Uthra Server 🌾            ║
║                                       ║
║   Light of Communication between      ║
║      Farmers and Buyers               ║
║                                       ║
╚═══════════════════════════════════════╝

Server running in development mode
Port: 5000
Database: Ready ✅
API: http://localhost:5000
```

### **Frontend Application**

```powershell
# Open a NEW terminal window
cd frontend
npm start
```

**The React app will automatically open at:** `http://localhost:3000`

---

## 🔐 Test Credentials

| Role   | Mobile      | Password |
|--------|-------------|----------|
| Admin  | 9876543210  | 123456   |
| Farmer | 9876543211  | 123456   |
| Buyer  | 9876543212  | 123456   |

---

## 📋 Testing the Application

### 1. **Login**
   - Navigate to `http://localhost:3000/login`
   - Enter mobile number and password
   - Click "Login"

### 2. **Admin Dashboard**
   - Login with: `9876543210` / `123456`
   - Redirects to: `/admin`
   - Features:
     - View all users
     - Manage crops
     - Manage requests
     - View analytics
     - System settings

### 3. **Farmer Dashboard**
   - Login with: `9876543211` / `123456`
   - Redirects to: `/farmer`
   - Features:
     - Add new crops
     - View my crops
     - Manage requests
     - Profile settings

### 4. **Buyer Dashboard**
   - Login with: `9876543212` / `123456`
   - Redirects to: `/buyer`
   - Features:
     - Browse crops
     - Send requests
     - View my requests
     - Profile settings

---

## 🔧 Environment Configuration

The application uses plain text passwords (as per requirements). All environment variables are configured in:
- **Backend:** Root `.env` file
- **Frontend:** `frontend/.env`

### MongoDB Connection String
```
mongodb://naresh:123456789@localhost:27017/Uthra?authSource=admin
```

---

## 🌐 API Endpoints

**Base URL:** `http://localhost:5000/api`

### Authentication
- `POST /auth/register/initiate` - Start registration
- `POST /auth/login` - Login (web)
- `POST /auth/login/pin` - Login with PIN (IVR)

### Users
- `GET /users/me` - Get current user
- `PUT /users/profile` - Update profile
- `PUT /users/password` - Change password

### Farmers
- `POST /farmers/crops` - Add crop
- `GET /farmers/my-crops` - Get farmer's crops
- `PUT /farmers/crops/:id` - Update crop
- `DELETE /farmers/crops/:id` - Delete crop

### Buyers
- `GET /buyers/crops` - Browse all crops
- `POST /buyers/requests` - Create request
- `GET /buyers/my-requests` - Get buyer's requests

### Admin
- `GET /admin/users` - Get all users
- `GET /admin/crops` - Get all crops
- `GET /admin/requests` - Get all requests
- `DELETE /admin/users/:id` - Delete user

---

## 🛠️ Troubleshooting

### Backend Not Starting

**Issue:** MongoDB connection failed
```
❌ MongoDB connection failed: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:**
1. Ensure MongoDB service is running
2. Check MongoDB credentials in `.env`
3. Verify connection string

---

### Frontend Not Loading

**Issue:** `npm start` fails

**Solution:**
```powershell
cd frontend
rm -r node_modules
rm package-lock.json
npm install
npm start
```

---

### Login Fails with 500 Error

**Issue:** Mongoose buffering timeout

**Solution:**
1. Restart backend server
2. Verify MongoDB is running
3. Check that all schemas use the connected mongoose instance

---

## 📦 Project Structure

```
Uthra/
├── Backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Auth, validation, error handling
│   ├── models/          # Model imports
│   └── routes/          # API routes
├── Database/
│   └── *Schema.js       # Mongoose schemas
├── frontend/
│   ├── public/          # Static files
│   └── src/
│       ├── components/  # React components
│       ├── features/    # Redux slices
│       ├── pages/       # Page components
│       ├── services/    # API services
│       └── types/       # TypeScript types
├── server.js            # Backend entry point
├── .env                 # Environment variables
└── package.json         # Backend dependencies
```

---

## 📝 Important Notes

1. **Password Storage:** Passwords are stored as **plain text** (as per requirements)
2. **Authentication:** JWT tokens with 30-day expiration
3. **Role-Based Access:** Admin, Farmer, and Buyer roles with specific permissions
4. **Database:** MongoDB with 6 collections (users, crops, requests, notifications, calllogs, smslogs)
5. **Port Configuration:**
   - Backend: `5000`
   - Frontend: `3000`

---

## ✨ Features Implemented

✅ Full TypeScript migration (frontend)
✅ Redux Toolkit state management
✅ Role-based authentication and routing
✅ Private route protection
✅ Admin, Farmer, and Buyer dashboards
✅ RESTful API with Express.js
✅ MongoDB with Mongoose ODM
✅ Error handling and validation
✅ Rate limiting
✅ CORS configuration

---

## 🎯 Next Steps

1. **Start Backend:** `node server.js`
2. **Start Frontend:** `cd frontend && npm start`
3. **Navigate to:** `http://localhost:3000`
4. **Login and Explore!**

---

## 📞 Support

If you encounter any issues:
1. Check that MongoDB is running
2. Verify all dependencies are installed (`npm install`)
3. Ensure ports 3000 and 5000 are not in use
4. Restart both servers

---

**🌾 Uthra - Connecting Farmers and Buyers** ✨
