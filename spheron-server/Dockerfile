FROM node:23-slim

WORKDIR /app

# Copy package files
COPY . .

# Install dependencies
RUN npm install

# Build TypeScript code
RUN npm run build

# Set environment variables
ENV NODE_ENV=production

# Command to run the server
CMD ["node", "build/index.js"] 