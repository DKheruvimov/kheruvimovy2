# --- Stage 1: Build the client and server ---
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies based on the lockfile for faster, deterministic builds
COPY package*.json ./
RUN npm ci

# Copy the application source files
COPY . .

# Compile both Vite frontend assets and Node/esbuild backend server
RUN npm run build

# --- Stage 2: Create lightweight production image ---
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package configurations and install only production-only dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy only the compiled production ready production assets (the client bundle & compiled Express server)
COPY --from=builder /app/dist ./dist

# Create local data storage directory where administrative config, RSVP responses,
# and content updates are saved locally. Assign directory ownership to the standard non-root 'node' user.
RUN mkdir -p /app/data && chown -R node:node /app

# Switch to standard non-root node user for better security
USER node

# Expose the API and application port
EXPOSE 3000

# Define a persistent volume for the local JSON storage folder
VOLUME [ "/app/data" ]

# Spin up the compiled Node.js Express server
CMD ["node", "dist/server.cjs"]
