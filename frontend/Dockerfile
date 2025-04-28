FROM node:18-alpine

WORKDIR /app

# Copy package files first for better layer caching
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Ensure the directories exist
RUN mkdir -p src/pages public

# Expose port 3000
EXPOSE 3000

# Start in development mode
CMD ["npm", "run", "dev", "--", "-p", "3000", "-H", "0.0.0.0"]