#!/usr/bin/env bash
# Install system dependencies
apt-get update && apt-get install -y build-essential python3-dev

# Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt
