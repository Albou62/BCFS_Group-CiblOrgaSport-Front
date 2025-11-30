FROM node:20-alpine AS build

WORKDIR /app
COPY vite-project/package*.json ./
RUN npm install

COPY vite-project ./
RUN npm run build

FROM nginx:alpine

# Copier les fichiers buildés
COPY --from=build /app/dist /usr/share/nginx/html

# Copier la configuration Nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]