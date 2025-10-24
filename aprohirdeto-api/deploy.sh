#!/bin/bash

# Mini Apróhirdető API Deployment Script
# Használat: ./deploy.sh [környezet]

set -e

ENVIRONMENT=${1:-production}
PROJECT_NAME="aprohirdeto-api"
IMAGE_NAME="$PROJECT_NAME:latest"

echo "============================================"
echo "  Mini Apróhirdető API Deployment"
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

# Ellenőrizzük, hogy Docker fut-e
if ! docker --version > /dev/null 2>&1; then
    log_error "Docker nincs telepítve vagy nem fut!"
    exit 1
fi

log_info "Docker verzió: $(docker --version)"

# Régi konténerek leállítása
log_info "Régi konténerek leállítása..."
docker-compose down --remove-orphans || true

# Docker image építése
log_info "Docker image építése..."
docker build -t $IMAGE_NAME .

# Környezeti változók ellenőrzése
if [ ! -f ".env" ]; then
    log_warn ".env fájl nem található! Másold át a .env.example fájlt és töltsd ki!"
    if [ -f ".env.example" ]; then
        cp .env.example .env
        log_info ".env.example -> .env másolva. Kérlek, töltsd ki a megfelelő értékekkel!"
        exit 1
    fi
fi

# Konténer indítása
log_info "Alkalmazás indítása..."
docker-compose up -d

# Health check
log_info "Health check végrehajtása..."
sleep 10

HEALTH_URL="http://localhost:3000/api/health"
for i in {1..30}; do
    if curl -f $HEALTH_URL > /dev/null 2>&1; then
        log_info "✅ Alkalmazás sikeresen elindult!"
        log_info "🔗 API elérhető: http://localhost:3000"
        log_info "🔗 Health check: $HEALTH_URL"
        break
    fi
    
    if [ $i -eq 30 ]; then
        log_error "❌ Alkalmazás nem indult el 5 perc alatt!"
        docker-compose logs
        exit 1
    fi
    
    log_info "Várakozás az alkalmazás indulására... ($i/30)"
    sleep 10
done

# Logok megjelenítése
log_info "Utolsó 20 sor a logokból:"
docker-compose logs --tail=20

log_info "============================================"
log_info "  Deployment befejezve!"
log_info "  Logok megtekintése: docker-compose logs -f"
log_info "  Leállítás: docker-compose down"
log_info "============================================"
