#!/bin/bash
# Production server for Flask PDF extraction service
# Usage: ./run_production.sh

cd "$(dirname "$0")"
gunicorn -w 4 -b 127.0.0.1:5001 --timeout 120 extract_service:app
