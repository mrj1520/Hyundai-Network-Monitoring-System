FROM node:20-slim

WORKDIR /app

# Copy packages lists
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .

# Declare build-arg to accept Railway variables during docker build phase
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Install serving client
RUN npm install -g serve

EXPOSE 3000

# Start and serve build outputs dynamically
CMD npx serve -s dist -l ${PORT:-3000}
