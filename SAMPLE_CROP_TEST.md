# Sample Crop Addition Test

## Method 1: Via Frontend UI
1. Start the backend: `node server.js` (in Backend directory)
2. Start the frontend: `npm start` (in frontend directory)
3. Login as a farmer
4. Navigate to "My Crops" page
5. Click "Add New Crop" button
6. Fill in the following details:

### Sample Crop Details:
```
Name: Tomato
Category: vegetables
Quantity: 500 kg
Price: ₹25 per kg
Description: Fresh organic tomatoes, harvested daily. Perfect for cooking and salads.
Available From: 2025-11-15
Available To: 2025-12-31
Organic Certified: Yes (checked)
Quality Grade: Grade A
District: Karur
State: Tamil Nadu
```

## Method 2: Via PowerShell/API Call

### Step 1: Login to get token
```powershell
$loginBody = @{
    mobile = "YOUR_FARMER_MOBILE"
    password = "YOUR_PASSWORD"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $loginResponse.token
Write-Host "Token: $token"
```

### Step 2: Add Crop
```powershell
$cropBody = @{
    name = "Tomato"
    category = "vegetables"
    quantity = @{
        value = 500
        unit = "kg"
    }
    availableQuantity = @{
        value = 500
        unit = "kg"
    }
    price = @{
        value = 25
        unit = "per_kg"
    }
    description = "Fresh organic tomatoes, harvested daily. Perfect for cooking and salads."
    availableFrom = "2025-11-15"
    availableTo = "2025-12-31"
    organicCertified = $true
    qualityGrade = "Grade A"
    pickupLocation = @{
        district = "Karur"
        state = "Tamil Nadu"
    }
} | ConvertTo-Json -Depth 10

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$cropResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/farmers/crops" -Method POST -Body $cropBody -Headers $headers
$cropResponse | ConvertTo-Json
```

## Method 3: Direct MongoDB Insert

If you have access to MongoDB, you can insert directly:

```javascript
// Replace YOUR_FARMER_ID with actual farmer ObjectId from users collection
db.crops.insertOne({
  farmer: ObjectId("YOUR_FARMER_ID"),
  name: "Tomato",
  category: "vegetables",
  quantity: { value: 500, unit: "kg" },
  availableQuantity: { value: 500, unit: "kg" },
  price: { value: 25, unit: "per_kg" },
  description: "Fresh organic tomatoes, harvested daily. Perfect for cooking and salads.",
  availableFrom: new Date("2025-11-15"),
  availableTo: new Date("2025-12-31"),
  quality: "grade_a",
  pickupLocation: {
    district: "Karur",
    state: "Tamil Nadu"
  },
  status: "active",
  isVisible: true,
  entryMethod: "web",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

## Verification Steps:

After adding the crop, verify by:
1. Checking the frontend "My Crops" page
2. Making GET request: `GET http://localhost:5000/api/farmers/crops`
3. Checking MongoDB: `db.crops.find().pretty()`

## Expected Response Format:

```json
{
  "success": true,
  "message": "Crop added successfully",
  "data": {
    "_id": "...",
    "farmer": "...",
    "name": "Tomato",
    "category": "vegetables",
    "quantity": {
      "value": 500,
      "unit": "kg"
    },
    "availableQuantity": {
      "value": 500,
      "unit": "kg"
    },
    "price": {
      "value": 25,
      "unit": "per_kg"
    },
    "description": "Fresh organic tomatoes, harvested daily...",
    "availableFrom": "2025-11-15T00:00:00.000Z",
    "availableTo": "2025-12-31T00:00:00.000Z",
    "pickupLocation": {
      "district": "Karur",
      "state": "Tamil Nadu"
    },
    "status": "active",
    "isVisible": true,
    "entryMethod": "web",
    "createdAt": "2025-11-15T...",
    "updatedAt": "2025-11-15T..."
  }
}
```
