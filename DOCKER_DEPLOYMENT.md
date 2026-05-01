# Docker Setup (Optional - for Production)

This guide helps you containerize the Pestify backend for easy deployment.

## Prerequisites

- Install Docker: https://www.docker.com/products/docker-desktop
- Install Docker Compose (comes with Docker Desktop)

## Dockerfile

Create `pestify-backend/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

## Docker Compose

Create `pestify-backend/docker-compose.yml`:

```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_HOST}/pestify?retryWrites=true&w=majority
      - JWT_SECRET=${JWT_SECRET}
    restart: always

  # Optional: Local MongoDB (uncomment if using local MongoDB instead of Atlas)
  # mongo:
  #   image: mongo:latest
  #   ports:
  #     - "27017:27017"
  #   environment:
  #     MONGO_INITDB_ROOT_USERNAME: admin
  #     MONGO_INITDB_ROOT_PASSWORD: password
  #   volumes:
  #     - mongo_data:/data/db
  # 
  # volumes:
  #   mongo_data:
```

Create `.env.production`:

```env
NODE_ENV=production
MONGO_USER=your_mongodb_username
MONGO_PASSWORD=your_mongodb_password
MONGO_HOST=cluster.mongodb.net
JWT_SECRET=your_super_secret_jwt_key
PORT=5000
```

## Build and Run

### Local Testing

```bash
# Build image
docker build -t pestify-backend:latest .

# Run container
docker run -p 5000:5000 \
  -e MONGODB_URI="mongodb+srv://..." \
  -e JWT_SECRET="secret" \
  pestify-backend:latest
```

### Using Docker Compose

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop
docker-compose down
```

## Deploy to Heroku with Docker

```bash
# Login to Heroku
heroku login

# Create app
heroku create your-pestify-backend

# Add Heroku container registry
heroku container:login

# Push image
heroku container:push web -a your-pestify-backend

# Release
heroku container:release web -a your-pestify-backend

# View logs
heroku logs --tail -a your-pestify-backend
```

## Deploy to AWS

### Option 1: Elastic Container Service (ECS)

```bash
# Create ECR repository
aws ecr create-repository --repository-name pestify-backend

# Build and push
docker build -t pestify-backend:latest .
docker tag pestify-backend:latest YOUR_AWS_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/pestify-backend:latest
docker push YOUR_AWS_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/pestify-backend:latest
```

### Option 2: AWS AppRunner

```bash
# Create AppRunner service pointing to your ECR repository
# Set environment variables in the console
```

## Deploy to Railway.app

1. Push code to GitHub
2. Go to https://railway.app
3. Create new project → GitHub repo
4. Add environment variables
5. Deploy!

## Deploy to DigitalOcean App Platform

1. Push code to GitHub
2. Go to DigitalOcean App Platform
3. Create App → Select GitHub repo
4. Configure build settings
5. Deploy!

## Monitoring

### View Container Logs

```bash
docker logs container_id
docker logs -f container_id  # Follow logs
```

### Check Container Status

```bash
docker ps                    # Running containers
docker ps -a                 # All containers
docker stats                 # Resource usage
```

## Optimization Tips

1. Use Alpine Linux base image (3x smaller)
2. Multi-stage builds for smaller images
3. Minimize layers in Dockerfile
4. Use `.dockerignore` file

## .dockerignore

Create `pestify-backend/.dockerignore`:

```
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.env.local
.DS_Store
```

## Production Checklist

- [ ] Use strong JWT_SECRET
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS
- [ ] Set up environment variables securely
- [ ] Configure MongoDB backups
- [ ] Set up monitoring/alerts
- [ ] Enable rate limiting
- [ ] Set up CORS properly
- [ ] Use environment-specific configs
- [ ] Test all endpoints before deploying

## Kubernetes (Advanced)

For larger deployments, create `pestify-backend/k8s-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pestify-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: pestify-backend
  template:
    metadata:
      labels:
        app: pestify-backend
    spec:
      containers:
      - name: pestify-backend
        image: your-registry/pestify-backend:latest
        ports:
        - containerPort: 5000
        env:
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: mongodb-secret
              key: uri
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: jwt-secret
              key: secret
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: pestify-backend-service
spec:
  selector:
    app: pestify-backend
  type: LoadBalancer
  ports:
  - protocol: TCP
    port: 80
    targetPort: 5000
```

Deploy to Kubernetes:

```bash
kubectl apply -f k8s-deployment.yaml
```

## Troubleshooting

### Image won't build
```bash
docker system prune         # Remove unused images
docker build --no-cache .   # Rebuild without cache
```

### Port already in use
```bash
docker ps                           # Find container
docker kill container_id            # Stop it
sudo lsof -i :5000                 # Find process on port
kill -9 process_id                  # Force kill
```

### Container exits immediately
```bash
docker logs container_id     # Check error logs
```

## Next Steps

1. Get Docker set up locally
2. Test container build
3. Deploy to your chosen platform
4. Set up CI/CD pipeline
5. Monitor performance

See `README.md` for traditional deployment options.
