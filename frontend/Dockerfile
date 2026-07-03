FROM node:20-slim

WORKDIR /app

# Copy packages lists
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# Install serving client
RUN npm install -g serve

EXPOSE 3000

# Start and serve build outputs dynamically
CMD npx serve -s dist -l ${PORT:-3000}
