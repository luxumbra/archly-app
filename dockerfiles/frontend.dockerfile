# Use official Node.js image as the base
FROM node:current-alpine3.21

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files first for better caching
COPY frontend/package.json frontend/pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy the entire application code (excluding node_modules)
COPY frontend/src ./src
COPY frontend/public ./public
COPY frontend/tailwind.config.ts ./tailwind.config.ts
COPY frontend/postcss.config.mjs ./postcss.config.mjs
COPY frontend/tsconfig.json ./tsconfig.json
COPY frontend/next.config.ts ./next.config.ts
COPY frontend/next-env.d.ts ./next-env.d.ts
COPY frontend/eslint.config.mjs ./eslint.config.mjs

# Expose port 3000 (Next.js dev server)
EXPOSE 3000

# Create an entrypoint script to handle permissions
RUN echo '#!/bin/sh' > /entrypoint.sh && \
    echo 'mkdir -p .next' >> /entrypoint.sh && \
    echo 'chown -R $(id -u):$(id -g) .next 2>/dev/null || true' >> /entrypoint.sh && \
    echo 'exec "$@"' >> /entrypoint.sh && \
    chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["pnpm", "run", "dev", "--hostname", "0.0.0.0"]
