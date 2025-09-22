<template>
  <div class="toast-container pointer-events-none">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast pointer-events-auto"
        :class="toastVariantClass(toast.variant)"
        role="status"
        aria-live="assertive"
      >
        <div class="toast-body">
          <div class="toast-content">
            <p v-if="toast.title" class="toast-title">{{ toast.title }}</p>
            <p class="toast-message">{{ toast.message }}</p>
          </div>
          <div class="toast-actions">
            <button
              v-if="toast.action"
              type="button"
              class="btn btn-sm"
              @click="handleAction(toast.id)"
            >
              {{ toast.action.label }}
            </button>
            <button type="button" class="btn btn-ghost btn-sm" @click="dismiss(toast.id)">
              ×
            </button>
          </div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useToasts } from '@/composables/useToasts'

const { toasts, dismiss } = useToasts()

function toastVariantClass(variant: string) {
  switch (variant) {
    case 'success':
      return 'bg-success text-success-content'
    case 'warning':
      return 'bg-warning text-warning-content'
    case 'error':
      return 'bg-error text-error-content'
    default:
      return 'bg-info text-info-content'
  }
}

function handleAction(id: string) {
  const toast = toasts.value.find((item) => item.id === id)
  toast?.action?.handler()
  dismiss(id)
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  inset: 1rem 1rem auto auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  z-index: 60;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.toast {
  border-radius: 0.75rem;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
  padding: 0.75rem 1rem;
  min-width: 18rem;
  max-width: 24rem;
}

.toast-body {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.toast-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.toast-message {
  font-size: 0.95rem;
  line-height: 1.35;
}

.toast-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
