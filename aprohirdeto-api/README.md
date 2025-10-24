# 🔧 Apróhirdető API - Backend

Node.js Express API server teljes CRUD funkcionalitással a Mini Apróhirdető alkalmazáshoz.

## 📋 Követelmények

- **Node.js** 18 vagy újabb
- **Docker** és **Docker Compose** (ajánlott)
- **MySQL** adatbázis (RDS vagy helyi)
- **AWS S3** bucket hozzáférés (IAM Role)

## 🚀 Gyors Indítás

### Docker-rel (Ajánlott)

1. **Repository klónozása:**
   ```bash
   git clone <repository-url>
   cd aprohirdeto-api
   ```

2. **Környezeti változók beállítása:**
   ```bash
   cp .env.example .env
   # Szerkeszd a .env fájlt a megfelelő értékekkel
   ```

3. **Deployment futtatása:**
   ```bash
   # Linux/Mac
   chmod +x deploy.sh
   ./deploy.sh

   # Windows PowerShell
   .\deploy.ps1
   ```

### Manuális telepítés

1. **Függőségek telepítése:**
   ```bash
   npm install
   ```

2. **Alkalmazás indítása:**
   ```bash
   # Fejlesztési mód
   npm run dev

   # Produkciós mód
   npm start
   ```

## 📡 API Végpontok

| Metódus | Útvonal | Leírás |
|---------|---------|--------|
| GET | `/api/health` | Health check |
| GET | `/api/ads` | Összes hirdetés listázása |
| GET | `/api/ads/:id` | Egy hirdetés részletes adatai |
| POST | `/api/ads` | Új hirdetés létrehozása |
| PUT | `/api/ads/:id` | Hirdetés frissítése |
| DELETE | `/api/ads/:id` | Hirdetés törlése |

## ⚙️ Környezeti Változók

```bash
# Adatbázis
DB_HOST=your-rds-endpoint.region.rds.amazonaws.com
DB_USER=admin
DB_PASSWORD=your-secure-password
DB_NAME=aprohirdeto

# AWS
AWS_REGION=eu-central-1

# Szerver
PORT=3000
NODE_ENV=production
```

## 🐳 Docker Parancsok

```bash
# Build és indítás
docker-compose up -d

# Logok megtekintése
docker-compose logs -f

# Leállítás
docker-compose down

# Újraindítás
docker-compose restart

# Teljes újraépítés
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 📊 Monitoring

- **Health Check:** `GET /api/health`
- **Docker Health Check:** Automatikus, 30 másodpercenként
- **Logok:** `./logs/` mappában vagy `docker-compose logs`

## 🔧 Fejlesztés

```bash
# Fejlesztői mód (nodemon)
npm run dev

# Tesztelés
npm test

# Linting
npm run lint
```

## 📁 Fájlstruktúra

```
aprohirdeto-api/
├── server.js              # Fő alkalmazás
├── package.json           # Függőségek
├── Dockerfile            # Docker konfiguráció
├── docker-compose.yml    # Docker Compose setup
├── deploy.sh             # Linux/Mac deployment
├── deploy.ps1            # Windows deployment
├── .env.example          # Környezeti változók sablon
├── .gitignore           # Git kizárások
└── logs/                # Alkalmazás logok
```

## ⚠️ Fontos megjegyzések

1. **Adatbázis:** Az alkalmazás feltételezi, hogy a MySQL `advertisements` tábla már létezik
2. **S3 hozzáférés:** IAM Role-on keresztül, nem szükséges AWS kulcsokat megadni
3. **Portok:** Az alkalmazás a 3000-es porton fut alapértelmezésben
4. **Health check:** Az alkalmazás indulás után 30 másodpercen belül válaszol

## 🐛 Hibaelhárítás

### Gyakori problémák:

1. **Adatbázis kapcsolódási hiba:**
   - Ellenőrizd a DB_HOST, DB_USER, DB_PASSWORD változókat
   - Győződj meg róla, hogy az RDS elérhető

2. **S3 hozzáférési hiba:**
   - Ellenőrizd az EC2 instance IAM Role jogosultságait
   - Győződj meg róla, hogy a bucket neve helyes

3. **Port foglalt:**
   - Változtasd meg a PORT környezeti változót
   - Vagy állítsd le a 3000-es portot használó alkalmazásokat

### Docker problémák:

```bash
# Konténerek listázása
docker ps -a

# Logok részletes megtekintése
docker-compose logs aprohirdeto-api

# Konténerbe belépés
docker-compose exec aprohirdeto-api sh

# Hálózat ellenőrzése
docker network ls
```

## 📞 Támogatás

Ha problémába ütközöl, ellenőrizd:
1. A környezeti változók beállítását
2. A Docker és Docker Compose verzióját
3. Az alkalmazás logjait
4. Az adatbázis és S3 elérhetőségét
