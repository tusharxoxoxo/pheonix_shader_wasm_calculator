# Shader API Project

This project is a full-stack application with a Bun/Vite frontend and Phoenix/Elixir backend.

## Environment Variables

This project requires certain environment variables to be set. Create a `.env` file in the root directory with the following variables:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
SECRET_KEY_BASE=your_secret_key_base_here
```





> **Important**: Never commit the `.env` file to version control. The repository includes a `.env.example` file as a template.

## Development Setup

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
bun install
```

3. Start the development server:
```bash
bun run dev
```

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
mix deps.get
```

3. Start the Phoenix server:
```bash
mix phx.server
```

## Docker Deployment

To run the entire application using Docker:

1. Build the Docker image:
```bash
docker build -t shader-api .
```

2. Run the container:
```bash
docker run -p 80:80 shader-api
```

The application will be available at `http://localhost`.

### Docker Commands Reference

- Stop the container:
```bash
docker stop <container_id>
```

- View running containers:
```bash
docker ps
```

- View logs:
```bash
docker logs <container_id>
```

## Project Structure

- `/frontend` - Bun/Vite frontend application
- `/backend` - Phoenix/Elixir backend application
- `Dockerfile` - Multi-stage build file for production deployment
- `nginx.conf` - Nginx configuration for serving the application
