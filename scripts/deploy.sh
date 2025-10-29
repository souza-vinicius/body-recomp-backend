#!/bin/bash
set -e
echo "Body Recomp Deployment"
docker-compose down
docker-compose build
docker-compose up -d
sleep 5
docker-compose exec -T api alembic upgrade head
echo "Done! API: http://localhost:8000"
