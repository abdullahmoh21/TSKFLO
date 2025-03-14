FROM node:18

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the port the server runs on
EXPOSE 3200

# Command to run the application
CMD ["npm", "run", "dev"]
