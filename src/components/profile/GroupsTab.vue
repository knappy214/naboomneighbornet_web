<template>
  <div class="space-y-8">
    <!-- Current Group Memberships -->
    <div>
      <div class="flex items-center gap-3 mb-6">
        <div class="p-2 bg-success/10 rounded-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-success"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </div>
        <h3 class="text-xl font-bold text-base-content">Your Group Memberships</h3>
      </div>

      <div v-if="profile.group_memberships?.length === 0" class="text-center py-12">
        <div class="text-6xl mb-4">👥</div>
        <h4 class="text-lg font-semibold text-base-content mb-2">No Group Memberships</h4>
        <p class="text-base-content/70 mb-6">You're not a member of any groups yet</p>
        <p class="text-sm text-base-content/50">
          Join groups below to connect with other community members
        </p>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div
          v-for="membership in profile.group_memberships"
          :key="membership.id"
          class="card bg-base-100 shadow-lg border border-base-300 hover:shadow-xl transition-all"
        >
          <div class="card-body p-6">
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <h4 class="text-lg font-bold text-base-content mb-1">
                  {{ membership.group?.name }}
                </h4>
                <p class="text-sm text-base-content/70 mb-3">{{ membership.group?.description }}</p>
                <div class="flex items-center gap-2">
                  <span class="badge badge-primary badge-lg gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {{ membership.role?.name }}
                  </span>
                  <span class="badge badge-outline badge-sm">
                    Joined {{ formatDate(membership.joined_at) }}
                  </span>
                </div>
              </div>
            </div>
            <div class="card-actions justify-end">
              <button
                @click="handleLeaveGroup(membership.group?.id)"
                class="btn btn-error btn-sm"
                :class="{ loading: leavingGroup === membership.group?.id }"
                :disabled="leavingGroup === membership.group?.id"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H3"
                  />
                </svg>
                Leave Group
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Join New Groups -->
    <div>
      <div class="flex items-center gap-3 mb-6">
        <div class="p-2 bg-info/10 rounded-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-info"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </div>
        <h3 class="text-xl font-bold text-base-content">Join New Groups</h3>
      </div>

      <div v-if="groups.length === 0" class="text-center py-12">
        <div class="loading loading-spinner loading-lg text-primary mb-4"></div>
        <h4 class="text-lg font-semibold text-base-content mb-2">Loading Groups...</h4>
        <p class="text-base-content/70">Please wait while we fetch available groups</p>
      </div>

      <div v-else class="space-y-4">
        <!-- Group Selection Form -->
        <div class="card bg-base-100 shadow-lg border border-base-300">
          <div class="card-body p-6">
            <h4 class="text-lg font-bold text-base-content mb-4">Join a Group</h4>
            <form @submit.prevent="handleJoinGroup" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Group Selection -->
                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">Select Group</span>
                  </label>
                  <select v-model="selectedGroup" class="select select-bordered w-full" required>
                    <option disabled value="">Choose a group...</option>
                    <option v-for="group in availableGroups" :key="group.id" :value="group.id">
                      {{ group.name }}
                    </option>
                  </select>
                </div>

                <!-- Role Selection -->
                <div class="form-control">
                  <label class="label">
                    <span class="label-text font-medium">Select Role</span>
                  </label>
                  <select v-model="selectedRole" class="select select-bordered w-full" required>
                    <option disabled value="">Choose a role...</option>
                    <option v-for="role in roles" :key="role.id" :value="role.id">
                      {{ role.name }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="form-control">
                <button
                  type="submit"
                  class="btn btn-primary"
                  :class="{ loading: joiningGroup }"
                  :disabled="joiningGroup || !selectedGroup || !selectedRole"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Join Group
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Available Groups List -->
        <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          <div
            v-for="group in availableGroups"
            :key="group.id"
            class="card bg-base-100 shadow-lg border border-base-300 hover:shadow-xl transition-all"
          >
            <div class="card-body p-6">
              <h4 class="text-lg font-bold text-base-content mb-2">{{ group.name }}</h4>
              <p class="text-sm text-base-content/70 mb-4">{{ group.description }}</p>
              <div class="card-actions justify-between items-center">
                <span class="text-xs text-base-content/50">
                  Created {{ formatDate(group.created_at) }}
                </span>
                <button
                  @click="selectGroup(group.id)"
                  class="btn btn-primary btn-sm"
                  :disabled="isMemberOfGroup(group.id)"
                >
                  {{ isMemberOfGroup(group.id) ? 'Member' : 'Join' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { UserProfile, UserGroup, UserRole, GroupMembership } from '@/stores/profile'

interface Props {
  profile: UserProfile
  groups: UserGroup[]
  roles: UserRole[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'join-group': [data: { group_id: number; role_id: number }]
  'leave-group': [data: { group_id: number }]
}>()

// State
const selectedGroup = ref<number | ''>('')
const selectedRole = ref<number | ''>('')
const joiningGroup = ref(false)
const leavingGroup = ref<number | null>(null)

// Computed
const availableGroups = computed(() => {
  const memberGroupIds = props.profile.group_memberships?.map((m) => m.group?.id) || []
  return props.groups.filter((group) => !memberGroupIds.includes(group.id))
})

// Methods
const formatDate = (dateString: string) => {
  if (!dateString) return 'Unknown'
  return new Date(dateString).toLocaleDateString()
}

const isMemberOfGroup = (groupId: number) => {
  return props.profile.group_memberships?.some((m) => m.group?.id === groupId) || false
}

const selectGroup = (groupId: number) => {
  selectedGroup.value = groupId
  // Auto-select first role if none selected
  if (!selectedRole.value && props.roles.length > 0) {
    selectedRole.value = props.roles[0].id
  }
}

const handleJoinGroup = async () => {
  if (!selectedGroup.value || !selectedRole.value) return

  joiningGroup.value = true
  try {
    emit('join-group', {
      group_id: selectedGroup.value,
      role_id: selectedRole.value,
    })
    // Reset form
    selectedGroup.value = ''
    selectedRole.value = ''
  } finally {
    joiningGroup.value = false
  }
}

const handleLeaveGroup = async (groupId: number | undefined) => {
  if (!groupId) return

  leavingGroup.value = groupId
  try {
    emit('leave-group', { group_id: groupId })
  } finally {
    leavingGroup.value = null
  }
}
</script>
