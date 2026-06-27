# ==========================================
# Stage 1: Build the React Frontend
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

# Install dependencies first for caching
COPY frontend/package*.json ./
RUN npm install

# Build the frontend assets
COPY frontend/ ./
RUN npm run build

# ==========================================
# Stage 2: Build the FastAPI Backend
# ==========================================
FROM python:3.11-slim

# Install system dependencies needed for psycopg2 and compiling
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ /app/

# Copy the built React assets from Stage 1 into the backend's static folder
COPY --from=frontend-builder /app/backend/app/static /app/app/static


# Expose port
EXPOSE 8000

# Run the app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
