#!/bin/bash

# Build script for Auxin Frontend
echo "Starting build process..."

# Ensure we're in the right directory
cd "$(dirname "$0")"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Check if Vite is available
if ! npx vite --version > /dev/null 2>&1; then
    echo "Vite not found, installing..."
    npm install vite --save-dev
fi

# Build with Vite (Vite handles TypeScript compilation)
echo "Building with Vite..."
npx vite build

echo "Build completed successfully!"
