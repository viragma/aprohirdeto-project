# 🖼️ Apróhirdető Lambda - Thumbnail Generator

Python 3.11 AWS Lambda funkció automatikus bélyegkép generáláshoz a Mini Apróhirdető alkalmazásban.

## ⚡ Funkcionalitás

A Lambda funkció automatikusan aktiválódik, amikor egy kép feltöltődik az S3 bucket `uploads/` mappájába:

1. **S3 Esemény Feldolgozás** - Figyeli az S3 PUT eseményeket
2. **Biztonsági Ellenőrzés** - Végtelen ciklus elkerülése (thumbnails/ skip)
3. **Kép Letöltés** - Eredeti kép letöltése S3-ból
4. **Thumbnail Készítés** - 200x200px bélyegkép Pillow-val
5. **S3 Feltöltés** - Thumbnail feltöltése `thumbnails/` mappába
6. **Adatbázis Frissítés** - MySQL `thumbnail_url` mező frissítése

## 📋 Követelmények

### AWS Szolgáltatások
- **AWS Lambda** (Python 3.11 runtime)
- **S3 Bucket** - `beadando-kepek-w4pp9o`
- **RDS MySQL** - `aprohirdeto` adatbázis
- **IAM Role** - megfelelő jogosultságokkal

### Python Csomagok (Lambda Layer)
- **Pillow 10.0.1** - képfeldolgozás
- **PyMySQL 1.1.0** - MySQL kapcsolat
- **boto3** - AWS SDK (általában elérhető)

## 🚀 Deployment

### 1. Gyors Deployment

```bash
# Linux/Mac
chmod +x build-lambda.sh
./build-lambda.sh

# Windows PowerShell
.\build-lambda.ps1
```

### 2. AWS CLI Deployment

```bash
# Lambda funkció létrehozása
aws lambda create-function \
  --function-name aprohirdeto-thumbnail-generator \
  --runtime python3.11 \
  --role arn:aws:iam::ACCOUNT:role/lambda-execution-role \
  --handler lambda_function.lambda_handler \
  --zip-file fileb://lambda-deployment-package.zip \
  --timeout 30 \
  --memory-size 512 \
  --environment Variables='{
    "DB_HOST":"your-rds-endpoint.region.rds.amazonaws.com",
    "DB_USER":"admin",
    "DB_PASSWORD":"your-password",
    "DB_NAME":"aprohirdeto"
  }'

# S3 Trigger beállítása
aws s3api put-bucket-notification-configuration \
  --bucket beadando-kepek-w4pp9o \
  --notification-configuration file://s3-notification.json
```

### 3. CloudFormation Deployment

```bash
aws cloudformation deploy \
  --template-file cloudformation-template.yml \
  --stack-name aprohirdeto-lambda-stack \
  --parameter-overrides \
    DBHost=your-rds-endpoint.region.rds.amazonaws.com \
    DBUser=admin \
    DBPassword=your-password \
  --capabilities CAPABILITY_NAMED_IAM
```

## ⚙️ Konfiguráció

### Környezeti Változók

| Változó | Leírás | Példa |
|---------|--------|-------|
| `DB_HOST` | RDS MySQL endpoint | `aprohirdeto.xxx.eu-central-1.rds.amazonaws.com` |
| `DB_USER` | Adatbázis felhasználó | `admin` |
| `DB_PASSWORD` | Adatbázis jelszó | `your-secure-password` |
| `DB_NAME` | Adatbázis neve | `aprohirdeto` |

### Lambda Beállítások

- **Runtime:** Python 3.11
- **Handler:** `lambda_function.lambda_handler`
- **Timeout:** 30 másodperc
- **Memory:** 512 MB
- **Architecture:** x86_64

### S3 Trigger Beállítások

- **Bucket:** `beadando-kepek-w4pp9o`
- **Event Type:** `s3:ObjectCreated:*`
- **Prefix:** `uploads/`
- **Suffix:** `.jpg, .jpeg, .png, .gif, .bmp, .webp`

## 🔐 IAM Jogosultságok

### Lambda Execution Role

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream", 
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::beadando-kepek-w4pp9o/*"
    }
  ]
}
```

## 🧪 Tesztelés

### Helyi Tesztelés

```bash
# Környezeti változók beállítása
export DB_HOST=localhost
export DB_USER=test_user  
export DB_PASSWORD=test_password
export DB_NAME=aprohirdeto_test

# Tesztek futtatása
python test_lambda.py
```

### AWS Tesztelés

```bash
# Teszt esemény küldése
aws lambda invoke \
  --function-name aprohirdeto-thumbnail-generator \
  --payload file://test-event.json \
  response.json

# Logok megtekintése
aws logs tail /aws/lambda/aprohirdeto-thumbnail-generator --follow
```

### Manuális Teszt

1. Tölts fel egy képet az S3 `uploads/` mappába
2. Ellenőrizd a CloudWatch logjokat
3. Nézd meg, hogy létrejött-e a thumbnail a `thumbnails/` mappában
4. Ellenőrizd az adatbázisban a `thumbnail_url` mezőt

## 📊 Monitoring

### CloudWatch Metrikák

- **Invocations** - Hívások száma
- **Duration** - Futási idő
- **Errors** - Hibák száma
- **Throttles** - Szabályozások

### Custom Metrikák

- Feldolgozott képek száma
- Sikeresen létrehozott thumbnails
- Adatbázis frissítések száma
- Átlagos feldolgozási idő

### Logok

```bash
# Real-time logok
aws logs tail /aws/lambda/aprohirdeto-thumbnail-generator --follow

# Specifikus időintervallum
aws logs filter-log-events \
  --log-group-name /aws/lambda/aprohirdeto-thumbnail-generator \
  --start-time 1635724800000 \
  --end-time 1635728400000
```

## 🔧 Fejlesztés

### Lambda Layer Készítése

```bash
# Könyvtár létrehozása
mkdir python
cd python

# Függőségek telepítése
pip install Pillow==10.0.1 PyMySQL==1.1.0 -t .

# ZIP létrehozása
cd ..
zip -r lambda-layer.zip python/

# Layer feltöltése
aws lambda publish-layer-version \
  --layer-name aprohirdeto-dependencies \
  --zip-file fileb://lambda-layer.zip \
  --compatible-runtimes python3.11
```

### Helyi Fejlesztés

```bash
# Virtual environment
python -m venv lambda-env
source lambda-env/bin/activate  # Linux/Mac
# lambda-env\Scripts\activate   # Windows

# Függőségek telepítése
pip install -r requirements.txt

# Kód szerkesztése
code lambda_function.py

# Tesztelés
python test_lambda.py
```

## 🐛 Hibaelhárítás

### Gyakori Problémák

1. **ImportError: No module named 'PIL'**
   - Lambda Layer nincs beállítva
   - Megoldás: Hozd létre a Python dependencies Layer-t

2. **Database connection timeout**
   - RDS security group nem engedi a Lambda IP-ket
   - VPC beállítások problémája
   - Megoldás: Ellenőrizd a hálózati konfigurációt

3. **S3 Access Denied**
   - IAM Role jogosultságok hiányoznak
   - Megoldás: Ellenőrizd a Lambda execution role-t

4. **Function timeout**
   - Nagy képfájlok feldolgozása lassú
   - Megoldás: Növeld a timeout értéket vagy memóriát

### Debug Logok

```python
import logging
logger = logging.getLogger()
logger.setLevel(logging.DEBUG)

# Részletes logok a kódban
logger.debug(f"Processing image: {object_key}")
logger.info(f"Thumbnail created: {thumbnail_key}")
```

### Performance Optimalizálás

1. **Memory növelése** - 512MB -> 1024MB
2. **Provisioned Concurrency** - cold start csökkentése  
3. **Connection pooling** - adatbázis kapcsolatok optimalizálása
4. **Image preprocessing** - csak szükséges formátumok feldolgozása

## 📁 Fájlstruktúra

```
aprohirdeto-lambda/
├── lambda_function.py              # Fő Lambda kód
├── requirements.txt                # Python függőségek
├── build-lambda.sh                 # Linux/Mac build script
├── build-lambda.ps1                # Windows build script
├── test_lambda.py                  # Tesztelési script
├── lambda-iam-policy.json          # IAM policy template
├── cloudformation-template.yml     # Infrastructure as Code
└── README.md                       # Ez a dokumentáció
```

## 🔄 CI/CD Integration

### GitHub Actions

```yaml
name: Deploy Lambda Function
on:
  push:
    paths: ['aprohirdeto-lambda/**']
    
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy Lambda
        run: |
          cd aprohirdeto-lambda
          ./build-lambda.sh
          aws lambda update-function-code \
            --function-name aprohirdeto-thumbnail-generator \
            --zip-file fileb://lambda-deployment-package.zip
```

## 📞 Támogatás

### Logok Ellenőrzése

```bash
# CloudWatch logok
aws logs describe-log-groups --log-group-name-prefix /aws/lambda/aprohirdeto

# S3 bucket események
aws s3api get-bucket-notification-configuration --bucket beadando-kepek-w4pp9o

# Lambda konfiguráció
aws lambda get-function --function-name aprohirdeto-thumbnail-generator
```

### Hasznos Parancsok

```bash
# Function frissítése
aws lambda update-function-code \
  --function-name aprohirdeto-thumbnail-generator \
  --zip-file fileb://lambda-deployment-package.zip

# Environment változók frissítése  
aws lambda update-function-configuration \
  --function-name aprohirdeto-thumbnail-generator \
  --environment Variables='{
    "DB_HOST":"new-endpoint.region.rds.amazonaws.com"
  }'

# Function törlése (ha szükséges)
aws lambda delete-function --function-name aprohirdeto-thumbnail-generator
```

A Lambda funkció most teljesen készen áll a production használatra! 🚀
