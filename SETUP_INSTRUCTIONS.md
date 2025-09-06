# Setup Instructions for Profile Integration

## Environment Setup

### 1. Create Environment File

Create a `.env` file in the root directory with the following content:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api
VITE_API_BASE=/api

# Development
VITE_DEV_MODE=true
```

### 2. Backend Server Setup

Make sure your Django backend server is running on `localhost:8000`. The profile API endpoints should be available at:

- `http://localhost:8000/api/user-profile/`
- `http://localhost:8000/api/user-groups/`
- `http://localhost:8000/api/user-roles/`
- etc.

### 3. Authentication

The profile API requires JWT authentication. Make sure you:

1. Log in through the login page first
2. The JWT token is stored in the auth store
3. The token is automatically included in API requests

## Troubleshooting

### Network Error (ERR_CONNECTION_REFUSED)

This error occurs when the backend server is not running. To fix:

1. **Start the Django backend server:**

   ```bash
   # Navigate to your Django project directory
   cd /path/to/your/django/project

   # Run the development server
   python manage.py runserver 8000
   ```

2. **Verify the server is running:**
   - Open `http://localhost:8000` in your browser
   - You should see your Django application

3. **Check API endpoints:**
   - Visit `http://localhost:8000/api/user-profile/` (you'll need to be authenticated)
   - Or check `http://localhost:8000/api/` for available endpoints

### Authentication Issues

If you're getting 401 Unauthorized errors:

1. **Make sure you're logged in:**
   - Go to the login page
   - Enter valid credentials
   - Check that the JWT token is stored in localStorage

2. **Check token validity:**
   - Open browser dev tools
   - Go to Application > Local Storage
   - Look for stored tokens

3. **Token refresh:**
   - The app should automatically refresh expired tokens
   - If not working, try logging out and logging back in

### API Base URL Issues

If the API calls are going to the wrong URL:

1. **Check environment variables:**
   - Make sure `.env` file exists
   - Verify `VITE_API_BASE_URL` is set correctly
   - Restart the development server after changing `.env`

2. **Alternative configuration:**
   - You can also set the API base URL in `src/lib/api.ts`
   - Change the `baseURL` in the axios.create() call

## Testing the Profile Integration

1. **Start the frontend:**

   ```bash
   npm run dev
   ```

2. **Start the backend:**

   ```bash
   # In your Django project directory
   python manage.py runserver 8000
   ```

3. **Test the integration:**
   - Go to the home page
   - Use the Profile API Demo section
   - Try the "Load Profile" button
   - Check the browser console for any errors

## API Endpoints

The profile integration uses these endpoints:

### User Profile

- `GET /api/user-profile/` - Get current user's profile
- `PATCH /api/user-profile/update/` - Update profile information
- `PATCH /api/user-profile/basic-info/` - Update basic user info
- `POST /api/user-profile/change-password/` - Change password
- `GET /api/user-profile/stats/` - Get profile statistics

### Groups & Roles

- `GET /api/user-groups/` - List available groups
- `GET /api/user-roles/` - List available roles
- `POST /api/user-profile/join-group/` - Join a group
- `POST /api/user-profile/leave-group/` - Leave a group

### Avatar Management

- `POST /api/user-profile/avatar/upload/` - Upload new avatar
- `DELETE /api/user-profile/avatar/delete/` - Delete current avatar
- `GET /api/user-profile/avatar/info/` - Get avatar information
- `POST /api/user-profile/avatar/set-existing/` - Set existing image as avatar

## Development Notes

- The profile store automatically handles authentication headers
- Error messages are displayed to users in a user-friendly way
- All API calls include proper error handling
- The demo component shows real-time API responses
- Internationalization is supported for all UI text
