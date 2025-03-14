# Task Management Application - Docker Guide

This guide provides instructions for creating and submitting a Docker image of the Task Management application for verification.

## Project Overview

The Task Management Application is a full-stack web application with:
- **Frontend**: React application built with Vite
- **Backend**: Node.js/Express.js API
- **Database**: MongoDB

## Docker Setup Instructions

### Prerequisites
- Docker and Docker Compose installed on your machine
- Git repository of the project cloned locally

### Directory Structure
```
task-management/
├── backend/         # Node.js backend
├── frontend/        # React frontend
├── docker-compose.yml
└── README.md
```

### Environment Configuration

Before running the Docker containers, create a `.env` file in the backend directory with the following variables:

```
NODE_ENV=development
PORT=3200
MONGODB_URI=mongodb://mongo:27017/task-management
JWT_SECRET=your_jwt_secret_key
# Add any other required environment variables
```

## Building and Running with Docker

1. Build the Docker images:

```bash
docker-compose build
```

2. Start the containers:

```bash
docker-compose up -d
```

3. Access the application:
   - Frontend: http://localhost
   - Backend API: http://localhost:3200

4. Stop the containers:

```bash
docker-compose down
```

## Creating a Docker Image for Submission

To create a Docker image for submission, follow these steps:

1. Make sure all configurations are properly set up
2. Build the images:

```bash
docker-compose build
```

3. Save the images to a file:

```bash
docker save -o task-management-app.tar task-management-backend task-management-frontend mongo:5.0
```

4. Submit the `task-management-app.tar` file to your instructor

## Verifying the Application

After starting the containers with `docker-compose up`, you can verify the application by:

1. Accessing the frontend at http://localhost
2. Creating an account and logging in
3. Creating tasks and managing them through the interface
4. Testing the admin dashboard and user management features

## Troubleshooting

- If the frontend cannot connect to the backend, make sure the backend URL is correctly set in the frontend configuration
- If the backend cannot connect to MongoDB, check the `MONGODB_URI` environment variable
- Check Docker logs with `docker-compose logs`
