# 🛠️ Build Stage
FROM --platform=linux/amd64 node:18-alpine AS build
WORKDIR /app

# Copy package.json and install dependencies first for better caching
COPY package*.json ./
RUN npm ci

# Copy everything else and build the project
COPY . .
RUN npm run build

# 🌎 Production Stage
FROM --platform=linux/amd64 node:18-alpine
WORKDIR /app

# Copy only the necessary files from the build stage
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.js ./next.config.js

# Expose the application port
EXPOSE 4003

# Set environment to production
ENV NODE_ENV=production

# Start the Next.js server
CMD ["npm", "run", "start"]

