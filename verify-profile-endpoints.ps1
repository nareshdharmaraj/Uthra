# Verify Profile Endpoints Are Working

Write-Host "🔍 Checking if profile endpoints are available..." -ForegroundColor Cyan

try {
    # Test health endpoint first
    $health = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method GET -ErrorAction Stop
    Write-Host "✅ Backend server is running" -ForegroundColor Green
    
    # Try to hit profile endpoint (will fail auth, but should not be 404)
    try {
        Invoke-RestMethod -Uri "http://localhost:5000/api/farmers/profile" -Method GET -ErrorAction Stop
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        
        if ($statusCode -eq 404) {
            Write-Host "❌ Profile endpoint NOT FOUND (404)" -ForegroundColor Red
            Write-Host "   Server needs to be restarted!" -ForegroundColor Yellow
        } elseif ($statusCode -eq 401) {
            Write-Host "✅ Profile endpoint EXISTS (401 Unauthorized - this is expected)" -ForegroundColor Green
            Write-Host "   Endpoint is working! Authentication required." -ForegroundColor Cyan
        } else {
            Write-Host "⚠️  Profile endpoint returned: $statusCode" -ForegroundColor Yellow
        }
    }
    
} catch {
    Write-Host "❌ Cannot connect to backend server" -ForegroundColor Red
    Write-Host "   Make sure server is running on http://localhost:5000" -ForegroundColor Yellow
}

Write-Host "`nPress any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
