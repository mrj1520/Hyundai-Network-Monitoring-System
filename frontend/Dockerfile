FROM node:20-slim

WORKDIR /app

# Copy packages lists
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .

# Install serving client
RUN npm install -g serve

EXPOSE 3000

# Compile Vite at startup (when Railway runtime environment variables are populated) and serve
CMD npm run build && npx serve -s dist -l ${PORT:-3000}
