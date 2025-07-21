# Stage 1: Build Angular app
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=build /app/dist/frontend1/browser /usr/share/nginx/html

# Copy nginx configuration template
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Set a default backend URL for local testing
ENV ENV_BACKEND_URL="http://localhost:8080"

# Create a script to handle the configuration and startup
RUN echo '#!/bin/sh\n\
    echo "--- Generating Nginx Config ---"\n\
    export backend_url="$ENV_BACKEND_URL"\n\
    envsubst \'$backend_url\' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf\n\
    echo "--- Generated Nginx Config ---"\n\
    cat /etc/nginx/conf.d/default.conf\n\
    echo "--- Starting Nginx ---"\n\
    nginx -g "daemon off;"\n\
    ' > /docker-entrypoint.sh && chmod +x /docker-entrypoint.sh

# Use the script as the entrypoint
CMD ["/docker-entrypoint.sh"]

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1 