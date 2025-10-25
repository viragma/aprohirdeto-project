# Multi-stage build for optimized production image
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies for build tools (ha szükséges)
RUN npm install --only=dev

# Copy source files
COPY . .

# Run any build processes (jelenleg nincs, de később bővíthető)
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy static files
COPY --from=builder /app/*.html /usr/share/nginx/html/
COPY --from=builder /app/*.css /usr/share/nginx/html/
COPY --from=builder /app/*.js /usr/share/nginx/html/

# Copy any additional assets (if exists)
RUN mkdir -p /usr/share/nginx/html/assets /usr/share/nginx/html/images

# Create custom error pages
RUN echo '<!DOCTYPE html><html><head><title>404 - Oldal nem található</title></head><body><h1>404 - Az oldal nem található</h1><p><a href="/">Vissza a főoldalra</a></p></body></html>' > /usr/share/nginx/html/404.html

RUN echo '<!DOCTYPE html><html><head><title>500 - Szerver hiba</title></head><body><h1>500 - Szerver hiba</h1><p>Kérjük, próbálja meg később!</p></body></html>' > /usr/share/nginx/html/50x.html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
