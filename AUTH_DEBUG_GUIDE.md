# 🔐 Authentication Debugging Guide

This guide will help you debug authentication issues in your frontend application.

## 🚀 Quick Start

1. **Open your browser** and go to `http://localhost:5173`
2. **Open Developer Tools** (F12)
3. **Go to Console tab**
4. **Run the debugging commands** listed below

## 🛠️ Available Debug Commands

### 1. Check Authentication Status

```javascript
authDebug.logAuthStatus()
```

This will show you:

- Whether you have access and refresh tokens
- Token validity and expiration status
- Local storage contents
- Detailed token information

### 2. Test API Authentication

```javascript
authDebug.testAPIAuth()
```

This will:

- Make a test request to `/api/v2/user-profiles/`
- Show if authentication is working
- Display any error messages

### 3. Clear All Authentication Data

```javascript
authDebug.clearAuth()
```

This will:

- Clear all tokens from the store
- Clear all tokens from localStorage
- Reset authentication state

### 4. Network Request Debugging Guide

```javascript
authDebug.checkNetworkRequests()
```

This will show you how to debug network requests in DevTools.

## 🔍 Step-by-Step Debugging Process

### Step 1: Check Token Storage

```javascript
// Check what's stored in localStorage
console.log('Access token:', localStorage.getItem('accessToken'))
console.log('Refresh token:', localStorage.getItem('refreshToken'))

// Check what's in the auth store
const authStore = useAuthStore()
console.log('Store access token:', authStore.accessToken)
console.log('Store refresh token:', authStore.refreshToken)
```

### Step 2: Check Token Validity

```javascript
// Decode JWT token to check expiration
const token = localStorage.getItem('accessToken')
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]))
  console.log('Token expires at:', new Date(payload.exp * 1000))
  console.log('Current time:', new Date())
  console.log('Token expired:', new Date() > new Date(payload.exp * 1000))
}
```

### Step 3: Check Network Requests

1. Open **Chrome DevTools** (F12)
2. Go to **Network** tab
3. Look for requests to:
   - `/api/v2/user-profiles/`
   - `/api/auth/jwt/refresh/`
4. Check the **Request Headers** for:
   - `Authorization: Bearer <token>`
5. Check the **Response** for error details

### Step 4: Test Authentication Flow

1. **Login** using the login form
2. **Check tokens** are stored correctly
3. **Make API requests** and verify headers
4. **Test token refresh** by waiting for expiration

## 🎯 Common Issues and Solutions

### Issue 1: "No auth token available"

**Symptoms:** Console shows "API Request - No auth token available"
**Solution:**

1. Check if you're logged in
2. Clear auth data and login again
3. Check if tokens are being stored correctly

### Issue 2: "401 Unauthorized"

**Symptoms:** API requests return 401 status
**Solution:**

1. Check if token is expired
2. Verify token format is correct
3. Check if refresh token is working

### Issue 3: "Token refresh failed"

**Symptoms:** Console shows refresh token errors
**Solution:**

1. Check if refresh token is valid
2. Verify refresh endpoint is working
3. Clear auth data and login again

### Issue 4: "Invalid JWT format"

**Symptoms:** Token decoding fails
**Solution:**

1. Check if token is complete
2. Verify token wasn't corrupted
3. Clear auth data and login again

## 🔧 Debug Panel in UI

The application now includes a **Debug Panel** that appears on the dashboard in development mode. This panel provides:

- **Visual token status** with color-coded indicators
- **Token expiration** information
- **One-click testing** of API authentication
- **Quick auth clearing** functionality
- **Detailed error messages**

## 📊 API Configuration

Your API is configured with:

- **Base URL:** `/api/v2` (configurable via environment variables)
- **Authentication:** JWT Bearer tokens
- **Auto-refresh:** Enabled for expired tokens
- **Debug logging:** Enabled for all requests

## 🌐 Environment Variables

Check these environment variables:

- `VITE_API_V2_BASE` - Primary API base URL
- `VITE_API_BASE_URL` - Fallback API base URL
- `VITE_API_BASE` - Fallback API base URL

## 🚨 Emergency Reset

If everything is broken:

```javascript
// Clear everything and start fresh
authDebug.clearAuth()
localStorage.clear()
// Then refresh the page and login again
```

## 📝 Debug Checklist

- [ ] Tokens are present in localStorage
- [ ] Tokens are valid and not expired
- [ ] Authorization header is included in requests
- [ ] API endpoints are reachable
- [ ] Refresh token mechanism is working
- [ ] No CORS issues
- [ ] Backend is running and accessible

## 🆘 Getting Help

If you're still having issues:

1. **Check the browser console** for error messages
2. **Check the Network tab** for failed requests
3. **Use the debug panel** in the UI
4. **Run the debug commands** in the console
5. **Check the backend logs** for server-side errors

---

**Happy Debugging! 🐛✨**
