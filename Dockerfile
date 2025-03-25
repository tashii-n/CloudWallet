# Use the official Node.js image with Alpine
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Copy package files first to leverage Docker caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the Next.js app
RUN npm run build

# Start a new lightweight container for the production environment
FROM node:18-alpine AS runner

WORKDIR /usr/src/app

# Copy only the necessary files from the builder stage
COPY --from=builder /usr/src/app/package.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/public ./public

# Expose the port
EXPOSE 4003

# Set environment variables for production
ENV NODE_ENV=production
ENV PORT=4003

# Run the production server
CMD ["npm", "start"]

