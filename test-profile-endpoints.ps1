# Test Profile Endpoints

# Step 1: Login
$loginBody = '{"mobile":"YOUR_MOBILE","password":"YOUR_PASSWORD"}'
$loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $loginResponse.token
$headers = @{"Authorization"="Bearer $token";"Content-Type"="application/json"}

Write-Host "✅ Logged in as: $($loginResponse.user.name)" -ForegroundColor Green

# Step 2: Get Profile
Write-Host "`n📋 Fetching profile..." -ForegroundColor Cyan
$profile = Invoke-RestMethod -Uri "http://localhost:5000/api/farmers/profile" -Method GET -Headers $headers
Write-Host "Profile:" -ForegroundColor Yellow
$profile.data | ConvertTo-Json -Depth 5

# Step 3: Update Profile
Write-Host "`n✏️ Updating profile..." -ForegroundColor Cyan
$updateBody = @{
    name = "Updated Farmer Name"
    email = "farmer@example.com"
    farmerDetails = @{
        farmSize = @{
            value = 10
            unit = "acres"
        }
        primaryCrops = @("Tomato", "Potato", "Onion")
        farmingExperience = 5
        organicCertified = $true
    }
} | ConvertTo-Json -Depth 5

$updateResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/farmers/profile" -Method PUT -Body $updateBody -Headers $headers
Write-Host "✅ Profile updated!" -ForegroundColor Green
$updateResponse.data | ConvertTo-Json -Depth 5
