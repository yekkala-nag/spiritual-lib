# Stage 1: Build application
FROM node:20-alpine AS builder

WORKDIR /build

# Install dependencies
COPY app/package.json app/package-lock.json ./
RUN npm ci

# Copy source code and assets
COPY app/ ./

# Run linting and production build
RUN npm run lint && npm run build

# Stage 2: Serve with Nginx Alpine
FROM nginx:alpine

COPY --from=builder /build/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
