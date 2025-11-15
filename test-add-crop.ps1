# Test Add Crop via API
# This script tests adding a sample crop through the backend API

Write-Host "🌾 Uthra - Sample Crop Addition Test" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

# Configuration
$API_BASE = "http://localhost:5000/api"

# Prompt for farmer credentials
Write-Host "📝 Enter Farmer Credentials:" -ForegroundColor Yellow
$mobile = Read-Host "Mobile Number (e.g., 1234567890)"
$password = Read-Host "Password" -AsSecureString
$passwordText = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

try {
    # Step 1: Login
    Write-Host "`n🔐 Step 1: Logging in as farmer..." -ForegroundColor Cyan
    
    $loginBody = @{
        mobile = $mobile
        password = $passwordText
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$API_BASE/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.token
    
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host "User: $($loginResponse.user.name)" -ForegroundColor White
    Write-Host "Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
    
    # Step 2: Add Sample Crop
    Write-Host "`n🌾 Step 2: Adding sample crop..." -ForegroundColor Cyan
    
    $cropData = @{
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
    }
    
    Write-Host "Crop Details:" -ForegroundColor Yellow
    Write-Host "  Name: $($cropData.name)"
    Write-Host "  Category: $($cropData.category)"
    Write-Host "  Quantity: $($cropData.quantity.value) $($cropData.quantity.unit)"
    Write-Host "  Price: ₹$($cropData.price.value) $($cropData.price.unit)"
    Write-Host "  Organic: $($cropData.organicCertified)"
    Write-Host "  Location: $($cropData.pickupLocation.district), $($cropData.pickupLocation.state)"
    
    $cropBody = $cropData | ConvertTo-Json -Depth 10
    
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $cropResponse = Invoke-RestMethod -Uri "$API_BASE/farmers/crops" -Method POST -Body $cropBody -Headers $headers
    
    Write-Host "`n✅ Crop added successfully!" -ForegroundColor Green
    Write-Host "Crop ID: $($cropResponse.data._id)" -ForegroundColor White
    Write-Host "Status: $($cropResponse.data.status)" -ForegroundColor White
    
    # Step 3: Fetch all crops to verify
    Write-Host "`n📋 Step 3: Fetching all crops to verify..." -ForegroundColor Cyan
    
    $cropsResponse = Invoke-RestMethod -Uri "$API_BASE/farmers/crops" -Method GET -Headers $headers
    
    Write-Host "✅ Total Crops: $($cropsResponse.total)" -ForegroundColor Green
    
    if ($cropsResponse.data.Count -gt 0) {
        Write-Host "`nYour Crops:" -ForegroundColor Yellow
        foreach ($crop in $cropsResponse.data) {
            Write-Host "  • $($crop.name) - $($crop.quantity.value) $($crop.quantity.unit) @ ₹$($crop.price.value)/$($crop.price.unit) - Status: $($crop.status)" -ForegroundColor White
        }
    }
    
    Write-Host "`n" + ("=" * 60) -ForegroundColor Green
    Write-Host "🎉 Test completed successfully!" -ForegroundColor Green
    Write-Host "You can now view this crop in the frontend at: http://localhost:3000/farmer/my-crops" -ForegroundColor Cyan
    
} catch {
    Write-Host "`n❌ Error occurred:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.ErrorDetails.Message) {
        $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "`nError Details:" -ForegroundColor Yellow
        Write-Host ($errorDetails | ConvertTo-Json -Depth 5) -ForegroundColor White
    }
    
    Write-Host "`n💡 Troubleshooting Tips:" -ForegroundColor Yellow
    Write-Host "1. Make sure the backend server is running (node server.js)" -ForegroundColor White
    Write-Host "2. Verify your farmer credentials are correct" -ForegroundColor White
    Write-Host "3. Check if MongoDB is running and connected" -ForegroundColor White
    Write-Host "4. Ensure the farmer user exists in the database" -ForegroundColor White
}

Write-Host "`nPress any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
