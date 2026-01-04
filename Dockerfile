# Etape 1 : Construction
FROM node:20-alpine AS build

WORKDIR /app

# 1. On copie le dossier "vite-project" (car Dockerfile est à côté, pas dedans)
COPY vite-project ./vite-project

# 2. On rentre dans le dossier
WORKDIR /app/vite-project

# 3. Installation
RUN npm install

# --- LA CORRECTION MAGIQUE ---
# Au lieu de "npm run build" (qui cherche TypeScript et plante),
# On lance "vite build" directement via npx. Ça marchera avec ton jsconfig.json.
RUN npx vite build
# -----------------------------

# Etape 2 : Nginx
FROM nginx:alpine

# On récupère le dossier dist généré
COPY --from=build /app/vite-project/dist /usr/share/nginx/html

# On remonte d'un niveau pour chercher nginx.conf qui est à la racine (à côté du Dockerfile)
# Note : COPY utilise le contexte de build (ton dossier PC), pas le conteneur précédent.
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]