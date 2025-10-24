# AWS Lambda Deployment Package Builder (PowerShell)
# Mini Apróhirdető - Thumbnail Generation Lambda

param(
    [string]$FunctionName = "aprohirdeto-thumbnail-generator"
)

$ZipFile = "lambda-deployment-package.zip"
$TempDir = "lambda-temp"

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "  Lambda Deployment Package Builder" -ForegroundColor Cyan
Write-Host "  Function: $FunctionName" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Warn {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Cleanup function
function Cleanup {
    if (Test-Path $TempDir) {
        Remove-Item -Recurse -Force $TempDir
        Write-Info "Cleaned up temporary directory"
    }
}

# Ellenőrizzük a szükséges fájlokat
if (!(Test-Path "lambda_function.py")) {
    Write-Error "lambda_function.py not found!"
    exit 1
}

Write-Info "Creating deployment package..."

# Régi fájlok törlése
if (Test-Path $ZipFile) {
    Remove-Item $ZipFile
    Write-Info "Removed existing ZIP file"
}

# Temporary directory létrehozása
if (Test-Path $TempDir) {
    Remove-Item -Recurse -Force $TempDir
}
New-Item -ItemType Directory -Path $TempDir | Out-Null

# Lambda function másolása
Copy-Item "lambda_function.py" -Destination $TempDir
Write-Info "Lambda function copied to temp directory"

# ZIP fájl létrehozása
try {
    Compress-Archive -Path "$TempDir\*" -DestinationPath $ZipFile -Force
    Write-Info "Deployment package created: $ZipFile"
} catch {
    Write-Error "Failed to create ZIP file: $_"
    Cleanup
    exit 1
}

# Package info
$PackageSize = (Get-Item $ZipFile).Length
$PackageSizeMB = [math]::Round($PackageSize / 1MB, 2)
Write-Info "Package size: $PackageSizeMB MB"

# Cleanup
Cleanup

Write-Host ""
Write-Host "===========================================" -ForegroundColor Green
Write-Host "  Deployment Instructions" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green
Write-Host ""
Write-Host "1. AWS CLI deployment:" -ForegroundColor Yellow
Write-Host "   aws lambda create-function \"
Write-Host "     --function-name $FunctionName \"
Write-Host "     --runtime python3.11 \"
Write-Host "     --role arn:aws:iam::ACCOUNT:role/lambda-execution-role \"
Write-Host "     --handler lambda_function.lambda_handler \"
Write-Host "     --zip-file fileb://$ZipFile \"
Write-Host "     --timeout 30 \"
Write-Host "     --memory-size 512"
Write-Host ""
Write-Host "2. Environment variables to set:" -ForegroundColor Yellow
Write-Host "   - DB_HOST: your-rds-endpoint.region.rds.amazonaws.com"
Write-Host "   - DB_USER: admin" 
Write-Host "   - DB_PASSWORD: your-secure-password"
Write-Host "   - DB_NAME: aprohirdeto"
Write-Host ""
Write-Host "3. Required Lambda Layer:" -ForegroundColor Yellow
Write-Host "   - Pillow + PyMySQL layer"
Write-Host "   - Or create custom layer with requirements.txt"
Write-Host ""
Write-Host "4. S3 Trigger setup:" -ForegroundColor Yellow
Write-Host "   - Bucket: beadando-kepek-w4pp9o"
Write-Host "   - Event: s3:ObjectCreated:*" 
Write-Host "   - Prefix: uploads/"
Write-Host ""
Write-Host "Package ready: $ZipFile" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green
