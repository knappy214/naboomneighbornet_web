# Profile Integration Documentation

This document describes the user profile integration for the Naboom NeighborNet web application, built using Vue 3, TypeScript, and Vuetify 3.

## Overview

The profile integration provides a comprehensive user profile management system that connects to the Wagtail 7.1.1 API v2 backend. It includes user profile management, group memberships, avatar management, and settings.

## Components Created

### 1. Profile Store (`src/stores/profile.ts`)

A Pinia store that manages all profile-related state and API interactions:

- **State Management**: Profile data, groups, roles, stats, avatar info
- **API Integration**: All profile endpoints from the USER_PROFILE_API.md
- **Error Handling**: Comprehensive error handling and loading states
- **TypeScript Support**: Full type definitions for all data structures

### 2. Main Profile Page (`src/pages/Profile.vue`)

The main profile management interface with tabbed navigation:

- **Personal Information Tab**: Basic user info, medical information
- **Contact Information Tab**: Phone, address, location details
- **Emergency Information Tab**: Emergency contact details
- **Groups Tab**: Group membership management
- **Settings Tab**: Notification and security settings

### 3. Profile Tab Components

#### PersonalInfoTab (`src/components/profile/PersonalInfoTab.vue`)

- First name, last name, email
- Date of birth, gender
- Medical information (allergies, conditions, medications)
- Form validation and change detection

#### ContactInfoTab (`src/components/profile/ContactInfoTab.vue`)

- Phone number, timezone
- Address information (street, city, province, postal code)
- Form validation and change detection

#### EmergencyInfoTab (`src/components/profile/EmergencyInfoTab.vue`)

- Emergency contact name and phone
- Relationship to emergency contact
- Form validation and change detection

#### GroupsTab (`src/components/profile/GroupsTab.vue`)

- Display current group memberships
- Join new groups with role selection
- Leave existing groups
- Group and role management

#### SettingsTab (`src/components/profile/SettingsTab.vue`)

- Notification preferences (email, SMS)
- Security settings (MFA)
- Password change functionality
- Account information display

### 4. Dialog Components

#### AvatarDialog (`src/components/profile/AvatarDialog.vue`)

- Upload new avatar images
- Set existing images as avatar
- Delete current avatar
- File validation and size limits

#### ChangePasswordDialog (`src/components/profile/ChangePasswordDialog.vue`)

- Secure password change form
- Password strength indicator
- Current password verification
- Form validation

### 5. Demo Component (`src/components/ProfileDemo.vue`)

A demonstration component showing how to use the profile API:

- Interactive buttons to test API endpoints
- Real-time data display
- API response viewer
- Error handling demonstration

## API Integration

The profile system integrates with the following API endpoints:

### User Profile Management

- `GET /api/user-profile/` - Get current user's profile
- `PATCH /api/user-profile/update/` - Update profile information
- `PATCH /api/user-profile/basic-info/` - Update basic user info
- `POST /api/user-profile/change-password/` - Change password
- `GET /api/user-profile/stats/` - Get profile statistics

### Group Management

- `GET /api/user-groups/` - List available groups
- `GET /api/user-roles/` - List available roles
- `POST /api/user-profile/join-group/` - Join a group
- `POST /api/user-profile/leave-group/` - Leave a group

### Avatar Management

- `POST /api/user-profile/avatar/upload/` - Upload new avatar
- `DELETE /api/user-profile/avatar/delete/` - Delete current avatar
- `GET /api/user-profile/avatar/info/` - Get avatar information
- `POST /api/user-profile/avatar/set-existing/` - Set existing image as avatar

## Routing

The profile page is accessible at `/profile` and requires authentication:

```typescript
{
  path: 'profile',
  name: `profile-${locale}`,
  component: Profile,
  meta: {
    requiresAuth: true,
    locale,
    title: 'Profile',
    description: 'User profile management',
  },
}
```

## Internationalization

Full i18n support is provided for both English and Afrikaans:

- All UI text is translatable
- Form validation messages
- Error messages
- Success messages
- Placeholder text

## Usage Examples

### Basic Profile Loading

```typescript
import { useProfileStore } from '@/stores/profile'

const profileStore = useProfileStore()

// Load user profile
await profileStore.fetchProfile()

// Access profile data
console.log(profileStore.profile)
```

### Updating Profile

```typescript
// Update profile information
await profileStore.updateProfile({
  phone: '+1234567890',
  city: 'New City',
})

// Update basic info
await profileStore.updateBasicInfo({
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@example.com',
})
```

### Group Management

```typescript
// Join a group
await profileStore.joinGroup({
  group_id: 1,
  role_id: 1,
})

// Leave a group
await profileStore.leaveGroup({
  group_id: 1,
})
```

### Avatar Management

```typescript
// Upload new avatar
const file = await profileStore.uploadAvatar(file) // File from input

// Delete avatar
await profileStore.deleteAvatar()

// Set existing image as avatar
await profileStore.setExistingAvatar(imageId)
```

## Error Handling

The profile system includes comprehensive error handling:

- API errors are caught and displayed to users
- Form validation errors are shown inline
- Loading states prevent multiple simultaneous requests
- Error messages are internationalized

## Security Considerations

- All API requests require JWT authentication
- Password changes require current password verification
- File uploads are validated for type and size
- User data is isolated (users can only access their own data)

## Testing

The ProfileDemo component provides an interactive way to test all profile functionality:

1. Navigate to the home page
2. Use the demo buttons to test API endpoints
3. View real-time data and API responses
4. Test error handling scenarios

## Future Enhancements

Potential future enhancements include:

- Profile completion progress tracking
- Advanced avatar editing tools
- Bulk group operations
- Profile export/import functionality
- Advanced notification preferences
- Profile analytics and insights

## Dependencies

The profile system requires:

- Vue 3 with Composition API
- Pinia for state management
- Vuetify 3 for UI components
- Vue Router for navigation
- Vue i18n for internationalization
- Axios for API requests

## File Structure

```
src/
├── stores/
│   └── profile.ts                 # Profile store
├── pages/
│   └── Profile.vue               # Main profile page
├── components/
│   └── profile/
│       ├── PersonalInfoTab.vue   # Personal info tab
│       ├── ContactInfoTab.vue    # Contact info tab
│       ├── EmergencyInfoTab.vue  # Emergency info tab
│       ├── GroupsTab.vue         # Groups management tab
│       ├── SettingsTab.vue       # Settings tab
│       ├── AvatarDialog.vue      # Avatar management dialog
│       └── ChangePasswordDialog.vue # Password change dialog
└── locales/
    ├── en.json                   # English translations
    └── af.json                   # Afrikaans translations
```
