# Use official Node.js LTS image
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install

# Bundle app source
COPY . .

# Expose any ports if needed (worker likely does not expose ports)
# EXPOSE 3000

# Start the worker
CMD ["node", "src/worker.js"]
