# Use Alpine-based Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Create necessary directories for file uploads if any
RUN mkdir -p public/uploads && \
    chmod 755 public/uploads

# Expose the port the app runs on
EXPOSE 3000