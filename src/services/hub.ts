import api from '@/lib/api'
import * as communityHubAPI from './communityHub'
import type {
  HubChannel,
  HubThread,
  HubPost,
  ThreadSearchResponse,
  PostComposerPayload,
} from '@/types/hub'

const channelFallback: HubChannel[] = [
  {
    id: 'general',
    name: 'General',
    description: 'Community-wide announcements and updates',
    unreadCount: 2,
    lastActivity: new Date().toISOString(),
    memberCount: 128,
    isMuted: false,
  },
  {
    id: 'safety',
    name: 'Safety & Alerts',
    description: 'Urgent notices and safety coordination',
    unreadCount: 0,
    lastActivity: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    memberCount: 98,
    isMuted: false,
  },
]

const mapChannel = (payload: any): HubChannel => ({
  id: String(payload.id ?? payload.slug ?? payload.name ?? crypto.randomUUID()),
  name: payload.name ?? 'Channel',
  description: payload.description ?? '',
  unreadCount: Number(payload.unread_count ?? 0),
  lastActivity: payload.last_activity ?? null,
  memberCount: Number(payload.member_count ?? 0),
  isMuted: Boolean(payload.is_muted ?? false),
})

const mapThread = (channelId: string, payload: any): HubThread => ({
  id: String(payload.id ?? payload.slug ?? crypto.randomUUID()),
  channelId,
  title: payload.title ?? 'Untitled Thread',
  author: payload.author ?? 'Community Bot',
  createdAt: payload.created_at ?? new Date().toISOString(),
  updatedAt: payload.updated_at ?? payload.created_at ?? new Date().toISOString(),
  replyCount: Number(payload.reply_count ?? payload.posts_count ?? 0),
  lastReplySnippet: payload.last_reply_snippet ?? payload.preview ?? '',
  pinned: Boolean(payload.pinned ?? false),
  searchRank: payload.rank ? Number(payload.rank) : undefined,
})

const mapPost = (threadId: string, payload: any): HubPost => ({
  id: String(payload.id ?? crypto.randomUUID()),
  threadId,
  author: payload.author ?? 'Community Bot',
  createdAt: payload.created_at ?? new Date().toISOString(),
  body: payload.body ?? payload.content ?? '',
  optimistic: Boolean(payload.optimistic ?? false),
})

export async function fetchChannels(): Promise<HubChannel[]> {
  try {
    const channels = await communityHubAPI.getChannels()
    return channels.map(mapChannel)
  } catch (error) {
    console.warn('Falling back to static channels', error)
    return channelFallback
  }
}

export async function fetchThreads(channelId: string): Promise<HubThread[]> {
  try {
    const threads = await communityHubAPI.getThreads({ channel: parseInt(channelId) })
    return threads.map((item) => mapThread(channelId, item))
  } catch (error) {
    console.warn('Failed to load threads, using fallback', error)
  }

  return [
    mapThread(channelId, {
      id: 'welcome',
      title: 'Welcome to the community hub',
      author: 'System',
      reply_count: 3,
      last_reply_snippet: 'Introduce yourself and share how you help keep the community safe.',
    }),
  ]
}

export async function searchThreads(
  channelId: string,
  query: string,
  signal?: AbortSignal,
): Promise<ThreadSearchResponse> {
  try {
    const threads = await communityHubAPI.searchThreads(query, parseInt(channelId))
    const results = threads.map((item) => mapThread(channelId, item))

    return {
      results,
      total: results.length,
    }
  } catch (error) {
    if ((error as Error).name === 'CanceledError' || (error as Error).name === 'AbortError') {
      return { results: [], total: 0 }
    }
    console.warn('Thread search failed', error)
    return { results: [], total: 0 }
  }
}

export async function fetchThreadPosts(threadId: string): Promise<HubPost[]> {
  try {
    const posts = await communityHubAPI.getPosts({ thread: parseInt(threadId) })
    return posts.map((item) => mapPost(threadId, item))
  } catch (error) {
    console.warn('Falling back to demo posts', error)
  }

  return [
    mapPost(threadId, {
      id: 'intro',
      author: 'System',
      body: 'This is the beginning of a new thread. Start the conversation by replying below.',
    }),
  ]
}

export async function createPost(threadId: string, payload: PostComposerPayload): Promise<HubPost> {
  try {
    const post = await communityHubAPI.createPost({
      content: payload.body,
      thread: parseInt(threadId),
      channel: 1, // This should be passed as a parameter
    })
    return mapPost(threadId, post)
  } catch (error) {
    console.warn('Post creation failed, returning optimistic copy', error)
    return mapPost(threadId, {
      id: crypto.randomUUID(),
      author: 'You',
      body: payload.body,
      optimistic: true,
    })
  }
}

export async function registerPushSubscription(subscription: PushSubscription) {
  try {
    await communityHubAPI.registerDevice({
      device_id: subscription.endpoint,
      platform: 'web',
      push_token: subscription.endpoint,
      is_active: true,
    })
  } catch (error) {
    console.warn('Failed to register push subscription', error)
  }
}

export async function unregisterPushSubscription(subscription: PushSubscription) {
  try {
    // Note: The API doesn't have a direct unregister endpoint,
    // but we could implement it by setting is_active to false
    console.warn('Unregister push subscription not implemented in API')
  } catch (error) {
    console.warn('Failed to unregister push subscription', error)
  }
}
