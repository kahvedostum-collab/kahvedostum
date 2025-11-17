# 1. Aşama: React uygulamasını build et
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# 2. Aşama: Nginx ile statik dosyaları servis et
FROM nginx:1.27-alpine

# Kendi nginx config'imizi koyalım
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Vite build çıktılarını Nginx'in root'una kopyala
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
