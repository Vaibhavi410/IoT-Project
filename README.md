# Pestify Backend Setup Guide

## Overview
This backend is built with Node.js, Express.js, and MongoDB. It provides REST APIs for user authentication, pest analysis, and treatment management.

## Project Structure

```
pestify-backend/
├── config/           # Database configuration
├── models/           # MongoDB schemas
├── routes/           # API endpoints
├── controllers/      # Business logic
├── middleware/       # Authentication middleware
├── server.js         # Main server file
├── package.json      # Dependencies
└── .env             # Environment variables
```

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB Account (MongoDB Atlas)

## Installation

### 1. Install Dependencies

```bash
cd pestify-backend
npm install
```

### 2. MongoDB Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster
4. Click "Connect" and get your connection string
5. It should look like: `mongodb+srv://username:password@cluster.mongodb.net/pestify?retryWrites=true&w=majority`

### 3. Configure Environment Variables

Update the `.env` file:

```env
MONGODB_URI=mongodb+srv://your_username:your_password@cluster.mongodb.net/pestify?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=5000
NODE_ENV=development
```

⚠️ **Important**: Replace `your_username` and `your_password` with your MongoDB credentials.

## Running the Server

### Development (with auto-restart)

```bash
npm run dev
```

### Production

```bash
npm start
```

The server will start on `http://localhost:5000`

Check if it's running:
```bash
curl http://localhost:5000/api/health
```

## API Endpoints

### Authentication

- **POST** `/api/auth/register` - Register a new user
- **POST** `/api/auth/login` - Login user
- **GET** `/api/auth/me` - Get current user (requires token)
- **PUT** `/api/auth/update` - Update user profile (requires token)

### Pest Analysis

- **POST** `/api/pest/analyze` - Create pest analysis
- **GET** `/api/pest/history` - Get user's pest history
- **GET** `/api/pest/:id` - Get single pest analysis
- **PUT** `/api/pest/:id` - Update pest analysis
- **DELETE** `/api/pest/:id` - Delete pest analysis

### Treatment

- **POST** `/api/treatment/create` - Create treatment plan
- **GET** `/api/treatment/my-treatments` - Get all user treatments
- **GET** `/api/treatment/pest/:pestId` - Get treatments for a pest
- **GET** `/api/treatment/:id` - Get single treatment
- **PUT** `/api/treatment/:id` - Update treatment
- **DELETE** `/api/treatment/:id` - Delete treatment

## Example API Requests

### Register User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Farmer",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create Pest Analysis

```bash
curl -X POST http://localhost:5000/api/pest/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "pestName": "Aphids",
    "confidence": 85,
    "severity": "high",
    "cropType": "Wheat",
    "location": "Field A",
    "affectedArea": 500,
    "recommendations": ["Apply insecticide", "Remove affected leaves"]
  }'
```

## Connecting Frontend to Backend

### Update Frontend API URL

In `IoT-Project/.env`:

```
EXPO_PUBLIC_API_URL=http://YOUR_MACHINE_IP:5000/api
```

**To find your IP:**
- Windows: Run `ipconfig` in terminal, look for "IPv4 Address" under your connection
- Mac/Linux: Run `ifconfig`, look for "inet" address

Example: `http://192.168.0.100:5000/api`

### Local Development

For testing on physical devices or emulators, use your machine's IP address (not localhost):

1. Find your IP:
   ```bash
   # Windows
   ipconfig
   
   # Mac/Linux
   ifconfig
   ```

2. Update `.env` in IoT-Project:
   ```
   EXPO_PUBLIC_API_URL=http://192.168.X.X:5000/api
   ```

3. Make sure both backend and app are on the same network

## Deployment

### Heroku Deployment

1. Create Heroku account at https://www.heroku.com
2. Install Heroku CLI
3. Login: `heroku login`
4. Create app: `heroku create your-app-name`
5. Add MongoDB URI: `heroku config:set MONGODB_URI="your_mongodb_uri"`
6. Push to Heroku: `git push heroku main`

### Railway Deployment

1. Go to https://railway.app
2. Create new project
3. Connect GitHub repo
4. Add MongoDB plugin
5. Set environment variables
6. Deploy

### AWS Deployment

1. Use EC2 for compute
2. Use MongoDB Atlas for database
3. Use RDS for PostgreSQL (if needed)
4. Use S3 for file storage

## Database Models

### User Schema

```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  farmLocation: String,
  farmArea: Number,
  phoneNumber: String,
  createdAt: Date
}
```

### PestAnalysis Schema

```javascript
{
  userId: ObjectId (ref: User),
  pestName: String,
  confidence: Number (0-100),
  severity: String (low/medium/high/critical),
  cropType: String,
  location: String,
  affectedArea: Number,
  recommendations: [String],
  treatments: [ObjectId] (ref: Treatment),
  status: String (new/in_progress/resolved),
  createdAt: Date
}
```

### Treatment Schema

```javascript
{
  pestId: ObjectId (ref: PestAnalysis),
  userId: ObjectId (ref: User),
  treatmentName: String,
  pesticide: {
    name: String,
    dosage: String,
    instructions: String,
    safetyWarnings: [String]
  },
  applicationMethod: String,
  frequency: { interval: Number, unit: String },
  effectiveness: Number (0-100),
  status: String (planned/in_progress/completed),
  createdAt: Date
}
```

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

## Troubleshooting

### MongoDB Connection Error

- Check if MongoDB URI is correct
- Verify credentials
- Check if IP is whitelisted in MongoDB Atlas (add 0.0.0.0/0 for development)

### CORS Error

The backend is configured with CORS enabled. If you get CORS errors:
- Check that your frontend URL is allowed
- Update `cors()` in `server.js` if needed

### Token Expiration

- Tokens expire after 7 days
- Frontend should handle 401 errors by redirecting to login

## Performance Tips

- Index frequently queried fields in MongoDB
- Use pagination for large datasets
- Cache frequently accessed data
- Use compression middleware for responses
- Monitor API response times

## Security Best Practices

- Never commit `.env` file to Git
- Use strong JWT_SECRET in production
- Validate all user inputs
- Sanitize database queries
- Use HTTPS in production
- Set appropriate CORS policies
- Rate limit API endpoints
- Hash passwords (already implemented with bcryptjs)

## Support & Resources

- Express.js: https://expressjs.com/
- Mongoose: https://mongoosejs.com/
- MongoDB: https://docs.mongodb.com/
- JWT: https://jwt.io/

## License

MIT
