# Mini Apróhirdető UI Deployment Script (Windows PowerShell)
# Használat: .\deploy.ps1 [környezet]

param(
    [string]$Environment = "production"
)

$ProjectName = "aprohirdeto-ui"
$ImageName = "$ProjectName:latest"

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Mini Apróhirdető UI Deployment" -ForegroundColor Cyan
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

# Fájlok ellenőrzése
$requiredFiles = @("index.html", "styles.css", "app.js")
foreach ($file in $requiredFiles) {
    if (!(Test-Path $file)) {
        Write-Error "Hiányzó fájl: $file"
        exit 1
    }
}

Write-Info "Összes szükséges fájl megtalálható ✓"

# Docker image építése
Write-Info "Docker image építése..."
docker build -t $ImageName .

if ($LASTEXITCODE -ne 0) {
    Write-Error "Docker build sikertelen!"
    exit 1
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
Start-Sleep -Seconds 5

$healthUrl = "http://localhost/"
$maxAttempts = 20

for ($i = 1; $i -le $maxAttempts; $i++) {
    try {
        $response = Invoke-WebRequest -Uri $healthUrl -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Info "✅ Alkalmazás sikeresen elindult!"
            Write-Info "🔗 UI elérhető: http://localhost"
            Write-Info "🔗 Health check: $healthUrl"
            break
        }
    } catch {
        if ($i -eq $maxAttempts) {
            Write-Error "❌ Alkalmazás nem indult el 2 perc alatt!"
            docker-compose logs
            exit 1
        }
        Write-Info "Várakozás az alkalmazás indulására... ($i/$maxAttempts)"
        Start-Sleep -Seconds 6
    }
}

# Logok megjelenítése
Write-Info "Utolsó 10 sor a logokból:"
docker-compose logs --tail=10

Write-Host "============================================" -ForegroundColor Green
Write-Host "  UI Deployment befejezve!" -ForegroundColor Green
Write-Host "  Alkalmazás: http://localhost" -ForegroundColor Green
Write-Host "  Logok: docker-compose logs -f" -ForegroundColor Green
Write-Host "  Leállítás: docker-compose down" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
