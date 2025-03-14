FROM node:18-alpine as builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all files
COPY . .

# Build the application
RUN npm run build

# Production stage with Nginx
FROM nginx:stable-alpine

# Copy the build files from the build stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy a custom nginx config file for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
