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

# Robust startup command with debug output
# Only substitute ENV_BACKEND_URL, leaving nginx variables intact
CMD /bin/sh -c 'echo "--- Generating Nginx Config ---" && \
    cat /etc/nginx/templates/default.conf.template | envsubst "$${ENV_BACKEND_URL}" && \
    echo "--- Starting Nginx ---" && \
    envsubst "$${ENV_BACKEND_URL}" < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && \
    nginx -g "daemon off;"'

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1 