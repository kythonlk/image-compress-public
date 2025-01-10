# Image Upload and Compress Service

A web application that allows users to upload images, automatically processes them to WebP format, and provides easy access to the converted images. Built with React (frontend) and Express.js (backend).

## Features

- Multiple image upload support
- Automatic conversion to WebP format
- Image resizing to 800px width
- Custom prefix naming for uploaded files
- Real-time upload status tracking
- Docker support with multi-stage builds

## Prerequisites

- Node.js 20 or higher
- Docker (optional)

## Project Structure

```
.
├── frontend/           # React frontend application
├── backend/           # Express.js backend server
└── uploads/           # Directory for processed images
```

## Development Setup

### Backend

```bash
cd backend
npm install
npm run build
npm start
```

The server will start on http://localhost:3000

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The development server will start on http://localhost:5173

## Docker Deployment

Build and run the entire application using Docker:

```bash
# Build the Docker image
docker build -t image-processor .

# Run the container
docker run -p 3000:3000 -v ./uploads:/app/uploads image-processor
```

## Environment Variables

None required by default, but you can customize:
- Backend port (default: 3000)
- Frontend development port (default: 5173)

## Features in Detail

- Image Processing:
  - Converts uploaded images to WebP format
  - Resizes images to 800px width
  - Maintains quality at 90%
  - Custom prefix naming support
  
- Storage:
  - Processed images stored in `/uploads` directory
  - Volume mounting support for persistent storage in Docker

## API Endpoints

### POST /upload
- Accepts multiple files
- Query Parameters:
  - `prefix`: Custom prefix for renamed files (default: "images")
- Returns:
  - List of processed files with status and URLs
