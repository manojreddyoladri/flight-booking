# Multi-stage build for Angular application
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
# The --omit=dev flag is intentionally left out to install Angular CLI
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built application from build stage
COPY --from=build /app/dist/frontend1/browser /usr/share/nginx/html

# Copy nginx configuration template
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Set a default backend URL for local testing
ENV ENV_BACKEND_URL="http://localhost:8080"

# Robust startup command with debug output
# 1. Print the substituted config to the log
# 2. Generate the final config file
# 3. Start Nginx in the foreground
CMD /bin/sh -c 'echo "--- Generating Nginx Config ---" && cat /etc/nginx/templates/default.conf.template | envsubst && echo "--- Starting Nginx ---" && envsubst < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g "daemon off;"'

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80 || exit 1 