# 📋 Git Repository Setup és Deployment Útmutató

Ez a dokumentum részletesen leírja, hogyan kell felrakni a Git repository-ba a Mini Apróhirdető alkalmazást és hogyan kell telepíteni külön szerverekre.

## 🗂️ Repository Struktúra

A projekt két független komponenst tartalmaz, amelyek külön szervereken futhatnak:

```
aprohirdeto-project/
├── README.md                    # Főbb projekt dokumentáció
├── aprohirdeto-api/             # Backend API komponens
└── aprohirdeto-ui/              # Frontend UI komponens
```

## 📤 Git Repository Feltöltés

### 1. Git Repository Létrehozása

```bash
# Lokális Git repository inicializálása
cd C:\Temp\felho_proj
git init

# Gitignore létrehozása (ha még nincs)
echo "node_modules/" > .gitignore
echo ".env" >> .gitignore
echo "*.log" >> .gitignore

# Első commit
git add .
git commit -m "Initial commit: Mini Apróhirdető alkalmazás teljes CRUD funkcionalitással"

# Remote repository hozzáadása (GitHub, GitLab, stb.)
git remote add origin https://github.com/USERNAME/aprohirdeto-project.git

# Push master branch-re
git branch -M main
git push -u origin main
```

### 2. Branch Stratégia (Opcionális)

```bash
# Development branch
git checkout -b development
git push -u origin development

# Feature branch példa
git checkout -b feature/ui-improvements
git push -u origin feature/ui-improvements
```

## 🚀 Deployment Forgatókönyvek

### Forgatókönyv 1: Külön Szerverek (Ajánlott)

#### Backend API Szerver

```bash
# Szerver 1: Backend API
ssh user@api-server.com
git clone https://github.com/USERNAME/aprohirdeto-project.git
cd aprohirdeto-project/aprohirdeto-api

# Környezeti változók beállítása
cp .env.example .env
nano .env  # Szerkeszd a MySQL és AWS beállításokat

# Docker deployment
./deploy.sh
# vagy
docker-compose up -d

# Ellenőrzés
curl http://localhost:3000/api/health
```

#### Frontend UI Szerver

```bash
# Szerver 2: Frontend UI
ssh user@ui-server.com
git clone https://github.com/USERNAME/aprohirdeto-project.git
cd aprohirdeto-project/aprohirdeto-ui

# API URL frissítése
nano app.js
# Cseréld le a '/api/' relatív URL-eket az API szerver abszolút címére
# Például: 'http://api-server.com:3000/api/'

# Docker deployment
./deploy.sh
# vagy
docker-compose up -d

# Ellenőrzés
curl http://localhost/
```

### Forgatókönyv 2: Ugyanaz a Szerver

```bash
# Egy szerveren mindkét komponens
git clone https://github.com/USERNAME/aprohirdeto-project.git
cd aprohirdeto-project

# Backend indítása
cd aprohirdeto-api
cp .env.example .env
# Szerkeszd a .env fájlt
./deploy.sh

# Frontend indítása (másik porton)
cd ../aprohirdeto-ui
# Szerkeszd a docker-compose.yml-t más portra (pl. 8080:80)
./deploy.sh
```

## ⚙️ Konfigurációs Változások Külön Szerverekhez

### Backend API Módosítások

**CORS beállítás frissítése** (`server.js`):

```javascript
// CORS middleware frissítése
const corsOptions = {
    origin: [
        'http://localhost',
        'http://ui-server.com',
        'https://your-domain.com'
    ],
    credentials: true
};
app.use(cors(corsOptions));
```

### Frontend UI Módosítások

**API URL frissítése** (`app.js`):

```javascript
// API base URL konfigurálása
const API_BASE_URL = 'http://api-server.com:3000';

// Fetch hívások frissítése
const response = await fetch(`${API_BASE_URL}/api/ads`);
const response = await fetch(`${API_BASE_URL}/api/ads/${adId}`);
// stb.
```

**Nginx proxy konfiguráció** (`nginx.conf`):

```nginx
# API proxy frissítése
location /api/ {
    proxy_pass http://api-server.com:3000;
    # További proxy beállítások...
}
```

## 🔄 CI/CD Pipeline (Opcionális)

### GitHub Actions példa

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy-api:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Deploy API
      run: |
        ssh ${{ secrets.API_SERVER_USER }}@${{ secrets.API_SERVER_HOST }} "
          cd aprohirdeto-project &&
          git pull origin main &&
          cd aprohirdeto-api &&
          ./deploy.sh
        "

  deploy-ui:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Deploy UI
      run: |
        ssh ${{ secrets.UI_SERVER_USER }}@${{ secrets.UI_SERVER_HOST }} "
          cd aprohirdeto-project &&
          git pull origin main &&
          cd aprohirdeto-ui &&
          ./deploy.sh
        "
```

## 📊 Monitoring és Logolás

### Health Check Végpontok

```bash
# API health check
curl http://api-server.com:3000/api/health

# UI health check
curl http://ui-server.com/

# Docker status check
docker ps
docker-compose logs -f
```

### Log Fájlok

- **API logok:** `aprohirdeto-api/logs/` vagy `docker-compose logs`
- **Nginx logok:** `/var/log/nginx/` vagy Docker container-ben
- **System logok:** `journalctl -u docker`

## 🔧 Maintenance Parancsok

### Frissítés

```bash
# Git pull és újraindítás
git pull origin main
cd aprohirdeto-api && ./deploy.sh
cd ../aprohirdeto-ui && ./deploy.sh
```

### Backup

```bash
# Docker image mentése
docker save aprohirdeto-api:latest > api-backup.tar
docker save aprohirdeto-ui:latest > ui-backup.tar

# Konfigurációs fájlok mentése
tar -czf config-backup.tar.gz .env nginx.conf
```

### Troubleshooting

```bash
# Konténerek állapota
docker ps -a

# Logok megtekintése
docker-compose logs --tail=50

# Erőforrás használat
docker stats

# Hálózat ellenőrzése
docker network ls
docker network inspect bridge
```

## 📋 Checklist Deployment Előtt

### Backend API Server
- [ ] MySQL RDS kapcsolat működik
- [ ] AWS S3 bucket elérhető
- [ ] IAM Role beállítva
- [ ] Environment változók kitöltve
- [ ] CORS beállítások frissítve
- [ ] Health check működik

### Frontend UI Server
- [ ] API URL-ek frissítve
- [ ] Nginx konfiguráció ellenőrizve
- [ ] Static fájlok helyén vannak
- [ ] Responsive design tesztelve
- [ ] Browser compatibility ellenőrizve

### Hálózat és Biztonság
- [ ] Tűzfal szabályok beállítva
- [ ] HTTPS tanúsítványok (opcionális)
- [ ] Load balancer konfiguráció
- [ ] Backup stratégia implementálva
- [ ] Monitoring beállítva

## 🆘 Támogatás

Ha problémákba ütközöl:

1. Ellenőrizd a logokat: `docker-compose logs`
2. Teszteld a hálózati kapcsolatot: `curl` vagy `ping`
3. Ellenőrizd a konfigurációs fájlokat
4. Próbáld meg lépésről lépésre követni ezt az útmutatót

## 📞 Kapcsolat

Technikai kérdések esetén ellenőrizd:
- API dokumentációt: `aprohirdeto-api/README.md`
- UI dokumentációt: `aprohirdeto-ui/README.md`
- Főbb README fájlt: `README.md`
