<template>
  <div class="event-creator">
    <div class="card w-full max-w-2xl mx-auto">
      <div class="card-body">
        <h2 class="card-title text-2xl font-bold mb-6">
          {{ isEditing ? t('events.editEvent') : t('events.createEvent') }}
        </h2>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Basic Information -->
          <div class="form-section">
            <h3 class="text-lg font-semibold mb-4">{{ t('events.basicInformation') }}</h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Event Title -->
              <div class="form-control md:col-span-2">
                <label class="label" for="title">
                  <span class="label-text font-medium">{{ t('events.title') }} *</span>
                </label>
                <input
                  id="title"
                  v-model="formData.title"
                  type="text"
                  class="input input-bordered w-full"
                  :class="{ 'input-error': errors.title }"
                  :placeholder="t('events.titlePlaceholder')"
                  required
                />
                <div v-if="errors.title" class="label">
                  <span class="label-text-alt text-error">{{ errors.title }}</span>
                </div>
              </div>

              <!-- Event Category -->
              <div class="form-control">
                <label class="label" for="category">
                  <span class="label-text font-medium">{{ t('events.category') }} *</span>
                </label>
                <select
                  id="category"
                  v-model="formData.category"
                  class="select select-bordered w-full"
                  :class="{ 'select-error': errors.category }"
                  required
                >
                  <option value="">{{ t('events.selectCategory') }}</option>
                  <option value="meeting">{{ t('events.categories.meeting') }}</option>
                  <option value="social">{{ t('events.categories.social') }}</option>
                  <option value="emergency">{{ t('events.categories.emergency') }}</option>
                  <option value="maintenance">{{ t('events.categories.maintenance') }}</option>
                  <option value="celebration">{{ t('events.categories.celebration') }}</option>
                  <option value="education">{{ t('events.categories.education') }}</option>
                  <option value="sports">{{ t('events.categories.sports') }}</option>
                  <option value="volunteer">{{ t('events.categories.volunteer') }}</option>
                  <option value="other">{{ t('events.categories.other') }}</option>
                </select>
                <div v-if="errors.category" class="label">
                  <span class="label-text-alt text-error">{{ errors.category }}</span>
                </div>
              </div>

              <!-- Event Visibility -->
              <div class="form-control">
                <label class="label" for="visibility">
                  <span class="label-text font-medium">{{ t('events.visibility') }} *</span>
                </label>
                <select
                  id="visibility"
                  v-model="formData.visibility"
                  class="select select-bordered w-full"
                  :class="{ 'select-error': errors.visibility }"
                  required
                >
                  <option value="public">{{ t('events.visibilityOptions.public') }}</option>
                  <option value="community">{{ t('events.visibilityOptions.community') }}</option>
                  <option value="private">{{ t('events.visibilityOptions.private') }}</option>
                  <option value="invite_only">
                    {{ t('events.visibilityOptions.inviteOnly') }}
                  </option>
                </select>
                <div v-if="errors.visibility" class="label">
                  <span class="label-text-alt text-error">{{ errors.visibility }}</span>
                </div>
              </div>
            </div>

            <!-- Description -->
            <div class="form-control">
              <label class="label" for="description">
                <span class="label-text font-medium">{{ t('events.description') }} *</span>
              </label>
              <textarea
                id="description"
                v-model="formData.description"
                class="textarea textarea-bordered w-full h-32"
                :class="{ 'textarea-error': errors.description }"
                :placeholder="t('events.descriptionPlaceholder')"
                required
              ></textarea>
              <div v-if="errors.description" class="label">
                <span class="label-text-alt text-error">{{ errors.description }}</span>
              </div>
            </div>
          </div>

          <!-- Date and Time -->
          <div class="form-section">
            <h3 class="text-lg font-semibold mb-4">{{ t('events.dateAndTime') }}</h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Start Date -->
              <div class="form-control">
                <label class="label" for="startDate">
                  <span class="label-text font-medium">{{ t('events.startDate') }} *</span>
                </label>
                <input
                  id="startDate"
                  v-model="formData.startDate"
                  type="datetime-local"
                  class="input input-bordered w-full"
                  :class="{ 'input-error': errors.startDate }"
                  required
                />
                <div v-if="errors.startDate" class="label">
                  <span class="label-text-alt text-error">{{ errors.startDate }}</span>
                </div>
              </div>

              <!-- End Date -->
              <div class="form-control">
                <label class="label" for="endDate">
                  <span class="label-text font-medium">{{ t('events.endDate') }} *</span>
                </label>
                <input
                  id="endDate"
                  v-model="formData.endDate"
                  type="datetime-local"
                  class="input input-bordered w-full"
                  :class="{ 'input-error': errors.endDate }"
                  required
                />
                <div v-if="errors.endDate" class="label">
                  <span class="label-text-alt text-error">{{ errors.endDate }}</span>
                </div>
              </div>
            </div>

            <!-- Recurring Event -->
            <div class="form-control">
              <label class="label cursor-pointer">
                <span class="label-text font-medium">{{ t('events.recurringEvent') }}</span>
                <input
                  v-model="formData.isRecurring"
                  type="checkbox"
                  class="toggle toggle-primary"
                />
              </label>
            </div>

            <!-- Recurrence Pattern -->
            <div v-if="formData.isRecurring" class="form-control">
              <label class="label" for="recurrenceFrequency">
                <span class="label-text font-medium">{{ t('events.recurrenceFrequency') }}</span>
              </label>
              <select
                id="recurrenceFrequency"
                v-model="formData.recurrencePattern.frequency"
                class="select select-bordered w-full"
              >
                <option value="daily">{{ t('events.recurrenceOptions.daily') }}</option>
                <option value="weekly">{{ t('events.recurrenceOptions.weekly') }}</option>
                <option value="monthly">{{ t('events.recurrenceOptions.monthly') }}</option>
                <option value="yearly">{{ t('events.recurrenceOptions.yearly') }}</option>
              </select>
            </div>
          </div>

          <!-- Location -->
          <div class="form-section">
            <h3 class="text-lg font-semibold mb-4">{{ t('events.location') }}</h3>

            <!-- Virtual Event -->
            <div class="form-control">
              <label class="label cursor-pointer">
                <span class="label-text font-medium">{{ t('events.virtualEvent') }}</span>
                <input v-model="formData.isVirtual" type="checkbox" class="toggle toggle-primary" />
              </label>
            </div>

            <!-- Physical Location -->
            <div v-if="!formData.isVirtual" class="form-control">
              <label class="label" for="location">
                <span class="label-text font-medium">{{ t('events.physicalLocation') }}</span>
              </label>
              <input
                id="location"
                v-model="formData.location"
                type="text"
                class="input input-bordered w-full"
                :placeholder="t('events.locationPlaceholder')"
              />
            </div>

            <!-- Virtual Link -->
            <div v-if="formData.isVirtual" class="form-control">
              <label class="label" for="virtualLink">
                <span class="label-text font-medium">{{ t('events.virtualLink') }}</span>
              </label>
              <input
                id="virtualLink"
                v-model="formData.virtualLink"
                type="url"
                class="input input-bordered w-full"
                :placeholder="t('events.virtualLinkPlaceholder')"
              />
            </div>
          </div>

          <!-- Additional Settings -->
          <div class="form-section">
            <h3 class="text-lg font-semibold mb-4">{{ t('events.additionalSettings') }}</h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Max Attendees -->
              <div class="form-control">
                <label class="label" for="maxAttendees">
                  <span class="label-text font-medium">{{ t('events.maxAttendees') }}</span>
                </label>
                <input
                  id="maxAttendees"
                  v-model.number="formData.maxAttendees"
                  type="number"
                  min="1"
                  class="input input-bordered w-full"
                  :placeholder="t('events.maxAttendeesPlaceholder')"
                />
              </div>

              <!-- Tags -->
              <div class="form-control">
                <label class="label" for="tags">
                  <span class="label-text font-medium">{{ t('events.tags') }}</span>
                </label>
                <input
                  id="tags"
                  v-model="tagsInput"
                  type="text"
                  class="input input-bordered w-full"
                  :placeholder="t('events.tagsPlaceholder')"
                  @keydown.enter.prevent="addTag"
                />
                <div class="flex flex-wrap gap-2 mt-2">
                  <span v-for="tag in formData.tags" :key="tag" class="badge badge-primary gap-2">
                    {{ tag }}
                    <button type="button" class="btn btn-ghost btn-xs" @click="removeTag(tag)">
                      ×
                    </button>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="card-actions justify-end">
            <button type="button" class="btn btn-ghost" @click="handleCancel">
              {{ t('common.cancel') }}
            </button>
            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
              <span v-if="isSubmitting" class="loading loading-spinner loading-sm"></span>
              {{
                isSubmitting
                  ? t('common.saving')
                  : isEditing
                    ? t('common.update')
                    : t('common.create')
              }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useEventStore } from '@/stores/hub/events'
import type { Event, EventCategory, EventVisibility } from '@/types/events'

interface Props {
  event?: Event
  isEditing?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isEditing: false,
})

const emit = defineEmits<{
  (event: 'success', eventData: Event): void
  (event: 'cancel'): void
}>()

const { t } = useI18n()
const eventStore = useEventStore()

// Form data
const formData = reactive({
  title: '',
  description: '',
  startDate: '',
  endDate: '',
  location: '',
  virtualLink: '',
  isVirtual: false,
  isRecurring: false,
  recurrencePattern: {
    frequency: 'weekly' as const,
    interval: 1,
    endDate: undefined as Date | undefined,
  },
  maxAttendees: undefined as number | undefined,
  status: 'draft' as const,
  visibility: 'community' as EventVisibility,
  category: 'meeting' as EventCategory,
  tags: [] as string[],
  createdBy: 'current-user-id', // This would come from auth store
  reminders: [],
  attendees: [],
  metadata: {
    attachments: [],
    customFields: {},
    externalLinks: [],
    requirements: [],
    equipment: [],
    accessibility: {
      wheelchairAccessible: false,
      hearingAssistance: false,
      visualAssistance: false,
      otherAccommodations: [],
    },
    weatherDependent: false,
  },
})

const tagsInput = ref('')
const errors = reactive<Record<string, string>>({})
const isSubmitting = ref(false)

// Initialize form with event data if editing
onMounted(() => {
  if (props.event && props.isEditing) {
    Object.assign(formData, {
      ...props.event,
      startDate: new Date(props.event.startDate).toISOString().slice(0, 16),
      endDate: new Date(props.event.endDate).toISOString().slice(0, 16),
      tags: [...props.event.tags],
    })
  } else {
    // Set default start date to next hour
    const now = new Date()
    now.setHours(now.getHours() + 1, 0, 0, 0)
    formData.startDate = now.toISOString().slice(0, 16)

    // Set default end date to 2 hours later
    const endTime = new Date(now)
    endTime.setHours(endTime.getHours() + 2)
    formData.endDate = endTime.toISOString().slice(0, 16)
  }
})

// Watch for virtual event toggle
watch(
  () => formData.isVirtual,
  (isVirtual) => {
    if (isVirtual) {
      formData.location = ''
    } else {
      formData.virtualLink = ''
    }
  },
)

// Tag management
function addTag() {
  const tag = tagsInput.value.trim()
  if (tag && !formData.tags.includes(tag)) {
    formData.tags.push(tag)
    tagsInput.value = ''
  }
}

function removeTag(tag: string) {
  const index = formData.tags.indexOf(tag)
  if (index > -1) {
    formData.tags.splice(index, 1)
  }
}

// Validation
function validateForm(): boolean {
  errors.title = ''
  errors.description = ''
  errors.startDate = ''
  errors.endDate = ''
  errors.category = ''
  errors.visibility = ''

  let isValid = true

  if (!formData.title.trim()) {
    errors.title = t('events.validation.titleRequired')
    isValid = false
  }

  if (!formData.description.trim()) {
    errors.description = t('events.validation.descriptionRequired')
    isValid = false
  }

  if (!formData.startDate) {
    errors.startDate = t('events.validation.startDateRequired')
    isValid = false
  }

  if (!formData.endDate) {
    errors.endDate = t('events.validation.endDateRequired')
    isValid = false
  }

  if (formData.startDate && formData.endDate) {
    const startDate = new Date(formData.startDate)
    const endDate = new Date(formData.endDate)

    if (endDate <= startDate) {
      errors.endDate = t('events.validation.endDateAfterStart')
      isValid = false
    }
  }

  if (!formData.isVirtual && !formData.location.trim()) {
    // Location is optional, but we could make it required
  }

  if (formData.isVirtual && !formData.virtualLink.trim()) {
    // Virtual link is optional, but we could make it required
  }

  return isValid
}

// Form submission
async function handleSubmit() {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true

  try {
    const eventData = {
      ...formData,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      currentAttendees: 0,
    }

    let result: Event
    if (props.isEditing && props.event) {
      result = await eventStore.updateEvent(props.event.id, eventData)
    } else {
      result = await eventStore.createEvent(eventData)
    }

    emit('success', result)
  } catch (error) {
    console.error('Error saving event:', error)
    // Error handling is done in the store
  } finally {
    isSubmitting.value = false
  }
}

function handleCancel() {
  emit('cancel')
}
</script>

<style scoped>
.event-creator {
  @apply p-4;
}

.form-section {
  @apply space-y-4;
}

.card {
  @apply shadow-lg;
}

.form-control {
  @apply space-y-1;
}

.label {
  @apply p-0;
}

.input,
.select,
.textarea {
  @apply transition-colors;
}

.input-error,
.select-error,
.textarea-error {
  @apply border-error;
}

.badge {
  @apply cursor-pointer;
}
</style>
