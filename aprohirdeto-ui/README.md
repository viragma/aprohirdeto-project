# 🎨 Apróhirdető UI - Frontend

Modern, reszponzív webalkalmazás a Mini Apróhirdető rendszerhez. Tiszta HTML, CSS és JavaScript technológiákkal készült.

## 📋 Követelmények

- **Docker** és **Docker Compose** (ajánlott)
- **Node.js** 14+ (fejlesztéshez)
- **Modern webböngésző** (Chrome, Firefox, Safari, Edge)

## 🚀 Gyors Indítás

### Docker-rel (Ajánlott)

1. **Repository klónozása:**
   ```bash
   git clone <repository-url>
   cd aprohirdeto-ui
   ```

2. **Deployment futtatása:**
   ```bash
   # Linux/Mac
   chmod +x deploy.sh
   ./deploy.sh

   # Windows PowerShell
   .\deploy.ps1
   ```

3. **Alkalmazás elérése:**
   - URL: http://localhost
   - Port: 80 (HTTP)

### Fejlesztői mód

1. **Függőségek telepítése:**
   ```bash
   npm install
   ```

2. **Fejlesztői szerver indítása:**
   ```bash
   npm run dev
   # vagy
   npm start
   ```

3. **Alkalmazás elérése:**
   - URL: http://localhost:8080
   - Auto-reload engedélyezve

## 📁 Fájlstruktúra

```
aprohirdeto-ui/
├── index.html           # Fő HTML struktúra
├── styles.css           # CSS stíluslapok
├── app.js              # JavaScript logika
├── package.json        # NPM konfiguráció
├── Dockerfile          # Docker konfiguráció
├── docker-compose.yml  # Docker Compose setup
├── nginx.conf          # Nginx webszerver konfig
├── deploy.sh           # Linux/Mac deployment
├── deploy.ps1          # Windows deployment
├── README.md           # Ez a fájl
└── .gitignore         # Git kizárások
```

## 🎯 Funkciók

### ✨ CRUD Műveletek
- **CREATE:** Új hirdetés feladása űrlappal
- **READ:** Hirdetések megjelenítése galéria nézetben
- **UPDATE:** Hirdetés szerkesztése modal ablakban
- **DELETE:** Hirdetés törlése megerősítéssel

### 🎨 UI/UX Jellemzők
- **Reszponzív design** - tablet és mobil optimalizált
- **Modern CSS Grid/Flexbox** layout
- **Interaktív animációk** és hover effektek
- **Modal ablakok** szerkesztéshez
- **Toast üzenetek** visszajelzésekhez
- **Képfeltöltés** drag & drop támogatással
- **Keyboard shortcuts** (ESC modal bezáráshoz)

### 🔧 Technikai Jellemzők
- **Vanilla JavaScript** - keretrendszer nélkül
- **Fetch API** - modern AJAX kérések
- **CSS Custom Properties** - dinamikus témázás
- **Progressive Enhancement** - fokozatos javítás
- **Accessibility** - akadálymentesítés támogatás

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

## 🔧 Fejlesztési Parancsok

```bash
# Fejlesztői szerver
npm run dev

# Produkciós szerver
npm start

# Kód ellenőrzés
npm run lint

# HTML validáció
npm run lint:html

# CSS validáció
npm run lint:css
```

## 🌐 API Integráció

Az alkalmazás a következő API végpontokat használja:

| Funkció | Módszer | Végpont | Leírás |
|---------|---------|---------|--------|
| Listázás | GET | `/api/ads` | Hirdetések betöltése |
| Részletek | GET | `/api/ads/:id` | Egy hirdetés adatai |
| Létrehozás | POST | `/api/ads` | Új hirdetés |
| Frissítés | PUT | `/api/ads/:id` | Szerkesztés |
| Törlés | DELETE | `/api/ads/:id` | Hirdetés törlése |

## ⚙️ Konfigurálás

### API Endpoint Módosítása

Ha az API más címen fut, módosítsd az `app.js` fájlban:

```javascript
// Fejlesztési környezet
const API_BASE_URL = 'http://localhost:3000';

// Produkciós környezet
const API_BASE_URL = '/api'; // Relatív URL nginx proxy-val
```

### Nginx Konfiguráció

A `nginx.conf` fájlban állíthatod be:
- **API proxy** beállításokat
- **Cache** szabályokat
- **Security** headereket
- **Gzip** tömörítést

## 📱 Reszponzív Töréspontok

```css
/* Tablet */
@media (max-width: 768px) { ... }

/* Mobil */
@media (max-width: 480px) { ... }
```

## 🔒 Biztonsági Funkciók

- **XSS védelem** - HTML escape
- **CSRF védelem** - SameSite cookies
- **Content Security Policy** - CSP headers
- **Input validáció** - client és server oldalon
- **File upload korlátozás** - típus és méret ellenőrzés

## 🐛 Hibaelhárítás

### Gyakori problémák:

1. **API nem elérhető:**
   - Ellenőrizd, hogy az API szerver fut-e
   - Nézd meg a browser Developer Tools Network fülét
   - Ellenőrizd a CORS beállításokat

2. **Képek nem töltődnek be:**
   - Ellenőrizd az S3 bucket jogosultságokat
   - Nézd meg a képek URL-jét a hálózati kérésekben

3. **Stílus problémák:**
   - Ellenőrizd, hogy a `styles.css` betöltődik-e
   - Browser cache-t ürítsd (Ctrl+F5)

### Docker problémák:

```bash
# Konténer állapota
docker ps

# Nginx logok
docker-compose logs aprohirdeto-ui

# Konténerbe belépés
docker-compose exec aprohirdeto-ui sh

# Port ellenőrzése
netstat -tulpn | grep :80
```

## 📊 Teljesítmény Optimalizálás

- **Gzip tömörítés** - 70% méretcsökkentés
- **Browser cache** - statikus fájlok gyorsítótárazása
- **Image optimization** - responsive képek
- **Lazy loading** - képek igény szerinti betöltése
- **Minification** - CSS/JS tömörítés (opcionális)

## 📞 Támogatás

Ha problémába ütközöl:

1. Ellenőrizd a browser konzolt (F12)
2. Nézd meg a hálózati kéréseket
3. Ellenőrizd az API szerver állapotát
4. Tesztelj különböző böngészőkben

## 🚀 Deployment Opciók

### 1. Docker (Ajánlott)
- **Nginx** webszerver
- **Multi-stage build**
- **Health check** támogatás

### 2. Statikus hosting
- **Netlify, Vercel** - egyszerű deployment
- **AWS S3 + CloudFront** - enterprise szintű
- **GitHub Pages** - ingyenes hosting

### 3. CDN integráció
- **CloudFlare** - gyorsítás és védelem
- **AWS CloudFront** - globális elérés
