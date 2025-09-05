<script setup lang="ts">
interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  showText: true,
  className: '',
})

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
}

const textSizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
}
</script>

<template>
  <div :class="['flex items-center gap-2', className]">
    <img
      src="/logo.png"
      alt="Naboom NeighborNet Logo"
      :class="[sizeClasses[size], 'object-contain']"
    />
    <span v-if="showText" :class="['font-semibold', textSizeClasses[size]]">
      Naboom NeighborNet
    </span>
  </div>
</template>
