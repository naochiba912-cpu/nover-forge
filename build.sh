#!/usr/bin/env bash
set -o errexit
echo "Installing backend dependencies..."
cd backend
pip install -r requirements.txt
echo "Build complete!"
