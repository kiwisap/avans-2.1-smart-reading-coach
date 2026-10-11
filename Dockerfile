# Image of the Smart Reading Coach frontend: Vite builds the static files, nginx serves them.

# Stage 1: build the app. Vite puts the API address into the JavaScript at build time,
# so it has to be passed as a build argument:
#   docker build --build-arg VITE_API_URL=https://<api address>/api .
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Stage 2: serve the files. This nginx image runs as a normal user and listens on port 8080.
FROM nginxinc/nginx-unprivileged:alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://127.0.0.1:8080/ > /dev/null || exit 1
