FROM node:22-alpine

WORKDIR /app

# Copy root-level files needed for the build script
COPY package*.json ./
COPY scripts/ ./scripts/
COPY apps/mcp-server/package*.json ./apps/mcp-server/

# Install dependencies (including dev deps for the build script)
RUN npm install --legacy-peer-deps

# Copy the rest of the mcp-server code
COPY apps/mcp-server/ ./apps/mcp-server/

# Build the doc index as part of the image
RUN npm --prefix apps/mcp-server run build:index

# Set working directory to the server
WORKDIR /app/apps/mcp-server

# Expose the port (Render/Railway will override this)
EXPOSE 3000

# Start the server
CMD ["npm", "start"]