FROM node:20-slim

WORKDIR /app

# Copy all necessary files
COPY package*.json ./
COPY tsconfig.json ./
COPY src/ ./src/

# Install dependencies and build
RUN npm install --no-fund --legacy-peer-deps && \
    npm run build && \
    chmod +x ./build/index.js

# Set environment variables
ENV NODE_ENV=production

# Command to run the server
CMD ["node", "build/index.js"]