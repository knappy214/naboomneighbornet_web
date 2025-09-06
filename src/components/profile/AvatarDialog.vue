<template>
  <v-dialog v-model="dialog" max-width="600px" persistent>
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="me-2">mdi-camera</v-icon>
        {{ $t('profile.avatarManagement') }}
      </v-card-title>

      <v-card-text>
        <v-tabs v-model="activeTab" color="primary">
          <v-tab value="upload">
            <v-icon class="me-2">mdi-upload</v-icon>
            {{ $t('profile.uploadNew') }}
          </v-tab>
          <v-tab value="existing">
            <v-icon class="me-2">mdi-image</v-icon>
            {{ $t('profile.setExisting') }}
          </v-tab>
          <v-tab value="current" v-if="avatarInfo?.has_avatar">
            <v-icon class="me-2">mdi-eye</v-icon>
            {{ $t('profile.currentAvatar') }}
          </v-tab>
        </v-tabs>

        <v-card-text>
          <v-window v-model="activeTab">
            <!-- Upload New Avatar -->
            <v-window-item value="upload">
              <v-form @submit.prevent="handleUpload" ref="uploadForm">
                <v-file-input
                  v-model="selectedFile"
                  :label="$t('profile.selectImage')"
                  accept="image/*"
                  variant="outlined"
                  density="comfortable"
                  :rules="[rules.required, rules.fileSize, rules.fileType]"
                  :loading="uploading"
                />

                <v-alert
                  type="info"
                  variant="tonal"
                  class="mt-4"
                  :text="$t('profile.uploadRequirements')"
                />

                <div class="d-flex justify-end mt-4">
                  <v-btn
                    type="submit"
                    color="primary"
                    :loading="uploading"
                    :disabled="!selectedFile"
                  >
                    <v-icon start>mdi-upload</v-icon>
                    {{ $t('profile.upload') }}
                  </v-btn>
                </div>
              </v-form>
            </v-window-item>

            <!-- Set Existing Avatar -->
            <v-window-item value="existing">
              <div v-if="loadingImages" class="text-center py-4">
                <v-progress-circular indeterminate color="primary" />
                <p class="mt-2">{{ $t('common.loading') }}</p>
              </div>

              <div v-else-if="availableImages.length === 0" class="text-center py-4">
                <v-icon size="64" color="grey">mdi-image-off</v-icon>
                <p class="text-grey">{{ $t('profile.noImagesAvailable') }}</p>
              </div>

              <div v-else>
                <v-row>
                  <v-col v-for="image in availableImages" :key="image.id" cols="6" md="4">
                    <v-card
                      :class="{ 'border-primary': selectedImageId === image.id }"
                      variant="outlined"
                      @click="selectedImageId = image.id"
                      style="cursor: pointer"
                    >
                      <v-img :src="image.url" :alt="image.title" height="120" cover />
                      <v-card-title class="text-caption pa-2">
                        {{ image.title }}
                      </v-card-title>
                    </v-card>
                  </v-col>
                </v-row>

                <div class="d-flex justify-end mt-4">
                  <v-btn
                    @click="handleSetExisting"
                    color="primary"
                    :loading="settingExisting"
                    :disabled="!selectedImageId"
                  >
                    <v-icon start>mdi-check</v-icon>
                    {{ $t('profile.setAsAvatar') }}
                  </v-btn>
                </div>
              </div>
            </v-window-item>

            <!-- Current Avatar -->
            <v-window-item value="current" v-if="avatarInfo?.has_avatar">
              <div class="text-center">
                <v-avatar size="200" class="mb-4">
                  <v-img :src="avatarInfo.avatar?.url" :alt="$t('profile.currentAvatar')" />
                </v-avatar>

                <h3>{{ avatarInfo.avatar?.title }}</h3>
                <p class="text-grey">
                  {{ $t('profile.uploadedOn') }}: {{ formatDate(avatarInfo.avatar?.created_at) }}
                </p>
                <p class="text-grey">
                  {{ $t('profile.fileSize') }}: {{ formatFileSize(avatarInfo.avatar?.file_size) }}
                </p>

                <div class="d-flex justify-center gap-2 mt-4">
                  <v-btn @click="handleDelete" color="error" variant="outlined" :loading="deleting">
                    <v-icon start>mdi-delete</v-icon>
                    {{ $t('profile.deleteAvatar') }}
                  </v-btn>
                </div>
              </div>
            </v-window-item>
          </v-window>
        </v-card-text>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn @click="dialog = false" :disabled="uploading || settingExisting || deleting">
          {{ $t('common.cancel') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AvatarInfo } from '@/stores/profile'

interface Props {
  modelValue: boolean
  avatarInfo: AvatarInfo | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'upload', file: File): void
  (e: 'delete'): void
  (e: 'set-existing', imageId: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()

// State
const activeTab = ref('upload')
const selectedFile = ref<File | null>(null)
const selectedImageId = ref<number | null>(null)
const uploading = ref(false)
const settingExisting = ref(false)
const deleting = ref(false)
const loadingImages = ref(false)
const availableImages = ref<any[]>([]) // This would come from an API call

// Computed
const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

// Validation rules
const rules = {
  required: (value: any) => !!value || t('validation.required'),
  fileSize: (file: File) => {
    if (!file) return true
    const maxSize = 5 * 1024 * 1024 // 5MB
    return file.size <= maxSize || t('validation.fileSize', { max: '5MB' })
  },
  fileType: (file: File) => {
    if (!file) return true
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    return allowedTypes.includes(file.type) || t('validation.fileType')
  },
}

// Methods
const formatDate = (dateString?: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString()
}

const formatFileSize = (bytes?: number) => {
  if (!bytes) return ''
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i]
}

const handleUpload = async () => {
  if (!selectedFile.value) return

  uploading.value = true
  try {
    emit('upload', selectedFile.value)
    selectedFile.value = null
  } finally {
    uploading.value = false
  }
}

const handleDelete = async () => {
  deleting.value = true
  try {
    emit('delete')
  } finally {
    deleting.value = false
  }
}

const handleSetExisting = async () => {
  if (!selectedImageId.value) return

  settingExisting.value = true
  try {
    emit('set-existing', selectedImageId.value)
    selectedImageId.value = null
  } finally {
    settingExisting.value = false
  }
}

const loadAvailableImages = async () => {
  // This would load available images from the API
  loadingImages.value = true
  try {
    // Mock data for now
    availableImages.value = []
  } finally {
    loadingImages.value = false
  }
}

// Watchers
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue && activeTab.value === 'existing') {
      loadAvailableImages()
    }
  },
)

watch(activeTab, (newTab) => {
  if (newTab === 'existing' && props.modelValue) {
    loadAvailableImages()
  }
})
</script>
