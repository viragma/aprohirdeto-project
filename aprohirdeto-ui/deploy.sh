#!/bin/bash

# Mini Apróhirdető UI Deployment Script
# Használat: ./deploy.sh [környezet]

set -e

ENVIRONMENT=${1:-production}
PROJECT_NAME="aprohirdeto-ui"
IMAGE_NAME="$PROJECT_NAME:latest"

echo "============================================"
echo "  Mini Apróhirdető UI Deployment"
echo "  Környezet: $ENVIRONMENT"
echo "============================================"

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

# Docker ellenőrzése
if ! docker --version > /dev/null 2>&1; then
    log_error "Docker nincs telepítve vagy nem fut!"
    exit 1
fi

log_info "Docker verzió: $(docker --version)"

# Régi konténerek leállítása
log_info "Régi konténerek leállítása..."
docker-compose down --remove-orphans || true

# Fájlok ellenőrzése
REQUIRED_FILES=("index.html" "styles.css" "app.js")
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        log_error "Hiányzó fájl: $file"
        exit 1
    fi
done

log_info "Összes szükséges fájl megtalálható ✓"

# Docker image építése
log_info "Docker image építése..."
docker build -t $IMAGE_NAME .

if [ $? -ne 0 ]; then
    log_error "Docker build sikertelen!"
    exit 1
fi

# Konténer indítása
log_info "Alkalmazás indítása..."
docker-compose up -d

if [ $? -ne 0 ]; then
    log_error "Konténer indítás sikertelen!"
    exit 1
fi

# Health check
log_info "Health check végrehajtása..."
sleep 5

HEALTH_URL="http://localhost/"
for i in {1..20}; do
    if curl -f $HEALTH_URL > /dev/null 2>&1; then
        log_info "✅ Alkalmazás sikeresen elindult!"
        log_info "🔗 UI elérhető: http://localhost"
        log_info "🔗 Health check: $HEALTH_URL"
        break
    fi
    
    if [ $i -eq 20 ]; then
        log_error "❌ Alkalmazás nem indult el 2 perc alatt!"
        docker-compose logs
        exit 1
    fi
    
    log_info "Várakozás az alkalmazás indulására... ($i/20)"
    sleep 6
done

# Logok megjelenítése
log_info "Utolsó 10 sor a logokból:"
docker-compose logs --tail=10

log_info "============================================"
log_info "  UI Deployment befejezve!"
log_info "  Alkalmazás: http://localhost"
log_info "  Logok: docker-compose logs -f"
log_info "  Leállítás: docker-compose down"
log_info "============================================"
