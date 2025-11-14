# 🚜 Farmer Registration Guide

## Overview

The farmer registration system follows a **4-step process** via the web dashboard. Once registered, farmers can access the system via IVR (phone call) using their mobile number and PIN.

---

## 📋 Registration Flow

### Step 1: Basic Information
**Endpoint:** `POST /api/auth/register/initiate`

**Required Fields:**
- Mobile Number (10 digits, unique)
- Full Name
- Role: "farmer"

**Response:**
```json
{
  "success": true,
  "message": "Registration initiated. Please verify OTP.",
  "data": {
    "userId": "user_id_here",
    "mobile": "9876543220",
    "registrationStage": 0,
    "otp": "1234" // In development mode
  }
}
```

---

### Step 2: Location Details
**Endpoint:** `POST /api/auth/register/step2`

**Required Fields:**
- userId (from Step 1)
- location:
  - address
  - village
  - district
  - state
  - pincode (6 digits)

**Response:**
```json
{
  "success": true,
  "message": "Location details saved",
  "data": {
    "userId": "user_id_here",
    "registrationStage": 1
  }
}
```

---

### Step 3: Farmer Details & PIN Setup
**Endpoint:** `POST /api/auth/register/step3`

**Required Fields:**
- userId (from previous step)
- **PIN (4-6 digits)** - CRITICAL for IVR access
- farmerDetails:
  - farmSize (in acres)
  - farmingType: "organic" | "conventional" | "mixed"
  - preferredLanguage: "english" | "tamil" | "hindi" | "telugu" | "kannada"
  - crops: array of crop names
  - bankDetails:
    - accountHolderName
    - accountNumber
    - ifscCode (11 characters)
    - bankName

**Example Request:**
```json
{
  "userId": "user_id_here",
  "pin": "1234",
  "farmerDetails": {
    "farmSize": 5,
    "farmingType": "organic",
    "preferredLanguage": "tamil",
    "crops": ["Tomato", "Onion", "Potato"],
    "bankDetails": {
      "accountHolderName": "Farmer Name",
      "accountNumber": "1234567890",
      "ifscCode": "SBIN0001234",
      "bankName": "State Bank of India"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Details saved successfully",
  "data": {
    "userId": "user_id_here",
    "registrationStage": 2
  }
}
```

---

### Step 4: Complete Registration
**Endpoint:** `POST /api/auth/register/step4`

**Required Fields:**
- userId (from previous step)
- email (optional)

**Response:**
```json
{
  "success": true,
  "message": "Registration completed successfully",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "name": "Farmer Name",
      "mobile": "9876543220",
      "role": "farmer",
      "email": "farmer@example.com",
      "location": { ... },
      "registrationCompleted": true
    }
  }
}
```

---

## 📞 IVR Login (After Registration)

Once registration is complete, farmers can login via IVR using their mobile number and PIN.

**Endpoint:** `POST /api/auth/login/pin`

**Required Fields:**
- mobile (registered mobile number)
- pin (PIN set during registration)

**Example Request:**
```json
{
  "mobile": "9876543220",
  "pin": "1234"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Vanakkam, Farmer Name! Welcome to Uthra.",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "name": "Farmer Name",
      "mobile": "9876543220",
      "role": "farmer",
      "farmerDetails": { ... },
      "preferredLanguage": "tamil"
    },
    "greeting": {
      "tamil": "வணக்கம், Farmer Name! உத்ராவிற்கு வரவேற்கிறோம்.",
      "english": "Welcome, Farmer Name! Welcome to Uthra.",
      "hindi": "नमस्ते, Farmer Name! उथरा में आपका स्वागत है।"
    }
  }
}
```

---

## 🎯 Key Features

### 1. **PIN-Based Authentication**
- Farmers set a 4-6 digit PIN during registration
- PIN is stored as plain text (as per requirements)
- Used for IVR authentication (phone access)
- No password required for farmers (PIN is primary auth method)

### 2. **Multi-Language Support**
- Preferred language stored in farmer profile
- Greeting messages in Tamil, English, and Hindi
- IVR system can use preferred language

### 3. **Bank Details**
- Secure storage of bank account information
- Used for payment processing
- IFSC code validation

### 4. **Location Tracking**
- Village, district, and state information
- Helps in crop delivery and logistics
- Used for buyer-farmer matching

### 5. **Activity Tracking**
- Last IVR call timestamp
- Total IVR calls counter
- Login history

---

## 🔐 Security Features

1. **Unique Mobile Number:** Each mobile number can only be registered once
2. **PIN Validation:** 4-6 digits, numeric only
3. **Account Activation:** Admin can activate/deactivate accounts
4. **Registration Completion:** Multi-step process ensures complete data
5. **JWT Tokens:** Secure session management

---

## 📝 Database Schema (Farmer-Specific Fields)

```javascript
{
  mobile: String (unique, 10 digits),
  name: String (required),
  role: "farmer",
  pin: String (4-6 digits, required for farmers),
  password: String (optional for farmers),
  
  location: {
    address: String,
    village: String,
    district: String,
    state: String,
    pincode: String
  },
  
  farmerDetails: {
    farmSize: Number (in acres),
    farmingType: String (organic/conventional/mixed),
    preferredLanguage: String (tamil/english/hindi/telugu/kannada),
    crops: [String],
    bankDetails: {
      accountHolderName: String,
      accountNumber: String,
      ifscCode: String,
      bankName: String
    }
  },
  
  registrationCompleted: Boolean,
  isActive: Boolean,
  lastIVRCall: Date,
  totalIVRCalls: Number,
  
  timestamps: {
    createdAt: Date,
    updatedAt: Date
  }
}
```

---

## 🧪 Testing

Use the provided test script to verify registration:

```bash
node test-farmer-registration.js
```

This will:
1. Register a test farmer
2. Complete all 4 steps
3. Test PIN login
4. Verify greeting messages
5. Confirm data storage

---

## ✅ Success Criteria

A farmer registration is considered successful when:

- ✅ All 4 steps completed
- ✅ PIN is set (4-6 digits)
- ✅ Location details saved
- ✅ Farm and bank details stored
- ✅ `registrationCompleted = true`
- ✅ `isActive = true`
- ✅ Can login via PIN
- ✅ Greeting message displayed correctly

---

## 🚨 Common Issues & Solutions

### Issue 1: "Mobile number already registered"
**Solution:** Each mobile can only register once. Use a different number or check if user exists.

### Issue 2: "PIN must be 4-6 digits"
**Solution:** Ensure PIN contains only numbers and is 4-6 characters long.

### Issue 3: "Invalid registration stage"
**Solution:** Steps must be completed in order (0 → 1 → 2 → 4).

### Issue 4: "Please complete registration first"
**Solution:** User tried PIN login before completing registration. Complete all 4 steps first.

---

## 📞 IVR Flow (After Registration)

```
1. Farmer calls Uthra number
2. System: "Enter your mobile number"
3. Farmer enters: 9876543220
4. System: "Enter your PIN"
5. Farmer enters: 1234
6. System: "Vanakkam, Farmer Name! Welcome to Uthra."
7. Main Menu:
   Press 1 → Enter new crop
   Press 2 → Manage crop details
   Press 3 → View requests received
   Press 4 → Talk to agent
   Press 9 → Return to Home
```

---

## 🎉 Summary

The farmer registration system is now fully functional with:

- ✅ Web-based registration (4 steps)
- ✅ PIN-based IVR authentication
- ✅ Multi-language greeting support
- ✅ Complete farmer profile storage
- ✅ Bank details for payments
- ✅ Location tracking
- ✅ Activity monitoring
- ✅ Ready for IVR integration

**All data is properly stored in MongoDB and can be accessed via the API!** 🌾
