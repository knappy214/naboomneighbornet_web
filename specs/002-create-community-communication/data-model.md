# Data Model: Community Communication Hub

**Feature**: Community Communication Hub  
**Date**: 2025-01-27  
**Phase**: 1 - Design & Contracts

## Entity Overview

The Community Communication Hub data model defines the core entities for real-time messaging, event management, user profiles, and multilingual support within the Naboom Platform.

## Core Entities

### Channel

Represents a discussion channel with organized communication threads.

```typescript
interface Channel {
  id: string;
  name: string;
  description: string;
  type: 'general' | 'safety' | 'events';
  members: string[]; // User IDs
  moderators: string[]; // User IDs
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  settings: ChannelSettings;
}

interface ChannelSettings {
  allowReactions: boolean;
  allowThreads: boolean;
  allowFileUploads: boolean;
  maxMessageLength: number;
  rateLimitPerMinute: number;
}
```

**Validation Rules**:
- `name`: Required, 3-50 characters, alphanumeric with spaces
- `description`: Optional, max 200 characters
- `type`: Must be one of the predefined channel types
- `members`: Array of valid user IDs
- `moderators`: Subset of members array

### Message

Represents a communication message within a channel.

```typescript
interface Message {
  id: string;
  channelId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'event' | 'system';
  timestamp: Date;
  editedAt?: Date;
  replyToId?: string; // For threaded replies
  reactions: MessageReaction[];
  attachments: MessageAttachment[];
  metadata: MessageMetadata;
  status: 'sent' | 'delivered' | 'read' | 'failed' | 'pending';
}

interface MessageReaction {
  emoji: string;
  userId: string;
  timestamp: Date;
}

interface MessageAttachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
}

interface MessageMetadata {
  isEdited: boolean;
  editCount: number;
  isPinned: boolean;
  isDeleted: boolean;
  deleteReason?: string;
}
```

**Validation Rules**:
- `content`: Required, max 5000 characters, sanitized HTML
- `type`: Must be one of the predefined message types
- `attachments`: Max 10MB total, supported file types only
- `reactions`: Max 50 reactions per message

### UserProfile

Extended user profile for communication context and role management.

```typescript
interface UserProfile {
  id: string;
  userId: string; // Reference to auth user
  displayName: string;
  avatar?: string;
  role: 'member' | 'moderator' | 'admin' | 'supervisor';
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen: Date;
  preferences: UserPreferences;
  activity: UserActivity;
  permissions: UserPermissions;
  language: 'en' | 'af';
  timezone: string;
}

interface UserPreferences {
  notifications: NotificationSettings;
  theme: 'light' | 'business';
  messageDisplay: 'compact' | 'comfortable';
  showTypingIndicators: boolean;
  showPresenceStatus: boolean;
  autoMarkAsRead: boolean;
}

interface NotificationSettings {
  newMessages: boolean;
  mentions: boolean;
  reactions: boolean;
  events: boolean;
  systemUpdates: boolean;
  emailDigest: boolean;
  pushNotifications: boolean;
}

interface UserActivity {
  totalMessages: number;
  channelsJoined: number;
  eventsCreated: number;
  lastActivity: Date;
  joinDate: Date;
}

interface UserPermissions {
  canCreateChannels: boolean;
  canModerateChannels: boolean;
  canCreateEvents: boolean;
  canManageUsers: boolean;
  canAccessAdminPanel: boolean;
}
```

**Validation Rules**:
- `displayName`: Required, 2-50 characters, no special characters
- `role`: Must be one of the predefined roles
- `language`: Must be 'en' or 'af'
- `timezone`: Valid IANA timezone identifier

### Event

Represents a community event with coordination and discussion capabilities.

```typescript
interface Event {
  id: string;
  title: string;
  description: string;
  organizerId: string;
  startDate: Date;
  endDate: Date;
  location: EventLocation;
  attendees: EventAttendee[];
  maxAttendees?: number;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  visibility: 'public' | 'members' | 'private';
  category: 'meeting' | 'social' | 'safety' | 'emergency' | 'other';
  tags: string[];
  discussionThreadId?: string;
  reminders: EventReminder[];
  createdAt: Date;
  updatedAt: Date;
}

interface EventLocation {
  name: string;
  address?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  isVirtual: boolean;
  meetingLink?: string;
}

interface EventAttendee {
  userId: string;
  status: 'invited' | 'attending' | 'declined' | 'maybe';
  rsvpDate: Date;
  comment?: string;
}

interface EventReminder {
  id: string;
  type: 'email' | 'push' | 'sms';
  triggerTime: Date;
  message: string;
  sent: boolean;
}
```

**Validation Rules**:
- `title`: Required, 3-100 characters
- `startDate`: Must be in the future
- `endDate`: Must be after startDate
- `maxAttendees`: Must be positive integer if specified
- `tags`: Max 10 tags, each max 20 characters

### Notification

Real-time alerts for communication events and system updates.

```typescript
interface Notification {
  id: string;
  userId: string;
  type: 'message' | 'mention' | 'reaction' | 'event' | 'system';
  title: string;
  content: string;
  data: NotificationData;
  isRead: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  createdAt: Date;
  expiresAt?: Date;
  actions: NotificationAction[];
}

interface NotificationData {
  channelId?: string;
  messageId?: string;
  eventId?: string;
  senderId?: string;
  metadata?: Record<string, any>;
}

interface NotificationAction {
  id: string;
  label: string;
  action: 'view' | 'reply' | 'rsvp' | 'dismiss';
  url?: string;
  data?: Record<string, any>;
}
```

**Validation Rules**:
- `title`: Required, max 100 characters
- `content`: Required, max 500 characters
- `priority`: Must be one of the predefined priorities
- `actions`: Max 5 actions per notification

### TypingIndicator

Real-time status showing users currently composing messages.

```typescript
interface TypingIndicator {
  channelId: string;
  userId: string;
  displayName: string;
  startedAt: Date;
  lastActivity: Date;
  isActive: boolean;
}
```

**Validation Rules**:
- `startedAt`: Must be current timestamp
- `lastActivity`: Must be within last 30 seconds for active status

### PresenceStatus

User availability status with real-time updates.

```typescript
interface PresenceStatus {
  userId: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen: Date;
  customMessage?: string;
  isTyping: boolean;
  currentChannel?: string;
}
```

**Validation Rules**:
- `status`: Must be one of the predefined statuses
- `lastSeen`: Must be current timestamp
- `customMessage`: Max 100 characters if provided

## Relationships

### Channel ↔ Message (One-to-Many)
- A channel can have many messages
- Each message belongs to exactly one channel
- Cascade delete: When channel is deleted, all messages are archived

### User ↔ Message (One-to-Many)
- A user can send many messages
- Each message has exactly one sender
- Soft delete: User deletion preserves message history

### Channel ↔ User (Many-to-Many)
- A channel can have many members
- A user can be a member of many channels
- Junction table: `channel_members` with role information

### Event ↔ User (Many-to-Many)
- An event can have many attendees
- A user can attend many events
- Junction table: `event_attendees` with RSVP status

### Message ↔ Message (One-to-Many, Self-Reference)
- A message can have many replies
- Each reply belongs to exactly one parent message
- Thread depth limit: Maximum 5 levels deep

## State Transitions

### Message Status Flow
```
pending → sent → delivered → read
   ↓        ↓
 failed ← retry
```

### Event Status Flow
```
draft → published → completed
  ↓         ↓
cancelled ←
```

### User Presence Flow
```
offline → online → away → busy → offline
   ↑        ↓        ↓      ↓
   ←--------←--------←------←
```

## Data Validation Schemas

### Zod Validation Schemas

```typescript
import { z } from 'zod';

export const ChannelSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(3).max(50).regex(/^[a-zA-Z0-9\s]+$/),
  description: z.string().max(200).optional(),
  type: z.enum(['general', 'safety', 'events']),
  members: z.array(z.string().uuid()),
  moderators: z.array(z.string().uuid()),
  createdAt: z.date(),
  updatedAt: z.date(),
  isActive: z.boolean(),
  settings: ChannelSettingsSchema
});

export const MessageSchema = z.object({
  id: z.string().uuid(),
  channelId: z.string().uuid(),
  senderId: z.string().uuid(),
  content: z.string().min(1).max(5000),
  type: z.enum(['text', 'image', 'file', 'event', 'system']),
  timestamp: z.date(),
  editedAt: z.date().optional(),
  replyToId: z.string().uuid().optional(),
  reactions: z.array(MessageReactionSchema),
  attachments: z.array(MessageAttachmentSchema),
  metadata: MessageMetadataSchema,
  status: z.enum(['sent', 'delivered', 'read', 'failed', 'pending'])
});

export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  displayName: z.string().min(2).max(50).regex(/^[a-zA-Z0-9\s\-_]+$/),
  avatar: z.string().url().optional(),
  role: z.enum(['member', 'moderator', 'admin', 'supervisor']),
  status: z.enum(['online', 'away', 'busy', 'offline']),
  lastSeen: z.date(),
  preferences: UserPreferencesSchema,
  activity: UserActivitySchema,
  permissions: UserPermissionsSchema,
  language: z.enum(['en', 'af']),
  timezone: z.string().regex(/^[A-Za-z_]+\/[A-Za-z_]+$/)
});
```

## Data Integrity Constraints

### Business Rules

1. **Channel Membership**: Users can only send messages to channels they are members of
2. **Message Ownership**: Users can only edit/delete their own messages (except moderators)
3. **Event Participation**: Users can only RSVP to events they are invited to
4. **Role Hierarchy**: Admin > Supervisor > Moderator > Member
5. **Message Threading**: Maximum thread depth of 5 levels
6. **File Attachments**: Maximum 10MB per message, 5 attachments per message
7. **Rate Limiting**: Maximum 10 messages per minute per user
8. **Presence Timeout**: Users marked offline after 5 minutes of inactivity

### Referential Integrity

- All foreign key references must exist in their respective tables
- Cascade deletes are handled at the application level, not database level
- Soft deletes are used for user data to preserve message history
- Hard deletes are used for temporary data (typing indicators, presence status)

## Performance Considerations

### Indexing Strategy

- Primary keys on all entity IDs
- Composite indexes on frequently queried fields
- Partial indexes on active/visible records only
- Full-text search indexes on message content

### Caching Strategy

- Redis for real-time data (presence, typing indicators)
- Browser cache for static assets and translations
- Service Worker cache for offline message queuing
- CDN for file attachments and avatars

### Data Archiving

- Messages older than 90 days are archived to cold storage
- User activity data is aggregated monthly
- Event data is archived after completion + 1 year
- Notification data is purged after 30 days

## Security Considerations

### Data Encryption

- Sensitive profile data encrypted at rest
- Message content encrypted in transit (WSS)
- Local storage data encrypted with user-specific keys
- File attachments encrypted with unique keys

### Access Control

- Role-based permissions for all operations
- Channel-level access control
- Event visibility controls
- Message-level permissions for sensitive content

### Audit Logging

- All message operations logged with timestamps
- User role changes tracked
- Channel modifications audited
- Event creation and updates logged
