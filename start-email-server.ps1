Write-Host "Starting Email Server..." -ForegroundColor Green
Write-Host ""
Write-Host "Email server will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Make sure to also start your website server on port 8000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

# Check if Node.js is installed
if (Get-Command node -ErrorAction SilentlyContinue) {
    node server.js
} else {
    Write-Host "Error: Node.js is not installed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    pause
}

