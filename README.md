# Lead Scoring Service

An AI-powered lead scoring service that uses Google's Gemini AI to automatically evaluate and score leads based on custom offer criteria. Upload CSV files with lead data, define your offer parameters, and get intelligent scoring results to prioritize your sales efforts.

## Features

- **AI-Powered Scoring**: Leverages Google Gemini AI for intelligent lead evaluation
- **Bulk Processing**: Upload and score thousands of leads via CSV files
- **Custom Offers**: Define specific offer criteria and requirements
- **Batch Processing**: Asynchronous scoring with status tracking
- **Export Results**: Download scored leads with detailed insights
- **Secure Authentication**: JWT-based authentication system
- **RESTful API**: Clean, well-documented API endpoints

## Tech Stack

- **Runtime**: Node.js (>=18.0.0)
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **AI**: Google Generative AI (Gemini)
- **Authentication**: JWT
- **File Processing**: Multer, CSV Parser, Fast-CSV
- **Logging**: Winston
- **Testing**: Jest
- **Security**: Helmet, CORS, bcryptjs

## Prerequisites

- Node.js 18.0.0 or higher
- MongoDB instance (local or cloud)
- Google Gemini API key

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd lead-scoring-service
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your `.env` file:
```env
# Server
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/lead-scoring

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# Gemini AI
GEMINI_API_KEY=your-gemini-api-key-here

# Rate Limiting
MAX_FILE_SIZE=10485760
MAX_LEADS_PER_UPLOAD=10000
```

## Getting Started

### Development Mode

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

### Running Tests

```bash
# Run tests with coverage
npm test

# Watch mode
npm run test:watch
```

### Linting

```bash
# Check for issues
npm run lint

# Auto-fix issues
npm run lint:fix
```

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication

All endpoints (except health check) require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### Health Check
```http
GET /api/health
```
Returns service status and timestamp.

#### Offers

**Create Offer**
```http
POST /api/offer
Content-Type: application/json

{
  "name": "Premium Software Package",
  "description": "Enterprise software solution",
  "criteria": {
    "industry": "Technology",
    "companySize": "50-500",
    "budget": "$10,000+"
  }
}
```

**Get All Offers**
```http
GET /api/offers
```

**Get Single Offer**
```http
GET /api/offer/:id
```

#### Lead Upload

**Upload Leads**
```http
POST /api/leads/upload
Content-Type: multipart/form-data

file: <csv-file>
```

CSV format example:
```csv
name,email,company,industry,companySize,budget,phone
John Doe,john@example.com,Acme Corp,Technology,100-500,$50000,555-0100
```

#### Scoring

**Score Leads**
```http
POST /api/score
Content-Type: multipart/form-data

file: <csv-file>
offerId: <offer-id>
```

**Get Scoring Status**
```http
GET /api/score/:batchId/status
```

#### Results

**Get Results**
```http
GET /api/results?offerId=<offer-id>&minScore=<score>
```

**Export Results**
```http
GET /api/results/export?offerId=<offer-id>
```
Returns CSV file with scored leads.

## Project Structure

```
lead-scoring-service/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.ts  # MongoDB connection
│   │   ├── env.ts       # Environment variables
│   │   └── gemini.ts    # Gemini AI setup
│   ├── controllers/     # Request handlers
│   │   ├── lead.controller.ts
│   │   ├── offer.controller.ts
│   │   └── score.controller.ts
│   ├── middleware/      # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── upload.middleware.ts
│   ├── models/          # Mongoose models
│   │   ├── lead.model.ts
│   │   └── offer.model.ts
│   ├── routes/          # API routes
│   │   └── index.ts
│   ├── services/        # Business logic
│   │   ├── ai.service.ts
│   │   ├── csv.service.ts
│   │   └── scoring.service.ts
│   ├── types/           # TypeScript types
│   │   └── index.ts
│   ├── utils/           # Utility functions
│   │   ├── logger.ts
│   │   └── validators.ts
│   └── app.ts           # Application entry point
├── tests/               # Test files
├── .env.example         # Environment template
├── package.json
└── tsconfig.json
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment mode | development |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/lead-scoring |
| `JWT_SECRET` | Secret key for JWT | - |
| `JWT_EXPIRE` | JWT expiration time | 7d |
| `GEMINI_API_KEY` | Google Gemini API key | - |
| `MAX_FILE_SIZE` | Maximum upload file size (bytes) | 10485760 |
| `MAX_LEADS_PER_UPLOAD` | Maximum leads per upload | 10000 |

## Error Handling

The service uses centralized error handling with appropriate HTTP status codes:

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `404` - Not Found
- `500` - Internal Server Error

Error response format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

## Logging

Winston logger is configured to log to:
- Console (development)
- `combined.log` (all logs)
- `error.log` (error logs only)

## Security

- Helmet.js for security headers
- CORS enabled
- JWT authentication
- Password hashing with bcryptjs
- File upload validation
- Request size limits

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

ISC

## Support

For issues and questions, please open an issue in the repository.
