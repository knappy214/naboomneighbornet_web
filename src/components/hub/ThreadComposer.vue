<template>
  <form
    class="rounded-box border border-base-200 bg-base-100 p-4 shadow-sm"
    @submit.prevent="submit"
  >
    <label class="block text-sm font-semibold text-base-content" :for="textareaId">
      {{ t('hub.composer.label') }}
    </label>
    <textarea
      :id="textareaId"
      v-model="message"
      class="textarea textarea-bordered mt-2 h-32 w-full"
      :placeholder="t('hub.composer.placeholder')"
      :disabled="sending"
      required
    ></textarea>
    <div class="mt-3 flex items-center justify-between text-xs text-base-content/60">
      <span>{{ t('hub.composer.hint') }}</span>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="btn btn-ghost btn-sm"
          @click="reset"
          :disabled="sending || !message.length"
        >
          {{ t('hub.composer.clear') }}
        </button>
        <button
          type="submit"
          class="btn btn-primary btn-sm"
          :disabled="sending || !message.trim().length"
        >
          <span v-if="sending" class="loading loading-spinner loading-xs" />
          <span>{{ t('hub.composer.post') }}</span>
        </button>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePostsStore } from '@/stores/hub/posts'
import { useToasts } from '@/composables/useToasts'

const props = defineProps<{ threadId: string }>()

const { t } = useI18n()
const postsStore = usePostsStore()
const { push } = useToasts()

const message = ref('')
const sending = ref(false)
const textareaId = computed(() => `composer-${props.threadId}`)

const reset = () => {
  message.value = ''
}

const submit = async () => {
  if (!message.value.trim()) return
  sending.value = true
  try {
    await postsStore.sendPost(props.threadId, { body: message.value })
    reset()
  } catch (error) {
    console.error('Failed to publish reply', error)
    push({
      variant: 'error',
      title: t('hub.composer.errorTitle'),
      message: t('hub.composer.errorBody'),
    })
  } finally {
    sending.value = false
  }
}
</script>
