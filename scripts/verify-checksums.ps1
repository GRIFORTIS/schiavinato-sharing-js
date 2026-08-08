# Verify SHA256 checksums for DuraShare (JS) (Windows PowerShell)
#
# Usage:
#   .\scripts\verify-checksums.ps1 [version]
#
# Example:
#   .\scripts\verify-checksums.ps1 v0.1.0
#

param(
    [string]$Version = "latest"
)

$ErrorActionPreference = "Stop"
$Repo = "GRIFORTIS/durashare-js"
$ChecksumsFile = "CHECKSUMS-LIBRARY.txt"

Write-Host "🔐 Verifying checksums for DuraShare (JS)" -ForegroundColor Cyan
Write-Host ""

# Download checksums from GitHub release
Write-Host "📥 Downloading checksums for version: $Version" -ForegroundColor Yellow

if ($Version -eq "latest") {
    $ChecksumUrl = "https://github.com/$Repo/releases/latest/download/$ChecksumsFile"
} else {
    $ChecksumUrl = "https://github.com/$Repo/releases/download/$Version/$ChecksumsFile"
}

Write-Host "   URL: $ChecksumUrl"
Write-Host ""

# Download checksums file
try {
    Invoke-WebRequest -Uri $ChecksumUrl -OutFile $ChecksumsFile
    Write-Host "✓ Downloaded $ChecksumsFile" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to download checksums" -ForegroundColor Red
    Write-Host "   Make sure the release exists and has checksums attached"
    exit 1
}

Write-Host ""
Write-Host "📝 Checksums file content:"
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Get-Content $ChecksumsFile
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host ""

# Check if dist directory exists
if (-not (Test-Path "dist")) {
    Write-Host "⚠  dist/ directory not found" -ForegroundColor Yellow
    Write-Host "   Run 'npm run build' first"
    exit 1
}

# Verify checksums
Write-Host "🔍 Verifying checksums..." -ForegroundColor Cyan
Write-Host ""

$Passed = 0
$Failed = 0

Get-Content $ChecksumsFile | ForEach-Object {
    $line = $_
    
    # Skip empty lines and comments
    if ([string]::IsNullOrWhiteSpace($line) -or 
        $line -match "^#" -or 
        $line -match "^Version:" -or 
        $line -match "^Generated:" -or 
        $line -match "^##" -or 
        $line -match "^To verify" -or 
        $line -match "^\s+sha256sum") {
        return
    }
    
    # Extract checksum and filename
    $parts = $line -split '\s+', 2
    if ($parts.Length -lt 2) { return }
    
    $ExpectedHash = $parts[0]
    $Filename = $parts[1]
    
    $ActualFile = Join-Path "dist" $Filename
    # Backward-compat: some releases may list the browser bundle filename without path.
    # If the file isn't in dist\, try dist\browser\.
    if (-not (Test-Path $ActualFile)) {
        $Alt = Join-Path "dist\browser" $Filename
        if (Test-Path $Alt) { $ActualFile = $Alt }
    }
    
    if (Test-Path $ActualFile) {
        $ActualHash = (Get-FileHash -Path $ActualFile -Algorithm SHA256).Hash.ToLower()
        
        if ($ExpectedHash -eq $ActualHash) {
            Write-Host "✓ $Filename" -ForegroundColor Green
            $script:Passed++
        } else {
            Write-Host "✗ $Filename" -ForegroundColor Red
            Write-Host "   Expected: $ExpectedHash"
            Write-Host "   Got:      $ActualHash"
            $script:Failed++
        }
    } else {
        Write-Host "⚠  $Filename (not found)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
Write-Host "Results:"
Write-Host "  Passed: $Passed" -ForegroundColor Green
Write-Host "  Failed: $Failed" -ForegroundColor Red
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if ($Failed -gt 0) {
    Write-Host ""
    Write-Host "✗ Checksum verification FAILED" -ForegroundColor Red
    Write-Host "  Some files do not match the expected checksums."
    Write-Host "  This could indicate tampering or corruption."
    exit 1
} else {
    Write-Host ""
    Write-Host "✓ All checksums verified successfully!" -ForegroundColor Green
    Write-Host "  The files are authentic and have not been modified."
    exit 0
}

