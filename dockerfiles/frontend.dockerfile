# Use official Node.js image as the base
FROM node:18-alpine

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
COPY frontend/tailwind.config.js ./tailwind.config.js
COPY frontend/postcss.config.js ./postcss.config.js
COPY frontend/jsconfig.json ./jsconfig.json

# Expose port 3000 (Next.js dev server)
EXPOSE 3000

# Start the Next.js development server
CMD ["pnpm", "run", "dev"]
