<template>
  <div class="space-y-6">
    <!-- Current Groups -->
    <div>
      <h3 class="text-lg font-semibold mb-4">Your Groups</h3>
      <div v-if="profile.group_memberships?.length === 0" class="text-center py-8">
        <div class="text-6xl mb-4">👥</div>
        <p class="text-base-content/70">You're not a member of any groups yet</p>
        <p class="text-sm text-base-content/50">
          Join groups to connect with other community members
        </p>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="membership in profile.group_memberships"
          :key="membership.id"
          class="card bg-base-200 shadow-sm"
        >
          <div class="card-body p-4">
            <h4 class="font-semibold">{{ membership.group?.name }}</h4>
            <p class="text-sm text-base-content/70">{{ membership.group?.description }}</p>
            <div class="flex items-center justify-between mt-2">
              <span class="badge badge-primary">{{ membership.role?.name }}</span>
              <button
                @click="handleLeaveGroup(membership.group?.id)"
                class="btn btn-error btn-sm"
                :class="{ loading: leavingGroup === membership.group?.id }"
                :disabled="leavingGroup === membership.group?.id"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Available Groups -->
    <div>
      <h3 class="text-lg font-semibold mb-4">Available Groups</h3>
      <div v-if="groups.length === 0" class="text-center py-8">
        <div class="loading loading-spinner loading-lg"></div>
        <p class="mt-4 text-base-content/70">Loading groups...</p>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="group in groups"
          :key="group.id"
          class="card bg-base-100 shadow-sm border border-base-300"
        >
          <div class="card-body p-4">
            <h4 class="font-semibold">{{ group.name }}</h4>
            <p class="text-sm text-base-content/70">{{ group.description }}</p>
            <div class="flex items-center justify-between mt-4">
              <select
                v-model="selectedRoles[group.id]"
                class="select select-bordered select-sm"
                :disabled="joiningGroup === group.id"
              >
                <option value="">Select role</option>
                <option v-for="role in roles" :key="role.id" :value="role.id">
                  {{ role.name }}
                </option>
              </select>
              <button
                @click="handleJoinGroup(group.id)"
                class="btn btn-primary btn-sm"
                :class="{ loading: joiningGroup === group.id }"
                :disabled="!selectedRoles[group.id] || joiningGroup === group.id"
              >
                Join
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { UserProfile } from '@/stores/profile'

interface Props {
  profile: UserProfile
  groups: any[]
  roles: any[]
}

interface Emits {
  (e: 'join-group', data: { group_id: number; role_id: number }): void
  (e: 'leave-group', data: { group_id: number }): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// State
const selectedRoles = ref<Record<number, number>>({})
const joiningGroup = ref<number | null>(null)
const leavingGroup = ref<number | null>(null)

// Methods
const handleJoinGroup = async (groupId: number) => {
  const roleId = selectedRoles.value[groupId]
  if (!roleId) return

  joiningGroup.value = groupId
  try {
    emit('join-group', { group_id: groupId, role_id: roleId })
    selectedRoles.value[groupId] = 0 // Reset selection
  } finally {
    joiningGroup.value = null
  }
}

const handleLeaveGroup = async (groupId: number) => {
  if (!groupId) return

  leavingGroup.value = groupId
  try {
    emit('leave-group', { group_id: groupId })
  } finally {
    leavingGroup.value = null
  }
}
</script>
