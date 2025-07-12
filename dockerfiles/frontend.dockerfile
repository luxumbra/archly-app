# Use official Node.js image as the base
FROM node:current-alpine3.21

# Accept build arguments for user/group IDs
ARG UID=1000
ARG GID=1000

# Create a non-root user with the specified UID/GID
RUN addgroup -g $GID -S nodejs
RUN adduser -S nextjs -u $UID -G nodejs

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files first for better caching
COPY frontend/package*.json ./

# Install dependencies
RUN pnpm install

# Copy the entire application code (excluding node_modules)
COPY frontend/src ./src
COPY frontend/public ./public
COPY frontend/tailwind.config.ts ./tailwind.config.ts
COPY frontend/postcss.config.js ./postcss.config.js
COPY frontend/tsconfig.json ./tsconfig.json
COPY frontend/next.config.ts ./next.config.ts
COPY frontend/next-env.d.ts ./next-env.d.ts
COPY frontend/eslint.config.mjs ./eslint.config.mjs

# Change ownership of the app directory to the nodejs user
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port 3000 (Next.js dev server)
EXPOSE 3000

# Start the Next.js development server
CMD ["pnpm", "run", "dev"]
