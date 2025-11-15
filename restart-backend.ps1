# Restart Backend Server Script
Write-Host "🔄 Restarting Backend Server..." -ForegroundColor Cyan
Write-Host ""

# Find and stop the backend server process
$backendPath = "C:\Users\nares\OneDrive\Desktop\Uthra"
$serverProcess = Get-Process node -ErrorAction SilentlyContinue | Where-Object {
    $_.Path -eq "C:\Program Files\nodejs\node.exe"
}

if ($serverProcess) {
    Write-Host "📍 Found $($serverProcess.Count) Node.js processes running" -ForegroundColor Yellow
    Write-Host "⚠️  Please manually stop the backend server in the terminal where you ran 'node server.js'" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Steps:" -ForegroundColor Cyan
    Write-Host "  1. Go to the terminal running the backend" -ForegroundColor White
    Write-Host "  2. Press Ctrl+C" -ForegroundColor White
    Write-Host "  3. Run: cd backend" -ForegroundColor White
    Write-Host "  4. Run: node server.js" -ForegroundColor White
    Write-Host ""
    Write-Host "Or run this command in a new terminal:" -ForegroundColor Cyan
    Write-Host "  cd $backendPath\backend; node server.js" -ForegroundColor Green
} else {
    Write-Host "✅ No backend server found running" -ForegroundColor Green
    Write-Host "Starting backend server..." -ForegroundColor Cyan
    
    Set-Location "$backendPath\backend"
    node server.js
}
