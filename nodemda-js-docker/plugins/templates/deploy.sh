#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Print each command before executing it (useful for debugging)
set -x

# Check if .env file exists; if not, copy default.env to .env
if [ ! -f .env ]; then
    cp default.env .env
    echo ".env file created from default.env"
else
    echo ".env file already exists; not overwriting"
fi

# Pull the latest code from the repository
# Uncomment this if this project is distributed under git
# git pull origin main

# Build the Docker images
docker-compose build

# Run the containers in detached mode
docker-compose up -d

# Print the status of running containers
docker-compose ps

echo "Deployment complete. The app is now running in detached mode."
