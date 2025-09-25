<template>
  <div class="card bg-base-100 shadow-sm border border-base-200">
    <div class="card-body p-4">
      <h3 class="text-lg font-semibold text-base-content mb-4">
        {{ t('hub.search.filters') }}
      </h3>

      <div class="space-y-4">
        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">{{ t('hub.search.channel') }}</span>
          </label>
          <select v-model="filters.channel" class="select select-bordered w-full">
            <option value="">{{ t('hub.search.allChannels') }}</option>
            <option v-for="channel in channels" :key="channel.id" :value="channel.id">
              {{ channel.name }}
            </option>
          </select>
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">{{ t('hub.search.contentType') }}</span>
          </label>
          <div class="flex flex-wrap gap-2">
            <label class="label cursor-pointer">
              <input
                v-model="filters.includeThreads"
                type="checkbox"
                class="checkbox checkbox-sm"
              />
              <span class="label-text ml-2">{{ t('hub.search.threads') }}</span>
            </label>
            <label class="label cursor-pointer">
              <input v-model="filters.includePosts" type="checkbox" class="checkbox checkbox-sm" />
              <span class="label-text ml-2">{{ t('hub.search.posts') }}</span>
            </label>
            <label class="label cursor-pointer">
              <input v-model="filters.includeAlerts" type="checkbox" class="checkbox checkbox-sm" />
              <span class="label-text ml-2">{{ t('hub.search.alerts') }}</span>
            </label>
          </div>
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">{{ t('hub.search.dateRange') }}</span>
          </label>
          <div class="grid grid-cols-2 gap-2">
            <input
              v-model="filters.dateFrom"
              type="date"
              class="input input-bordered"
              :placeholder="t('hub.search.from')"
            />
            <input
              v-model="filters.dateTo"
              type="date"
              class="input input-bordered"
              :placeholder="t('hub.search.to')"
            />
          </div>
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text font-medium">{{ t('hub.search.author') }}</span>
          </label>
          <input
            v-model="filters.author"
            type="text"
            class="input input-bordered w-full"
            :placeholder="t('hub.search.authorPlaceholder')"
          />
        </div>

        <div class="flex justify-end gap-2">
          <button type="button" class="btn btn-ghost btn-sm" @click="clearFilters">
            {{ t('hub.search.clearFilters') }}
          </button>
          <button type="button" class="btn btn-primary btn-sm" @click="applyFilters">
            {{ t('hub.search.applyFilters') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Channel } from '@/services/communityHub'

interface Props {
  channels: Channel[]
}

defineProps<Props>()

const emit = defineEmits<{
  filtersChanged: [filters: SearchFilters]
}>()

const { t } = useI18n()

interface SearchFilters {
  channel: number | ''
  includeThreads: boolean
  includePosts: boolean
  includeAlerts: boolean
  dateFrom: string
  dateTo: string
  author: string
}

const filters = reactive<SearchFilters>({
  channel: '',
  includeThreads: true,
  includePosts: true,
  includeAlerts: false,
  dateFrom: '',
  dateTo: '',
  author: '',
})

const clearFilters = () => {
  filters.channel = ''
  filters.includeThreads = true
  filters.includePosts = true
  filters.includeAlerts = false
  filters.dateFrom = ''
  filters.dateTo = ''
  filters.author = ''
  applyFilters()
}

const applyFilters = () => {
  emit('filtersChanged', { ...filters })
}
</script>
