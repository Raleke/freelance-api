# Use official Node.js LTS image
FROM node:18

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install --production

# Bundle app source
COPY . .

# Expose port the app runs on
EXPOSE 4000

# Start the server
CMD ["npm", "start"]
