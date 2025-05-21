# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy app source code
COPY . .

# Expose port
EXPOSE 3000

# Create data directory (if not mounted as a volume)
RUN mkdir -p /usr/src/app/data

# Start the app
CMD ["node", "app.js"]
