# Mini Apróhirdető API Deployment Script (Windows PowerShell)
# Használat: .\deploy.ps1 [környezet]

param(
    [string]$Environment = "production"
)

$ProjectName = "aprohirdeto-api"
$ImageName = "$ProjectName:latest"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Mini Apróhirdető API Deployment" -ForegroundColor Cyan
Write-Host "  Környezet: $Environment" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

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

# Docker ellenőrzése
try {
    $dockerVersion = docker --version
    Write-Info "Docker verzió: $dockerVersion"
} catch {
    Write-Error "Docker nincs telepítve vagy nem fut!"
    exit 1
}

# Régi konténerek leállítása
Write-Info "Régi konténerek leállítása..."
try {
    docker-compose down --remove-orphans
} catch {
    Write-Warn "Nincs futó konténer."
}

# Docker image építése
Write-Info "Docker image építése..."
docker build -t $ImageName .

if ($LASTEXITCODE -ne 0) {
    Write-Error "Docker build sikertelen!"
    exit 1
}

# Környezeti változók ellenőrzése
if (!(Test-Path ".env")) {
    Write-Warn ".env fájl nem található!"
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Info ".env.example -> .env másolva. Kérlek, töltsd ki a megfelelő értékekkel!"
        exit 1
    }
}

# Konténer indítása
Write-Info "Alkalmazás indítása..."
docker-compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Error "Konténer indítás sikertelen!"
    exit 1
}

# Health check
Write-Info "Health check végrehajtása..."
Start-Sleep -Seconds 10

$healthUrl = "http://localhost:3000/api/health"
$maxAttempts = 30

for ($i = 1; $i -le $maxAttempts; $i++) {
    try {
        $response = Invoke-WebRequest -Uri $healthUrl -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Info "✅ Alkalmazás sikeresen elindult!"
            Write-Info "🔗 API elérhető: http://localhost:3000"
            Write-Info "🔗 Health check: $healthUrl"
            break
        }
    } catch {
        if ($i -eq $maxAttempts) {
            Write-Error "❌ Alkalmazás nem indult el 5 perc alatt!"
            docker-compose logs
            exit 1
        }
        Write-Info "Várakozás az alkalmazás indulására... ($i/$maxAttempts)"
        Start-Sleep -Seconds 10
    }
}

# Logok megjelenítése
Write-Info "Utolsó 20 sor a logokból:"
docker-compose logs --tail=20

Write-Host "============================================" -ForegroundColor Green
Write-Host "  Deployment befejezve!" -ForegroundColor Green
Write-Host "  Logok megtekintése: docker-compose logs -f" -ForegroundColor Green
Write-Host "  Leállítás: docker-compose down" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
