#!/bin/bash

# AWS Lambda Deployment Package Builder
# Mini Apróhirdető - Thumbnail Generation Lambda

set -e

FUNCTION_NAME="aprohirdeto-thumbnail-generator"
ZIP_FILE="lambda-deployment-package.zip"
TEMP_DIR="lambda-temp"

echo "==========================================="
echo "  Lambda Deployment Package Builder"
echo "  Function: $FUNCTION_NAME"
echo "==========================================="

# Színek
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Cleanup function
cleanup() {
    if [ -d "$TEMP_DIR" ]; then
        rm -rf "$TEMP_DIR"
        log_info "Cleaned up temporary directory"
    fi
}

# Set trap for cleanup
trap cleanup EXIT

# Ellenőrizzük a szükséges fájlokat
if [ ! -f "lambda_function.py" ]; then
    log_error "lambda_function.py not found!"
    exit 1
fi

log_info "Creating deployment package..."

# Temporary directory létrehozása
mkdir -p "$TEMP_DIR"

# Lambda function másolása
cp lambda_function.py "$TEMP_DIR/"

log_info "Lambda function copied to temp directory"

# ZIP fájl létrehozása
cd "$TEMP_DIR"
zip -r "../$ZIP_FILE" .
cd ..

log_info "Deployment package created: $ZIP_FILE"

# Package info
PACKAGE_SIZE=$(du -h "$ZIP_FILE" | cut -f1)
log_info "Package size: $PACKAGE_SIZE"

echo ""
echo "==========================================="
echo "  Deployment Instructions"
echo "==========================================="
echo ""
echo "1. AWS CLI deployment:"
echo "   aws lambda create-function \\"
echo "     --function-name $FUNCTION_NAME \\"
echo "     --runtime python3.11 \\"
echo "     --role arn:aws:iam::ACCOUNT:role/lambda-execution-role \\"
echo "     --handler lambda_function.lambda_handler \\"
echo "     --zip-file fileb://$ZIP_FILE \\"
echo "     --timeout 30 \\"
echo "     --memory-size 512"
echo ""
echo "2. Environment variables to set:"
echo "   - DB_HOST: your-rds-endpoint.region.rds.amazonaws.com"
echo "   - DB_USER: admin"
echo "   - DB_PASSWORD: your-secure-password"
echo "   - DB_NAME: aprohirdeto"
echo ""
echo "3. Required Lambda Layer:"
echo "   - Pillow + PyMySQL layer"
echo "   - Or create custom layer with requirements.txt"
echo ""
echo "4. S3 Trigger setup:"
echo "   - Bucket: beadando-kepek-w4pp9o"
echo "   - Event: s3:ObjectCreated:*"
echo "   - Prefix: uploads/"
echo ""
echo "Package ready: $ZIP_FILE"
echo "==========================================="
