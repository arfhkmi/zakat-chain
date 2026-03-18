
# Stage 1 — Build

FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

# Copy all files first
COPY . .

# Auto copy .env.example to .env if .env doesn't exist
RUN if [ ! -f .env ] && [ -f .env.example ]; then cp .env.example .env; fi

RUN npm run build-only


# Stage 2 — Serve with nginx

FROM nginx:alpine AS production

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]