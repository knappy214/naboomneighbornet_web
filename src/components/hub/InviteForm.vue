<template>
  <div class="card bg-base-100 shadow-sm border border-base-200">
    <div class="card-body p-4">
      <h3 class="text-lg font-semibold text-base-content mb-4">
        {{ t('hub.invites.sendInvite') }}
      </h3>

      <form @submit.prevent="submitInvite" class="space-y-4">
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">{{ t('hub.invites.email') }}</span>
          </label>
          <input
            v-model="form.email"
            type="email"
            class="input input-bordered w-full"
            :placeholder="t('hub.invites.emailPlaceholder')"
            required
          />
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">{{ t('hub.invites.role') }}</span>
          </label>
          <select v-model="form.role" class="select select-bordered w-full" required>
            <option value="member">{{ t('hub.invites.roles.member') }}</option>
            <option value="moderator">{{ t('hub.invites.roles.moderator') }}</option>
            <option value="manager">{{ t('hub.invites.roles.manager') }}</option>
          </select>
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">{{ t('hub.invites.message') }}</span>
            <span class="label-text-alt">{{ t('hub.invites.optional') }}</span>
          </label>
          <textarea
            v-model="form.message"
            class="textarea textarea-bordered w-full"
            :placeholder="t('hub.invites.messagePlaceholder')"
            rows="3"
          ></textarea>
        </div>

        <div class="flex justify-end gap-2">
          <button type="button" class="btn btn-ghost" @click="$emit('cancel')" :disabled="loading">
            {{ t('hub.actions.cancel') }}
          </button>
          <button type="submit" class="btn btn-primary" :disabled="loading || !isFormValid">
            <span v-if="loading" class="loading loading-spinner loading-xs" />
            {{ t('hub.invites.send') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'

interface Props {
  channelId: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  invite: [data: { channel: number; email: string; role: 'member' | 'moderator' | 'manager' }]
  cancel: []
}>()

const { t } = useI18n()
const loading = ref(false)

const form = reactive({
  email: '',
  role: 'member' as 'member' | 'moderator' | 'manager',
  message: '',
})

const isFormValid = computed(() => {
  return form.email.trim() !== '' && form.role !== ''
})

const submitInvite = async () => {
  if (!isFormValid.value) return

  loading.value = true
  try {
    emit('invite', {
      channel: props.channelId,
      email: form.email.trim(),
      role: form.role,
    })

    // Reset form
    form.email = ''
    form.role = 'member'
    form.message = ''
  } finally {
    loading.value = false
  }
}
</script>
