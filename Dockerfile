# Use official Node.js LTS image (Debian-based for better-sqlite3 compatibility)
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Expose port (change if your app uses a different port)
EXPOSE 3000

# Set environment variable for production (optional)
# ENV NODE_ENV=production

# Start the application
CMD ["pnpm", "run", "start"]
