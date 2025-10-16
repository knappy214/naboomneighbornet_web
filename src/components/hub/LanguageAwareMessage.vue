<template>
  <div class="language-aware-message">
    <!-- Message content with language detection -->
    <div
      :class="['message-content', { rtl: isRTL, ltr: !isRTL }]"
      :lang="detectedLanguage"
      :dir="isRTL ? 'rtl' : 'ltr'"
    >
      <div class="message-text" v-html="formattedContent"></div>

      <!-- Language indicator -->
      <div v-if="showLanguageIndicator" class="language-indicator">
        <span class="badge badge-ghost badge-sm">
          {{ getLanguageDisplayName(detectedLanguage) }}
        </span>
      </div>
    </div>

    <!-- Translation options -->
    <div v-if="showTranslationOptions && needsTranslation" class="translation-options">
      <button
        @click="toggleTranslation"
        class="btn btn-ghost btn-xs"
        :class="{ 'btn-primary': showTranslated }"
      >
        {{ showTranslated ? t('common.hideTranslation') : t('common.translate') }}
      </button>

      <div v-if="showTranslated && translatedContent" class="translated-content">
        <div class="translation-label">{{ t('common.translated') }}:</div>
        <div
          class="translated-text"
          :class="{ rtl: isTranslatedRTL, ltr: !isTranslatedRTL }"
          :lang="currentLanguage"
          :dir="isTranslatedRTL ? 'rtl' : 'ltr'"
          v-html="translatedContent"
        ></div>
      </div>
    </div>

    <!-- Message metadata -->
    <div class="message-metadata">
      <div class="message-info">
        <span class="message-time">{{ formatTime(message.createdAt) }}</span>
        <span v-if="message.editedAt" class="message-edited">
          {{ t('messageList.edited') }} {{ formatTime(message.editedAt) }}
        </span>
      </div>

      <!-- Language detection confidence -->
      <div v-if="showLanguageConfidence" class="language-confidence">
        <span class="confidence-badge" :class="getConfidenceClass(confidence)">
          {{ Math.round(confidence * 100) }}%
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useInternationalization } from '@/composables/useInternationalization'
import { translationService } from '@/services/translationService'
import { detectLanguage, getLanguageName, isRTLLanguage } from '@/utils/languageDetection'
import type { Message } from '@/types/communication'

interface Props {
  message: Message
  showLanguageIndicator?: boolean
  showTranslationOptions?: boolean
  showLanguageConfidence?: boolean
  autoTranslate?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showLanguageIndicator: true,
  showTranslationOptions: true,
  showLanguageConfidence: false,
  autoTranslate: false,
})

const { t } = useI18n()
const { currentLanguage } = useInternationalization()

// State
const detectedLanguage = ref<string>('en')
const confidence = ref<number>(0.8)
const translatedContent = ref<string>('')
const showTranslated = ref<boolean>(false)
const isTranslating = ref<boolean>(false)

// Computed properties
const isRTL = computed(() => {
  return isRTLLanguage(detectedLanguage.value)
})

const isTranslatedRTL = computed(() => {
  return isRTLLanguage(currentLanguage.value)
})

const needsTranslation = computed(() => {
  return detectedLanguage.value !== currentLanguage.value
})

const formattedContent = computed(() => {
  // Basic HTML sanitization and formatting
  return props.message.content
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
})

// Methods
const detectLanguage = async (text: string): Promise<{ language: string; confidence: number }> => {
  const result = detectLanguage(text)
  return {
    language: result.language,
    confidence: result.confidence,
  }
}

const translateText = async (text: string, fromLang: string, toLang: string): Promise<string> => {
  try {
    const result = await translationService.translate(text, {
      sourceLanguage: fromLang,
      targetLanguage: toLang,
      preserveFormatting: true,
    })
    return result.translatedText
  } catch (error) {
    console.error('Translation failed:', error)
    return text // Return original text if translation fails
  }
}

const toggleTranslation = async () => {
  if (showTranslated.value) {
    showTranslated.value = false
    return
  }

  if (!translatedContent.value && needsTranslation.value) {
    isTranslating.value = true
    try {
      translatedContent.value = await translateText(
        props.message.content,
        detectedLanguage.value,
        currentLanguage.value,
      )
    } catch (error) {
      console.error('Translation failed:', error)
    } finally {
      isTranslating.value = false
    }
  }

  showTranslated.value = !showTranslated.value
}

const getLanguageDisplayName = (lang: string): string => {
  return getLanguageName(lang)
}

const getConfidenceClass = (conf: number): string => {
  if (conf >= 0.8) return 'badge-success'
  if (conf >= 0.6) return 'badge-warning'
  return 'badge-error'
}

const formatTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString([currentLanguage.value], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Lifecycle
onMounted(async () => {
  const detection = await detectLanguage(props.message.content)
  detectedLanguage.value = detection.language
  confidence.value = detection.confidence

  if (props.autoTranslate && needsTranslation.value) {
    await toggleTranslation()
  }
})

// Watch for language changes
watch(currentLanguage, async () => {
  if (showTranslated.value && needsTranslation.value) {
    translatedContent.value = ''
    await toggleTranslation()
  }
})
</script>

<style scoped>
.language-aware-message {
  @apply space-y-2;
}

.message-content {
  @apply relative;
}

.message-content.rtl {
  @apply text-right;
}

.message-content.ltr {
  @apply text-left;
}

.message-text {
  @apply break-words;
}

.language-indicator {
  @apply absolute top-0 right-0 -mt-2 -mr-2;
}

.translation-options {
  @apply flex items-center space-x-2 mt-2;
}

.translated-content {
  @apply mt-2 p-2 bg-base-200 rounded-lg;
}

.translation-label {
  @apply text-xs text-base-content opacity-70 mb-1;
}

.translated-text {
  @apply text-sm;
}

.translated-text.rtl {
  @apply text-right;
}

.translated-text.ltr {
  @apply text-left;
}

.message-metadata {
  @apply flex items-center justify-between text-xs text-base-content opacity-70;
}

.message-info {
  @apply flex items-center space-x-2;
}

.language-confidence {
  @apply flex items-center;
}

.confidence-badge {
  @apply badge badge-xs;
}

/* RTL support */
[dir='rtl'] .language-indicator {
  @apply left-0 right-auto -ml-2 -mr-0;
}

[dir='rtl'] .message-metadata {
  @apply flex-row-reverse;
}

[dir='rtl'] .message-info {
  @apply flex-row-reverse space-x-reverse;
}
</style>
