FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Expose the port the app runs on
EXPOSE 4003

# Run the application
CMD ["npm", "start"]
