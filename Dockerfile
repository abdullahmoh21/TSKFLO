# ----- STAGE 1: Build the frontend with Vite -----
    FROM node:18 AS build-frontend

    # Create app directory in the container
    WORKDIR /app
    
    # Copy ONLY package and lock files for frontend, then install dependencies
    COPY frontend/package.json frontend/package-lock.json ./
    RUN npm ci
    
    # Copy the rest of the frontend code, then build
    COPY frontend/ .
    RUN npm run build
    
    # ----- STAGE 2: Build the backend and bundle the frontend's build output -----
    FROM node:18 AS server
    
    WORKDIR /app
    
    # Copy ONLY package and lock files for backend, then install dependencies.
    # Force rebuild of native dependencies
    COPY backend/package.json backend/package-lock.json ./
    RUN npm ci --force --build-from-source
    
    # Copy the backend source code into container
    COPY backend/ .
    
    # Bring in the compiled frontend from the first stage
    # This copies the "dist" folder (Vite's default build output) to "public" in the backend
    COPY --from=build-frontend /app/dist ./public
    
    EXPOSE 3200
    
    # Start the backend
    CMD ["npm", "start"]
    