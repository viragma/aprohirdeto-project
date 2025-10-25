# 1. fázis: A React app "leépítése"
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 2. fázis: A "leépített" statikus fájlok tálalása Nginx-szel
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# A régi, problémás nginx.conf helyett egy újat használunk
# Ami megoldja a React Router (bár most nem használjuk) és a cache problémákat
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]