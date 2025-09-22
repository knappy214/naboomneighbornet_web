import { computed, reactive } from 'vue'

export type ToastVariant = 'info' | 'success' | 'warning' | 'error'

export interface ToastAction {
  label: string
  handler: () => void
}

export interface ToastOptions {
  id?: string
  title?: string
  message: string
  variant?: ToastVariant
  duration?: number | null
  action?: ToastAction
}

export interface Toast {
  id: string
  title: string
  message: string
  variant: ToastVariant
  action?: ToastAction
  duration: number | null
}

const toasts = reactive(new Map<string, Toast>())
const timeouts = new Map<string, ReturnType<typeof setTimeout>>()

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return Math.random().toString(36).slice(2, 10)
}

function scheduleRemoval(id: string, duration: number | null): void {
  if (duration === null) {
    return
  }

  const timeoutHandle = timeouts.get(id)
  if (timeoutHandle) {
    clearTimeout(timeoutHandle)
  }

  const timeoutId = setTimeout(() => dismiss(id), duration)
  timeouts.set(id, timeoutId)
}

export function push(options: ToastOptions): string {
  const id = options.id ?? createId()

  const toast: Toast = {
    id,
    title: options.title ?? '',
    message: options.message,
    variant: options.variant ?? 'info',
    action: options.action,
    duration: options.duration ?? 6000,
  }

  toasts.set(id, toast)
  scheduleRemoval(id, toast.duration)
  return id
}

export function dismiss(id: string): void {
  const timeoutHandle = timeouts.get(id)
  if (timeoutHandle) {
    clearTimeout(timeoutHandle)
  }
  timeouts.delete(id)
  toasts.delete(id)
}

export function clear(): void {
  for (const id of Array.from(toasts.keys())) {
    dismiss(id)
  }
  toasts.clear()
}

export function useToasts() {
  return {
    toasts: computed(() => Array.from(toasts.values())),
    push,
    dismiss,
    clear,
  }
}
