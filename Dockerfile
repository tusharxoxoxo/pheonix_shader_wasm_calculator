# Build Frontend
FROM oven/bun:1 AS frontend-builder

WORKDIR /final/frontend

# Copy frontend files and build
COPY frontend/package.json frontend/bun.lockb ./
RUN bun install
COPY frontend/ ./

# Build the frontend with the correct configuration
ENV VITE_API_URL=/api
RUN bun run build

# Build Backend
FROM elixir:1.15-alpine AS backend-builder

WORKDIR /final/backend

RUN apk add --update git build-base
RUN mix local.hex --force && mix local.rebar --force

COPY backend/mix.exs backend/mix.lock ./
COPY backend/config ./config
RUN mix deps.get --only prod
RUN mix deps.compile

COPY backend/ ./
RUN MIX_ENV=prod mix compile
RUN MIX_ENV=prod mix release

# Final stage
FROM alpine:3.18

RUN apk add --no-cache openssl ncurses-libs libstdc++ nginx

# Set up working directory
WORKDIR /final

# Copy backend release
COPY --from=backend-builder /final/backend/_build/prod/rel/shader_api ./backend

# Copy frontend build to nginx directory
COPY --from=frontend-builder /final/frontend/dist /usr/share/nginx/html/

# Copy nginx configuration
COPY nginx.conf /etc/nginx/http.d/default.conf

# Create start script with proper line endings
RUN printf '#!/bin/sh\n\necho "Starting services..."\n\n# Start Nginx in background\nnginx\necho "Nginx started"\n\n# Start Phoenix app\ncd /final/backend\necho "Starting Phoenix application..."\nexec ./bin/shader_api start\n' > /final/start.sh && \
    chmod +x /final/start.sh

# Expose the port that will be used by the web service
EXPOSE 80

CMD ["/final/start.sh"]
