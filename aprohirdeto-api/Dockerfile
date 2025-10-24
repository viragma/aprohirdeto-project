# Node.js 18-alpine alapkép használata
FROM node:18-alpine

# Munkakönyvtár beállítása
WORKDIR /app

# Package.json és package-lock.json másolása
COPY package*.json ./

# Függőségek telepítése
RUN npm install --only=production

# Alkalmazáskód másolása
COPY . .

# Port kitetése
EXPOSE 3000

# Alkalmazás indítása
CMD ["npm", "start"]
