#!/bin/bash
# Build and Push Images to Docker Hub

set -e

DOCKERHub_USERNAME="${DOCKERHub_USERNAME:-yourusername}"
IMAGE_NAME="asistente-psicologico"

echo "🔨 Building images..."
echo "   Docker Hub: docker.io/${DOCKERHub_USERNAME}"

# Build bot
echo "📦 Building bot..."
docker build -t ${IMAGE_NAME}-bot:latest -f bot/Dockerfile bot/

# Build dashboard
echo "📦 Building dashboard..."
docker build -t ${IMAGE_NAME}-dashboard:latest -f dashboard/Dockerfile dashboard/

# Tag for Docker Hub
echo "🏷️  Tagging..."
docker tag ${IMAGE_NAME}-bot:latest ${DOCKERHub_USERNAME}/${IMAGE_NAME}-bot:latest
docker tag ${IMAGE_NAME}-dashboard:latest ${DOCKERHub_USERNAME}/${IMAGE_NAME}-dashboard:latest

# Login (descomenta si necesitas login)
# echo "🔐 Docker login..."
# docker login -u ${DOCKERHub_USERNAME}

# Push
echo "📤 Pushing to Docker Hub..."
docker push ${DOCKERHub_USERNAME}/${IMAGE_NAME}-bot:latest
docker push ${DOCKERHub_USERNAME}/${IMAGE_NAME}-dashboard:latest

echo "✅ Done!"
echo ""
echo "📋 Images available:"
echo "   docker.io/${DOCKERHub_USERNAME}/${IMAGE_NAME}-bot:latest"
echo "   docker.io/${DOCKERHub_USERNAME}/${IMAGE_NAME}-dashboard:latest"

echo ""
echo "🚀 Railway deployment:"
echo "   railway up --service bot --dockerfile bot/Dockerfile"
echo "   railway up --service dashboard --dockerfile dashboard/Dockerfile"