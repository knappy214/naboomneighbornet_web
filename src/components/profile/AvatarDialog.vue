<template>
  <!-- Modal -->
  <div v-if="isOpen" class="modal modal-open">
    <div class="modal-box max-w-2xl">
      <h3 class="font-bold text-lg mb-4 flex items-center gap-2">
        <span class="text-2xl">👤</span>
        Change Avatar
      </h3>

      <!-- Tabs -->
      <div class="tabs tabs-boxed mb-6">
        <button
          @click="activeTab = 'upload'"
          :class="['tab', activeTab === 'upload' ? 'tab-active' : '']"
        >
          <span class="text-lg mr-2">📤</span>
          Upload New
        </button>
        <button
          @click="activeTab = 'existing'"
          :class="['tab', activeTab === 'existing' ? 'tab-active' : '']"
        >
          <span class="text-lg mr-2">🖼️</span>
          Set Existing
        </button>
        <button
          v-if="avatarInfo?.has_avatar"
          @click="activeTab = 'current'"
          :class="['tab', activeTab === 'current' ? 'tab-active' : '']"
        >
          <span class="text-lg mr-2">👁️</span>
          Current Avatar
        </button>
      </div>

      <!-- Tab Content -->
      <div class="min-h-64">
        <!-- Upload New Avatar -->
        <div v-if="activeTab === 'upload'" class="space-y-4">
          <div class="text-center mb-6">
            <div class="avatar mb-4">
              <div class="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img v-if="previewUrl" :src="previewUrl" alt="Preview" />
                <img v-else-if="avatarInfo?.url" :src="avatarInfo.url" alt="Current avatar" />
                <div
                  v-else
                  class="bg-primary text-primary-content flex items-center justify-center text-2xl font-bold"
                >
                  ?
                </div>
              </div>
            </div>
            <p class="text-sm text-base-content/70">
              {{ previewUrl ? 'Preview of new avatar' : 'Current avatar' }}
            </p>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text font-medium">Select Image File</span>
            </label>
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              class="file-input file-input-bordered w-full"
              @change="handleFileSelect"
            />
            <label class="label">
              <span class="label-text-alt">JPG, PNG, GIF, or WebP (max 5MB)</span>
            </label>
          </div>

          <div class="alert alert-info">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 class="font-bold">Upload Requirements</h3>
              <div class="text-xs">• Maximum file size: 5MB</div>
              <div class="text-xs">• Supported formats: JPG, PNG, GIF, WebP</div>
              <div class="text-xs">• Recommended size: 200x200 pixels or larger</div>
            </div>
          </div>

          <div class="flex justify-end">
            <button
              @click="handleUpload"
              class="btn btn-primary"
              :class="{ loading: uploading }"
              :disabled="!selectedFile || uploading"
            >
              <span v-if="!uploading" class="text-lg">📤</span>
              {{ uploading ? 'Uploading...' : 'Upload Avatar' }}
            </button>
          </div>
        </div>

        <!-- Set Existing Avatar -->
        <div v-else-if="activeTab === 'existing'" class="space-y-4">
          <div v-if="loadingImages" class="text-center py-8">
            <div class="loading loading-spinner loading-lg"></div>
            <p class="mt-4 text-base-content/70">Loading available images...</p>
          </div>

          <div v-else-if="availableImages.length === 0" class="text-center py-8">
            <div class="text-6xl mb-4">🖼️</div>
            <p class="text-base-content/70">No images available</p>
            <p class="text-sm text-base-content/50">
              Upload some images first to use them as avatars
            </p>
          </div>

          <div v-else>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div
                v-for="image in availableImages"
                :key="image.id"
                @click="selectedImageId = image.id"
                :class="[
                  'card bg-base-200 shadow-sm cursor-pointer transition-all duration-200',
                  selectedImageId === image.id ? 'ring-2 ring-primary' : 'hover:shadow-md',
                ]"
              >
                <div class="card-body p-2">
                  <img
                    :src="image.url"
                    :alt="image.title"
                    class="w-full h-24 object-cover rounded"
                  />
                  <div class="text-xs text-center mt-2 truncate">{{ image.title }}</div>
                </div>
              </div>
            </div>

            <div class="flex justify-end mt-4">
              <button
                @click="handleSetExisting"
                class="btn btn-primary"
                :class="{ loading: settingExisting }"
                :disabled="!selectedImageId || settingExisting"
              >
                <span v-if="!settingExisting" class="text-lg">✅</span>
                {{ settingExisting ? 'Setting...' : 'Set as Avatar' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Current Avatar -->
        <div v-else-if="activeTab === 'current' && avatarInfo?.has_avatar" class="space-y-4">
          <div class="text-center">
            <div class="avatar mb-4">
              <div class="w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img :src="avatarInfo.avatar?.url" alt="Current avatar" />
              </div>
            </div>

            <h3 class="font-bold text-lg">{{ avatarInfo.avatar?.title }}</h3>
            <div class="text-sm text-base-content/70 space-y-1">
              <div>Uploaded: {{ formatDate(avatarInfo.avatar?.created_at) }}</div>
              <div>Size: {{ formatFileSize(avatarInfo.avatar?.file_size) }}</div>
            </div>

            <div class="mt-6">
              <button
                @click="handleDelete"
                class="btn btn-error btn-outline"
                :class="{ loading: deleting }"
                :disabled="deleting"
              >
                <span v-if="!deleting" class="text-lg">🗑️</span>
                {{ deleting ? 'Deleting...' : 'Delete Avatar' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Actions -->
      <div class="modal-action">
        <button
          @click="closeDialog"
          class="btn btn-ghost"
          :disabled="uploading || settingExisting || deleting"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Props {
  modelValue: boolean
  avatarInfo?: {
    url?: string
    has_avatar?: boolean
    avatar?: {
      url?: string
      title?: string
      created_at?: string
      file_size?: number
    }
  }
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'upload', file: File): void
  (e: 'delete'): void
  (e: 'set-existing', imageId: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// State
const activeTab = ref('upload')
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string | null>(null)
const selectedImageId = ref<number | null>(null)
const uploading = ref(false)
const settingExisting = ref(false)
const deleting = ref(false)
const loadingImages = ref(false)
const availableImages = ref<any[]>([]) // This would come from an API call

// Computed
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

// Methods
const formatDate = (dateString?: string) => {
  if (!dateString) return 'Unknown'
  return new Date(dateString).toLocaleDateString()
}

const formatFileSize = (bytes?: number) => {
  if (!bytes) return 'Unknown'
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i]
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0] || null

  selectedFile.value = file

  if (file) {
    // Validate file
    const maxSize = 5 * 1024 * 1024 // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

    if (file.size > maxSize) {
      alert('File size must be less than 5MB')
      return
    }

    if (!allowedTypes.includes(file.type)) {
      alert('File must be an image (JPG, PNG, GIF, or WebP)')
      return
    }

    // Create preview URL
    previewUrl.value = URL.createObjectURL(file)
  } else {
    previewUrl.value = null
  }
}

const handleUpload = async () => {
  if (!selectedFile.value) return

  uploading.value = true
  try {
    emit('upload', selectedFile.value)
    // Reset form
    selectedFile.value = null
    previewUrl.value = null
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    if (fileInput) fileInput.value = ''
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

const closeDialog = () => {
  isOpen.value = false
}

// Watchers
watch(
  () => props.modelValue,
  (newValue) => {
    if (!newValue) {
      // Reset form when dialog closes
      selectedFile.value = null
      previewUrl.value = null
      selectedImageId.value = null
      uploading.value = false
      settingExisting.value = false
      deleting.value = false
      activeTab.value = 'upload'
    }
  },
)

watch(activeTab, (newTab) => {
  if (newTab === 'existing' && props.modelValue) {
    loadAvailableImages()
  }
})

// Cleanup preview URL when component unmounts
watch(previewUrl, (newUrl, oldUrl) => {
  if (oldUrl) {
    URL.revokeObjectURL(oldUrl)
  }
})
</script>
