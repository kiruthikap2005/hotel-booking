FROM node:18-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
RUN npm install --only=production

# Copy the server and data folder
COPY server.js ./
COPY data/ ./data/

# Expose the default backend port
EXPOSE 5000

# Run the server
CMD ["node", "server.js"]
