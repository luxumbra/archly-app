# Use official Node.js image as the base
FROM node:18

# Set working directory
WORKDIR /app

# Install Bun using the official method
RUN curl -fsSL https://bun.sh/install | bash && \
    mv /root/.bun/bin/bun /usr/local/bin/bun

# Ensure Bun is available in the system PATH
ENV PATH="/usr/local/bin:$PATH"

# Install dependencies
# Copy the entire application code
# COPY . .
COPY ../frontend ./

RUN bun install


# Expose port 3000 (Next.js dev server)
EXPOSE 3000

# Start the Next.js development server
CMD ["bun", "run", "dev"]
