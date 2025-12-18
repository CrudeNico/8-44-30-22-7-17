Write-Host "Starting local development server..." -ForegroundColor Green
Write-Host ""
Write-Host "Server will be available at: http://localhost:8000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Try Python first, then Node.js serve, then PHP
if (Get-Command python -ErrorAction SilentlyContinue) {
    python -m http.server 8000
} elseif (Get-Command python3 -ErrorAction SilentlyContinue) {
    python3 -m http.server 8000
} elseif (Get-Command npx -ErrorAction SilentlyContinue) {
    npx serve -p 8000
} elseif (Get-Command php -ErrorAction SilentlyContinue) {
    php -S localhost:8000
} else {
    Write-Host "Error: No server found. Please install Python, Node.js, or PHP" -ForegroundColor Red
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Yellow
    Write-Host "1. Install Python: https://www.python.org/downloads/"
    Write-Host "2. Install Node.js: https://nodejs.org/"
    Write-Host "3. Install PHP: https://www.php.net/downloads.php"
    pause
}


