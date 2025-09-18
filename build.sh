#!/bin/bash

# Build script for Auxin Frontend
echo "Starting build process..."

# Check if TypeScript is available
if ! npx tsc --version > /dev/null 2>&1; then
    echo "TypeScript not found, installing..."
    npm install typescript --no-save
fi

# Type check (without emitting files)
echo "Running TypeScript type checking..."
npx tsc --noEmit

# Build with Vite
echo "Building with Vite..."
npx vite build

echo "Build completed successfully!"
