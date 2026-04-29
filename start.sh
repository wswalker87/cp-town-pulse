#!/bin/bash

echo "Starting local setup..."

if [ ! -f .env ]; then
  echo "ERROR: .env file not found at project root. Create one before continuing."
  exit 1
else
  echo ".env already exists"
fi

echo "Building and starting Docker containers..."
docker compose up --build -d

echo "Waiting for database to be ready..."
sleep 15

echo "Running migrations..."
docker compose exec backend python manage.py migrate

echo ""
echo "Setup complete."
echo "Frontend: http://localhost"
echo "Backend: http://localhost:8000"
echo ""
echo "If needed, create a superuser with:"
echo "docker compose exec backend python manage.py createsuperuser"