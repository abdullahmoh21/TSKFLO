# Docker Submission Guide for Task Management Project

This guide provides step-by-step instructions for preparing and submitting your Docker image for verification.

## Step 1: Prepare Your Environment

Ensure Docker and Docker Compose are installed on your system:

```bash
docker --version
docker-compose --version
```

## Step 2: Build Your Docker Images

Navigate to your project directory and build the Docker images:

```bash
cd /Users/abdur/Desktop/310Project/task-management
docker-compose build
```

This will create the following Docker images:
- `task-management-backend`
- `task-management-frontend`

## Step 3: Test Your Application in Docker

Start your containerized application to verify everything works correctly:

```bash
docker-compose up -d
```

Access your application at:
- Frontend: http://localhost
- Backend API: http://localhost:3200

Test all the key functionalities including:
- User registration and login
- Task creation and management
- Admin dashboard features
- User management

## Step 4: Package Your Docker Image for Submission

Once you've verified everything works correctly, stop the containers:

```bash
docker-compose down
```

### Method 1: Save Docker Images as a File

Create a tar archive containing all the required images:

```bash
docker save -o task-management-images.tar task-management_frontend:latest task-management_backend:latest mongo:5.0
```

This will create a `task-management-images.tar` file that contains all three Docker images. Note that this file may be large (potentially several GB).

### Method 2: Push to a Docker Registry (if your instructor requires it)

1. Tag your images:
```bash
docker tag task-management_frontend:latest [your-registry]/task-management-frontend:latest
docker tag task-management_backend:latest [your-registry]/task-management-backend:latest
```

2. Push the images:
```bash
docker push [your-registry]/task-management-frontend:latest
docker push [your-registry]/task-management-backend:latest
```

## Step 5: Submit Your Work

### Option 1: Submitting the Docker Archive
1. If the tar file is too large to submit directly, upload it to a file-sharing service like Google Drive or Dropbox
2. Share the download link with your instructor
3. Include the docker-compose.yml file and any setup instructions

### Option 2: Submitting a GitHub Repository with Docker Files
1. Make sure your repository includes:
   - All Dockerfiles
   - docker-compose.yml
   - README with setup instructions
   - .env.example files for reference
2. Share the GitHub repository link with your instructor

## Verification Instructions for Your Instructor

Include these instructions for your instructor to run your application:

1. Load the Docker images (if provided as a tar file):
```bash
docker load -i task-management-images.tar
```

2. Or clone the repository and build the images:
```bash
git clone [your-repository-url]
cd task-management
docker-compose build
```

3. Start the application:
```bash
docker-compose up -d
```

4. Access the application at:
   - Frontend: http://localhost
   - Backend API: http://localhost:3200

5. Login with the following credentials (if you have a demo account):
   - Email: [admin-email]
   - Password: [admin-password]

## Troubleshooting Notes

If your instructor encounters any issues:

1. Check Docker logs:
```bash
docker-compose logs
```

2. Ensure all containers are running:
```bash
docker-compose ps
```

3. Verify MongoDB is properly initialized:
```bash
docker-compose exec mongo mongo task-management --eval "db.users.find()"
```

4. Make sure the frontend is properly connecting to the backend by checking the browser console
