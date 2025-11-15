# Quick Test - Add Sample Crop
# Copy and paste these commands one by one in PowerShell

# 1. Login (Replace with your actual farmer credentials)
$loginBody = '{"mobile":"1234567890","password":"password123"}' 
$loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $loginResponse.token
Write-Host "✅ Logged in as: $($loginResponse.user.name)"
Write-Host "Token: $token"

# 2. Add Sample Crop
$cropBody = '{
  "name": "Tomato",
  "category": "vegetables",
  "quantity": {"value": 500, "unit": "kg"},
  "availableQuantity": {"value": 500, "unit": "kg"},
  "price": {"value": 25, "unit": "per_kg"},
  "description": "Fresh organic tomatoes, harvested daily. Perfect for cooking and salads.",
  "availableFrom": "2025-11-15",
  "availableTo": "2025-12-31",
  "organicCertified": true,
  "qualityGrade": "Grade A",
  "pickupLocation": {"district": "Karur", "state": "Tamil Nadu"}
}'

$headers = @{"Authorization" = "Bearer $token"; "Content-Type" = "application/json"}
$cropResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/farmers/crops" -Method POST -Body $cropBody -Headers $headers
Write-Host "✅ Crop Added! ID: $($cropResponse.data._id)"

# 3. Verify - Get all crops
$cropsResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/farmers/crops" -Method GET -Headers $headers
Write-Host "📋 Total Crops: $($cropsResponse.total)"
$cropsResponse.data | Format-Table name, category, status, @{Name="Quantity";Expression={"$($_.quantity.value) $($_.quantity.unit)"}}, @{Name="Price";Expression={"₹$($_.price.value)/$($_.price.unit)"}}
