# 🏪 Mini Apróhirdető - README

Egy egyszerű apróhirdetési webal### Fájlok
- `index.html` - Fő HTML struktúra (tiszta markup)
Egy egyszerű apróhirdetési webalkalmazás, amely lehetővé teszi a felhasználók számára hirdetések feladását és megtekintését.

## 📁 Projekt Struktúra

```
felho_proj/
├── README.md                    # Projekt dokumentáció
├── DEPLOYMENT.md                # Részletes deployment útmutató
├── aprohirdeto-api/             # 🔧 Backend API Server
│   ├── server.js               # Express API logika
│   ├── package.json            # Node.js függőségek
│   ├── Dockerfile              # API Docker konfig
│   ├── docker-compose.yml      # Docker Compose setup
│   ├── deploy.sh               # Linux/Mac deployment
│   ├── deploy.ps1              # Windows deployment
│   ├── .env.example            # Környezeti változók
│   ├── .gitignore              # Git kizárások
│   └── README.md               # API dokumentáció
├── aprohirdeto-ui/              # 🎨 Frontend Web UI
│   ├── index.html              # HTML struktúra
│   ├── styles.css              # CSS stíluslapok
│   ├── app.js                  # JavaScript logika
│   ├── package.json            # NPM konfiguráció
│   ├── Dockerfile              # UI Docker konfig
│   ├── docker-compose.yml      # Docker Compose setup
│   ├── nginx.conf              # Nginx webszerver konfig
│   ├── deploy.sh               # Linux/Mac deployment
│   ├── deploy.ps1              # Windows deployment
│   ├── .gitignore              # Git kizárások
│   └── README.md               # UI dokumentáció
└── aprohirdeto-lambda/          # ⚡ Serverless Thumbnail Generator
    ├── lambda_function.py       # Python Lambda kód
    ├── requirements.txt         # Python függőségek
    ├── build-lambda.sh          # Linux/Mac build script
    ├── build-lambda.ps1         # Windows build script
    ├── test_lambda.py           # Tesztelési script
    ├── lambda-iam-policy.json   # IAM policy template
    ├── cloudformation-template.yml # Infrastructure as Code
    ├── .gitignore              # Git kizárások
    └── README.md               # Lambda dokumentáció
```

## 🚀 Backend API (aprohirdeto-api)

### Technológiák
- **Node.js 18** - JavaScript runtime
- **Express.js** - Web framework
- **MySQL2** - Adatbázis driver
- **AWS SDK** - S3 integráció
- **Multer + Multer-S3** - Képfeltöltés

### API Végpontok (CRUD)
- `GET /api/health` - Health check
- `GET /api/ads` - Összes hirdetés lekérdezése (lista nézethez)
- `GET /api/ads/:id` - Egy hirdetés részletes lekérdezése
- `POST /api/ads` - Új hirdetés feladása
- `PUT /api/ads/:id` - Hirdetés frissítése
- `DELETE /api/ads/:id` - Hirdetés törlése (képekkel együtt)

### Indítás
```bash
cd aprohirdeto-api
npm install
npm start
```

### Docker
```bash
cd aprohirdeto-api
docker build -t aprohirdeto-api .
docker run -p 3000:3000 aprohirdeto-api
```

### Környezeti Változók
- `DB_HOST` - MySQL szerver címe
- `DB_USER` - Adatbázis felhasználónév
- `DB_PASSWORD` - Adatbázis jelszó
- `DB_NAME` - Adatbázis neve (alapértelmezett: aprohirdeto)
- `AWS_REGION` - AWS régió (alapértelmezett: eu-central-1)
- `PORT` - API port (alapértelmezett: 3000)

## 🎨 Frontend UI (aprohirdeto-ui)

### Funkcionalitás
- **Hirdetés feladása**: Űrlap kitöltésével és kép feltöltésével
- **Hirdetések megtekintése**: Galérianézetben összes hirdetés
- **Reszponzív design**: Mobilbarát felület
- **Hibakövetés**: Felhasználóbarát hibaüzenetek

### Fájlok
- `index.html` - Fő HTML struktúra és CSS stílusok
- `app.js` - JavaScript logika és API komunikáció

## 🏗️ AWS Infrastruktúra

### RDS MySQL Adatbázis
```sql
CREATE TABLE advertisements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    seller_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    ad_title VARCHAR(255) NOT NULL,
    ad_text TEXT,
    price VARCHAR(100),
    image_url VARCHAR(1024),
    thumbnail_url VARCHAR(1024),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### S3 Bucket
- **Bucket neve**: beadando-kepek-w4pp9o
- **Mappa struktúra**:
  - `uploads/` - Eredeti képek
  - `thumbnails/` - Bélyegképek (Lambda által generált)

### Load Balancer Routing
- `/*` → Frontend (UI)
- `/api/*` → Backend (API)

## 📋 Funkciók

### Backend Funkciók
- ✅ MySQL adatbázis kapcsolat
- ✅ S3 képfeltöltés és törlés
- ✅ Teljes CRUD RESTful API
- ✅ Hibakezelés és validáció
- ✅ CORS támogatás
- ✅ Fájltípus és méret ellenőrzés
- ✅ Automatikus S3 cleanup törléskor
- ✅ Részletes logging

### Frontend Funkciók
- ✅ Reszponzív design
- ✅ Űrlap validáció
- ✅ Képfeltöltés
- ✅ Galérianézet
- ✅ **Hirdetés szerkesztése** (modal ablak)
- ✅ **Hirdetés törlése** (megerősítéssel)
- ✅ Hibakövetés
- ✅ Sikeres művelet visszajelzés
- ✅ Keyboard shortcuts (ESC modal bezáráshoz)
- ✅ Click-outside modal bezáráshoz

## 🔧 Fejlesztési Jegyzetek

### API Fejlesztés
- A szerver a 3000-es porton fut
- Az S3 hozzáférés IAM Role-on keresztül történik
- MySQL connection pool használata a stabilitásért
- Részletes hibakezelés és logging

### UI Fejlesztés
- Tiszta HTML/CSS/JavaScript (keretrendszer nélkül)
- Modern CSS Grid és Flexbox layout
- Fetch API használata AJAX kérésekhez
- Felhasználóbarát üzenetek és visszajelzések

## 🚀 Deployment - Külön Szerverek

Az alkalmazás két külön szerverkomponensből áll, amelyek egymástól függetlenül telepíthetők:

### 🔧 Backend API Szerver

1. **Repository klónozása:**
   ```bash
   git clone <repository-url>
   cd aprohirdeto-api
   ```

2. **Környezeti változók beállítása:**
   ```bash
   cp .env.example .env
   # Szerkeszd a .env fájlt a MySQL és AWS beállításokkal
   ```

3. **Deployment:**
   ```bash
   # Linux/Mac
   chmod +x deploy.sh
   ./deploy.sh

   # Windows PowerShell
   .\deploy.ps1
   ```

   **vagy Docker Compose-zal:**
   ```bash
   docker-compose up -d
   ```

4. **API elérhető:** `http://your-api-server:3000`

### 🎨 Frontend UI Szerver

1. **Repository klónozása:**
   ```bash
   git clone <repository-url>
   cd aprohirdeto-ui
   ```

2. **API URL konfigurálása:**
   - Szerkeszd az `app.js` fájlt
   - Állítsd be az API szerver címét a `fetch()` hívásokban

3. **Deployment:**
   ```bash
   # Linux/Mac
   chmod +x deploy.sh
   ./deploy.sh

   # Windows PowerShell
   .\deploy.ps1
   ```

   **vagy Docker Compose-zal:**
   ```bash
   docker-compose up -d
   ```

4. **UI elérhető:** `http://your-ui-server`

### 🌐 Hálózati Konfiguráció

Ha külön szervereken futnak:

1. **CORS beállítás** - API szerveren engedélyezd a UI szerver domainját
2. **API URL frissítése** - UI-ban cseréld le a relatív URL-eket abszolútra
3. **Load Balancer** - Opcionálisan használhatsz közös bejárati pontot

### ⚡ Lambda Thumbnail Generator

1. **Repository klónozása:**
   ```bash
   git clone <repository-url>
   cd aprohirdeto-lambda
   ```

2. **Lambda deployment package készítése:**
   ```bash
   # Linux/Mac
   chmod +x build-lambda.sh
   ./build-lambda.sh

   # Windows PowerShell
   .\build-lambda.ps1
   ```

3. **AWS Lambda deployment:**
   ```bash
   aws lambda create-function \
     --function-name aprohirdeto-thumbnail-generator \
     --runtime python3.11 \
     --role arn:aws:iam::ACCOUNT:role/lambda-execution-role \
     --handler lambda_function.lambda_handler \
     --zip-file fileb://lambda-deployment-package.zip \
     --timeout 30 \
     --memory-size 512
   ```

4. **S3 Trigger beállítása:** Bucket events -> uploads/ prefix

### ☁️ AWS Infrastruktúra

**Komponensek:**
- **RDS MySQL** - `aprohirdeto` adatbázis
- **S3 Bucket** - `beadando-kepek-w4pp9o`
- **Lambda Function** - automatikus thumbnail generálás
- **IAM Roles** - megfelelő jogosultságokkal

## 📞 Támogatás

Ez egy oktatási célú projekt, amely a AWS cloud szolgáltatások és full-stack fejlesztés demonstrálására készült.
