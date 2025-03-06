# Use the official Node.js image as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) into the container
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app files into the container
COPY . .

# Build the Next.js app (this step compiles the app for production)
RUN npm run build

# Expose port 3000
EXPOSE 4003

# Start the app in production mode
CMD ["npm", "start"]
