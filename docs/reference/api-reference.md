# API Reference

This document provides comprehensive API documentation for the Naboom NeighborNet Community Communication Hub backend services.

## Base URL

```
Production: https://api.naboomneighbornet.com/v1
Development: http://localhost:8000/api/v1
```

## Authentication

All API endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### Token Types

- **Access Token**: Short-lived token for API requests (15 minutes)
- **Refresh Token**: Long-lived token for obtaining new access tokens (7 days)

## Rate Limiting

API requests are rate-limited to prevent abuse:

- **General Endpoints**: 100 requests per minute per user
- **Authentication**: 5 requests per minute per IP
- **File Upload**: 10 requests per minute per user
- **Search**: 50 requests per minute per user

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "email": ["This field is required"],
      "password": ["Password must be at least 8 characters"]
    }
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `AUTHENTICATION_REQUIRED` | 401 | Authentication required |
| `INVALID_CREDENTIALS` | 401 | Invalid login credentials |
| `TOKEN_EXPIRED` | 401 | JWT token has expired |
| `PERMISSION_DENIED` | 403 | Insufficient permissions |
| `RESOURCE_NOT_FOUND` | 404 | Requested resource not found |
| `RATE_LIMIT_EXCEEDED` | 429 | Rate limit exceeded |
| `INTERNAL_SERVER_ERROR` | 500 | Internal server error |

## Authentication Endpoints

### Register User

```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "confirm_password": "securepassword123",
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "+27123456789"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone_number": "+27123456789",
    "is_verified": false,
    "created_at": "2024-01-01T00:00:00Z"
  },
  "message": "Registration successful. Please check your email for verification."
}
```

### Login User

```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "is_verified": true
  }
}
```

### Refresh Token

```http
POST /auth/refresh
```

**Request Body:**
```json
{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### Logout

```http
POST /auth/logout
```

**Response:**
```json
{
  "message": "Successfully logged out"
}
```

## User Profile Endpoints

### Get User Profile

```http
GET /users/profile
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "display_name": "John Doe",
  "bio": "Community safety advocate",
  "phone_number": "+27123456789",
  "avatar_url": "https://api.naboomneighbornet.com/media/avatars/user.jpg",
  "is_verified": true,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Update User Profile

```http
PUT /users/profile
```

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "display_name": "John Doe",
  "bio": "Community safety advocate",
  "phone_number": "+27123456789"
}
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "display_name": "John Doe",
  "bio": "Community safety advocate",
  "phone_number": "+27123456789",
  "avatar_url": "https://api.naboomneighbornet.com/media/avatars/user.jpg",
  "is_verified": true,
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Upload Avatar

```http
POST /users/profile/avatar
```

**Request Body:** `multipart/form-data`
- `avatar`: Image file (JPEG, PNG, WebP, max 5MB)

**Response:**
```json
{
  "avatar_url": "https://api.naboomneighbornet.com/media/avatars/user.jpg",
  "message": "Avatar uploaded successfully"
}
```

## Community Endpoints

### List Communities

```http
GET /communities
```

**Query Parameters:**
- `search`: Search term for community name
- `category`: Filter by category (residential, business, special_interest, geographic)
- `page`: Page number (default: 1)
- `page_size`: Items per page (default: 20, max: 100)

**Response:**
```json
{
  "count": 25,
  "next": "https://api.naboomneighbornet.com/v1/communities?page=2",
  "previous": null,
  "results": [
    {
      "id": "uuid",
      "name": "Sunset Ridge Estate",
      "description": "A secure residential community in Cape Town",
      "category": "residential",
      "member_count": 150,
      "is_public": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Get Community Details

```http
GET /communities/{community_id}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Sunset Ridge Estate",
  "description": "A secure residential community in Cape Town",
  "category": "residential",
  "member_count": 150,
  "is_public": true,
  "channels": [
    {
      "id": "uuid",
      "name": "general",
      "display_name": "General",
      "description": "General community discussions",
      "is_private": false
    }
  ],
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Join Community

```http
POST /communities/{community_id}/join
```

**Response:**
```json
{
  "message": "Join request submitted. Waiting for approval.",
  "status": "pending"
}
```

### Leave Community

```http
POST /communities/{community_id}/leave
```

**Response:**
```json
{
  "message": "Successfully left the community"
}
```

## Message Endpoints

### Get Channel Messages

```http
GET /communities/{community_id}/channels/{channel_id}/messages
```

**Query Parameters:**
- `before`: Get messages before this message ID
- `after`: Get messages after this message ID
- `limit`: Number of messages to return (default: 50, max: 100)

**Response:**
```json
{
  "messages": [
    {
      "id": "uuid",
      "content": "Hello everyone! Welcome to the community.",
      "author": {
        "id": "uuid",
        "display_name": "John Doe",
        "avatar_url": "https://api.naboomneighbornet.com/media/avatars/user.jpg"
      },
      "channel_id": "uuid",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "attachments": [],
      "reactions": []
    }
  ],
  "has_more": true
}
```

### Send Message

```http
POST /communities/{community_id}/channels/{channel_id}/messages
```

**Request Body:**
```json
{
  "content": "Hello everyone! Welcome to the community.",
  "attachments": [
    {
      "type": "image",
      "url": "https://api.naboomneighbornet.com/media/uploads/image.jpg"
    }
  ]
}
```

**Response:**
```json
{
  "id": "uuid",
  "content": "Hello everyone! Welcome to the community.",
  "author": {
    "id": "uuid",
    "display_name": "John Doe",
    "avatar_url": "https://api.naboomneighbornet.com/media/avatars/user.jpg"
  },
  "channel_id": "uuid",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z",
  "attachments": [],
  "reactions": []
}
```

### Update Message

```http
PUT /communities/{community_id}/channels/{channel_id}/messages/{message_id}
```

**Request Body:**
```json
{
  "content": "Updated message content"
}
```

**Response:**
```json
{
  "id": "uuid",
  "content": "Updated message content",
  "author": {
    "id": "uuid",
    "display_name": "John Doe",
    "avatar_url": "https://api.naboomneighbornet.com/media/avatars/user.jpg"
  },
  "channel_id": "uuid",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z",
  "attachments": [],
  "reactions": []
}
```

### Delete Message

```http
DELETE /communities/{community_id}/channels/{channel_id}/messages/{message_id}
```

**Response:**
```json
{
  "message": "Message deleted successfully"
}
```

## Event Endpoints

### List Events

```http
GET /communities/{community_id}/events
```

**Query Parameters:**
- `status`: Filter by status (upcoming, ongoing, past)
- `category`: Filter by category
- `date_from`: Filter events from this date
- `date_to`: Filter events to this date
- `page`: Page number
- `page_size`: Items per page

**Response:**
```json
{
  "count": 10,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "uuid",
      "title": "Community Safety Meeting",
      "description": "Monthly community safety meeting",
      "date": "2024-01-15",
      "time": "19:00:00",
      "location": "Community Center",
      "category": "meeting",
      "organizer": {
        "id": "uuid",
        "display_name": "John Doe"
      },
      "attendee_count": 25,
      "max_attendees": 50,
      "is_public": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Create Event

```http
POST /communities/{community_id}/events
```

**Request Body:**
```json
{
  "title": "Community Safety Meeting",
  "description": "Monthly community safety meeting",
  "date": "2024-01-15",
  "time": "19:00:00",
  "location": "Community Center",
  "category": "meeting",
  "max_attendees": 50,
  "is_public": true
}
```

**Response:**
```json
{
  "id": "uuid",
  "title": "Community Safety Meeting",
  "description": "Monthly community safety meeting",
  "date": "2024-01-15",
  "time": "19:00:00",
  "location": "Community Center",
  "category": "meeting",
  "organizer": {
    "id": "uuid",
    "display_name": "John Doe"
  },
  "attendee_count": 0,
  "max_attendees": 50,
  "is_public": true,
  "created_at": "2024-01-01T00:00:00Z"
}
```

### RSVP to Event

```http
POST /communities/{community_id}/events/{event_id}/rsvp
```

**Request Body:**
```json
{
  "status": "attending"
}
```

**Response:**
```json
{
  "message": "RSVP updated successfully",
  "status": "attending"
}
```

## Search Endpoints

### Search Messages

```http
GET /search/messages
```

**Query Parameters:**
- `q`: Search query
- `community_id`: Search within specific community
- `channel_id`: Search within specific channel
- `date_from`: Search from this date
- `date_to`: Search to this date
- `page`: Page number
- `page_size`: Items per page

**Response:**
```json
{
  "count": 15,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "uuid",
      "content": "Found message content",
      "author": {
        "id": "uuid",
        "display_name": "John Doe"
      },
      "channel": {
        "id": "uuid",
        "name": "general",
        "display_name": "General"
      },
      "community": {
        "id": "uuid",
        "name": "Sunset Ridge Estate"
      },
      "created_at": "2024-01-01T00:00:00Z",
      "highlight": "Found <mark>message</mark> content"
    }
  ]
}
```

## File Upload Endpoints

### Upload File

```http
POST /files/upload
```

**Request Body:** `multipart/form-data`
- `file`: File to upload
- `type`: File type (image, document, other)

**Response:**
```json
{
  "id": "uuid",
  "filename": "document.pdf",
  "url": "https://api.naboomneighbornet.com/media/uploads/document.pdf",
  "size": 1024000,
  "type": "document",
  "uploaded_at": "2024-01-01T00:00:00Z"
}
```

## WebSocket Events

The application uses WebSocket for real-time communication. Connect to:

```
wss://api.naboomneighbornet.com/ws/
```

### Authentication

Send authentication message after connecting:

```json
{
  "type": "auth",
  "token": "your-jwt-token"
}
```

### Message Events

#### New Message
```json
{
  "type": "message.new",
  "data": {
    "id": "uuid",
    "content": "New message content",
    "author": {
      "id": "uuid",
      "display_name": "John Doe"
    },
    "channel_id": "uuid",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### Message Updated
```json
{
  "type": "message.updated",
  "data": {
    "id": "uuid",
    "content": "Updated message content",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

#### Message Deleted
```json
{
  "type": "message.deleted",
  "data": {
    "id": "uuid",
    "deleted_at": "2024-01-01T00:00:00Z"
  }
}
```

#### Typing Indicator
```json
{
  "type": "typing.start",
  "data": {
    "user_id": "uuid",
    "channel_id": "uuid",
    "display_name": "John Doe"
  }
}
```

#### User Presence
```json
{
  "type": "presence.update",
  "data": {
    "user_id": "uuid",
    "status": "online",
    "last_seen": "2024-01-01T00:00:00Z"
  }
}
```

## SDKs and Libraries

### JavaScript/TypeScript

```bash
npm install @naboomneighbornet/api-client
```

```typescript
import { NaboomClient } from '@naboomneighbornet/api-client';

const client = new NaboomClient({
  baseURL: 'https://api.naboomneighbornet.com/v1',
  token: 'your-jwt-token'
});

// Send a message
const message = await client.messages.send({
  communityId: 'uuid',
  channelId: 'uuid',
  content: 'Hello world!'
});
```

### Python

```bash
pip install naboomneighbornet-api
```

```python
from naboomneighbornet import NaboomClient

client = NaboomClient(
    base_url='https://api.naboomneighbornet.com/v1',
    token='your-jwt-token'
)

# Send a message
message = client.messages.send(
    community_id='uuid',
    channel_id='uuid',
    content='Hello world!'
)
```

## Testing

### Test Environment

Use the test environment for development and testing:

```
Base URL: https://test-api.naboomneighbornet.com/v1
```

### Test Data

The test environment includes sample data:
- Test communities
- Sample users
- Mock messages and events

### API Testing Tools

- **Postman Collection**: [Download](https://api.naboomneighbornet.com/docs/postman-collection.json)
- **OpenAPI Specification**: [View](https://api.naboomneighbornet.com/docs/openapi.json)
- **Interactive Documentation**: [Try it out](https://api.naboomneighbornet.com/docs/)

## Changelog

### Version 1.0.0 (2024-01-01)
- Initial API release
- Authentication endpoints
- User profile management
- Community and messaging features
- Event management
- Search functionality
- File upload support
- WebSocket real-time communication

---

For more information, visit our [API Documentation](https://api.naboomneighbornet.com/docs/) or contact our [Developer Support](mailto:developers@naboomneighbornet.com).
