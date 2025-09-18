# JobGenie API Documentation

## Overview

The JobGenie API provides comprehensive endpoints for job searching, user management, and AI-powered career assistance. Built on Supabase with PostgreSQL, it offers real-time capabilities and robust security.

## Base URL
```
Production: https://your-project.supabase.co
Development: http://localhost:54321
```

## Authentication

All authenticated endpoints require a valid JWT token in the Authorization header:

```http
Authorization: Bearer <jwt_token>
```

### Authentication Endpoints

#### POST /auth/signup
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "jobTitle": "Software Engineer",
  "experienceLevel": "mid"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "session": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token"
  }
}
```

#### POST /auth/signin
Authenticate an existing user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "session": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token"
  }
}
```

#### POST /auth/signout
Sign out the current user.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "message": "Successfully signed out"
}
```

## User Management

### GET /api/users/profile
Get the current user's profile.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "jobTitle": "Software Engineer",
  "experienceLevel": "mid",
  "profileImageUrl": "https://example.com/avatar.jpg",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

### PUT /api/users/profile
Update the current user's profile.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "jobTitle": "Senior Software Engineer",
  "experienceLevel": "senior"
}
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "jobTitle": "Senior Software Engineer",
  "experienceLevel": "senior",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

### GET /api/users/skills
Get the current user's skills.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "skills": [
    {
      "id": "uuid",
      "skillName": "React",
      "proficiencyLevel": 4,
      "createdAt": "2024-01-15T10:00:00Z"
    },
    {
      "id": "uuid",
      "skillName": "TypeScript",
      "proficiencyLevel": 5,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### POST /api/users/skills
Add a new skill to the user's profile.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "skillName": "Python",
  "proficiencyLevel": 3
}
```

**Response:**
```json
{
  "id": "uuid",
  "skillName": "Python",
  "proficiencyLevel": 3,
  "createdAt": "2024-01-15T10:00:00Z"
}
```

## Job Management

### GET /api/jobs
Search and filter jobs.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 50)
- `query` (string): Search query for job title or description
- `location` (string): Job location filter
- `jobType` (string): Job type filter (full-time, part-time, contract, etc.)
- `salaryMin` (number): Minimum salary filter
- `salaryMax` (number): Maximum salary filter
- `remote` (boolean): Remote jobs only

**Example Request:**
```http
GET /api/jobs?query=software%20engineer&location=San%20Francisco&remote=true&page=1&limit=10
```

**Response:**
```json
{
  "jobs": [
    {
      "id": "uuid",
      "title": "Senior Software Engineer",
      "description": "We are looking for a senior software engineer...",
      "requirements": ["React", "TypeScript", "Node.js"],
      "location": "San Francisco, CA",
      "jobType": "full-time",
      "salaryMin": 120000,
      "salaryMax": 160000,
      "isRemote": true,
      "postedAt": "2024-01-15T10:00:00Z",
      "company": {
        "id": "uuid",
        "name": "TechCorp Inc.",
        "logoUrl": "https://example.com/logo.png",
        "industry": "Technology"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15
  }
}
```

### GET /api/jobs/:id
Get detailed information about a specific job.

**Response:**
```json
{
  "id": "uuid",
  "title": "Senior Software Engineer",
  "description": "Detailed job description...",
  "requirements": ["React", "TypeScript", "Node.js"],
  "location": "San Francisco, CA",
  "jobType": "full-time",
  "salaryMin": 120000,
  "salaryMax": 160000,
  "isRemote": true,
  "postedAt": "2024-01-15T10:00:00Z",
  "expiresAt": "2024-02-15T10:00:00Z",
  "company": {
    "id": "uuid",
    "name": "TechCorp Inc.",
    "description": "Leading technology company...",
    "logoUrl": "https://example.com/logo.png",
    "website": "https://techcorp.com",
    "industry": "Technology",
    "size": "large"
  }
}
```

### GET /api/jobs/recommendations
Get AI-powered job recommendations for the current user.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `limit` (number): Number of recommendations (default: 10, max: 20)

**Response:**
```json
{
  "recommendations": [
    {
      "id": "uuid",
      "title": "Senior Frontend Developer",
      "matchScore": 0.92,
      "company": {
        "name": "TechCorp Inc.",
        "logoUrl": "https://example.com/logo.png"
      },
      "location": "San Francisco, CA",
      "salaryMin": 120000,
      "salaryMax": 160000,
      "postedAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

## Application Management

### GET /api/applications
Get the current user's job applications.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `status` (string): Filter by application status
- `page` (number): Page number
- `limit` (number): Items per page

**Response:**
```json
{
  "applications": [
    {
      "id": "uuid",
      "status": "pending",
      "coverLetter": "Dear hiring manager...",
      "appliedAt": "2024-01-15T10:00:00Z",
      "job": {
        "id": "uuid",
        "title": "Senior Software Engineer",
        "company": {
          "name": "TechCorp Inc.",
          "logoUrl": "https://example.com/logo.png"
        }
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

### POST /api/applications
Apply to a job.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "jobId": "uuid",
  "coverLetter": "Dear hiring manager, I am excited to apply..."
}
```

**Response:**
```json
{
  "id": "uuid",
  "jobId": "uuid",
  "status": "pending",
  "coverLetter": "Dear hiring manager...",
  "appliedAt": "2024-01-15T10:00:00Z"
}
```

## Saved Jobs

### GET /api/saved-jobs
Get the current user's saved jobs.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "savedJobs": [
    {
      "id": "uuid",
      "savedAt": "2024-01-15T10:00:00Z",
      "job": {
        "id": "uuid",
        "title": "Senior Software Engineer",
        "company": {
          "name": "TechCorp Inc.",
          "logoUrl": "https://example.com/logo.png"
        },
        "location": "San Francisco, CA",
        "salaryMin": 120000,
        "salaryMax": 160000
      }
    }
  ]
}
```

### POST /api/saved-jobs
Save a job for later.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "jobId": "uuid"
}
```

**Response:**
```json
{
  "id": "uuid",
  "jobId": "uuid",
  "savedAt": "2024-01-15T10:00:00Z"
}
```

### DELETE /api/saved-jobs/:jobId
Remove a job from saved jobs.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "message": "Job removed from saved jobs"
}
```

## AI Chatbot

### POST /api/chatbot/message
Send a message to the AI career assistant.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "message": "I need help with my resume"
}
```

**Response:**
```json
{
  "id": "uuid",
  "text": "I'd be happy to help you with your resume! Here are some key tips...",
  "type": "career_advice",
  "data": null,
  "timestamp": "2024-01-15T10:00:00Z"
}
```

### GET /api/chatbot/history
Get chat message history.

**Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `limit` (number): Number of messages (default: 50)

**Response:**
```json
{
  "messages": [
    {
      "id": "uuid",
      "message": "I need help with my resume",
      "response": "I'd be happy to help you with your resume!...",
      "intentType": "RESUME_HELP",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

## Companies

### GET /api/companies
Get company listings.

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `industry` (string): Filter by industry
- `size` (string): Filter by company size

**Response:**
```json
{
  "companies": [
    {
      "id": "uuid",
      "name": "TechCorp Inc.",
      "description": "Leading technology company...",
      "logoUrl": "https://example.com/logo.png",
      "website": "https://techcorp.com",
      "industry": "Technology",
      "size": "large",
      "jobCount": 25
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### GET /api/companies/:id
Get detailed company information.

**Response:**
```json
{
  "id": "uuid",
  "name": "TechCorp Inc.",
  "description": "Leading technology company specializing in cloud solutions...",
  "logoUrl": "https://example.com/logo.png",
  "website": "https://techcorp.com",
  "industry": "Technology",
  "size": "large",
  "createdAt": "2024-01-15T10:00:00Z",
  "activeJobs": [
    {
      "id": "uuid",
      "title": "Senior Software Engineer",
      "location": "San Francisco, CA",
      "postedAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

## Error Responses

All API endpoints return consistent error responses:

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Invalid request parameters",
  "details": {
    "field": "email",
    "issue": "Invalid email format"
  }
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 429 Too Many Requests
```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded",
  "retryAfter": 60
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

## Rate Limiting

API endpoints are rate-limited to ensure fair usage:

- **Authentication endpoints**: 5 requests per minute
- **Search endpoints**: 100 requests per minute
- **User management**: 50 requests per minute
- **Chatbot**: 20 requests per minute

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642694400
```

## Webhooks

JobGenie supports webhooks for real-time notifications:

### Application Status Updates
```json
{
  "event": "application.status_changed",
  "data": {
    "applicationId": "uuid",
    "userId": "uuid",
    "jobId": "uuid",
    "oldStatus": "pending",
    "newStatus": "reviewed",
    "timestamp": "2024-01-15T10:00:00Z"
  }
}
```

### New Job Matches
```json
{
  "event": "job.match_found",
  "data": {
    "userId": "uuid",
    "jobId": "uuid",
    "matchScore": 0.92,
    "timestamp": "2024-01-15T10:00:00Z"
  }
}
```

## SDK and Libraries

### JavaScript/TypeScript SDK
```bash
npm install @jobgenie/sdk
```

```typescript
import { JobGenieClient } from '@jobgenie/sdk'

const client = new JobGenieClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://your-project.supabase.co'
})

// Search jobs
const jobs = await client.jobs.search({
  query: 'software engineer',
  location: 'San Francisco',
  remote: true
})

// Get recommendations
const recommendations = await client.jobs.getRecommendations()
```

## Changelog

### v1.0.0 (2024-01-15)
- Initial API release
- User authentication and management
- Job search and recommendations
- AI chatbot integration
- Application tracking
- Company information

---

**API Version**: 1.0  
**Last Updated**: January 2024  
**Support**: api-support@jobgenie.com