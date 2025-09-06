<template>
  <div>
    <!-- Current Group Memberships -->
    <v-card variant="outlined" class="mb-4">
      <v-card-title>
        <v-icon class="me-2">mdi-account-group</v-icon>
        {{ $t('profile.currentGroups') }}
      </v-card-title>

      <v-card-text>
        <v-list v-if="profile.group_memberships.length > 0" density="comfortable">
          <v-list-item
            v-for="membership in profile.group_memberships"
            :key="membership.id"
            class="mb-2"
          >
            <template #prepend>
              <v-avatar color="primary" size="40">
                <v-icon>mdi-account-group</v-icon>
              </v-avatar>
            </template>

            <v-list-item-title>{{ membership.group.name }}</v-list-item-title>
            <v-list-item-subtitle>{{ membership.group.description }}</v-list-item-subtitle>

            <template #append>
              <div class="d-flex align-center">
                <v-chip
                  :color="membership.is_active ? 'success' : 'error'"
                  variant="tonal"
                  size="small"
                  class="me-2"
                >
                  {{ membership.role.name }}
                </v-chip>

                <v-btn
                  v-if="membership.is_active"
                  @click="handleLeaveGroup(membership.group.id)"
                  color="error"
                  variant="outlined"
                  size="small"
                  :loading="leavingGroupId === membership.group.id"
                >
                  <v-icon start>mdi-exit-to-app</v-icon>
                  {{ $t('profile.leaveGroup') }}
                </v-btn>
              </div>
            </template>
          </v-list-item>
        </v-list>

        <v-empty-state
          v-else
          :title="$t('profile.noGroups')"
          :text="$t('profile.noGroupsDescription')"
        >
          <template #image>
            <v-icon size="64" color="grey">mdi-account-group-outline</v-icon>
          </template>
        </v-empty-state>
      </v-card-text>
    </v-card>

    <!-- Join New Group -->
    <v-card variant="outlined">
      <v-card-title>
        <v-icon class="me-2">mdi-account-plus</v-icon>
        {{ $t('profile.joinGroup') }}
      </v-card-title>

      <v-card-text>
        <v-form @submit.prevent="handleJoinGroup" ref="joinForm">
          <v-row>
            <v-col cols="12" md="6">
              <v-select
                v-model="joinFormData.group_id"
                :label="$t('profile.selectGroup')"
                :items="availableGroups"
                item-title="name"
                item-value="id"
                variant="outlined"
                density="comfortable"
                :rules="[rules.required]"
                :loading="loadingGroups"
              >
                <template #item="{ props, item }">
                  <v-list-item v-bind="props">
                    <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
                    <v-list-item-subtitle>{{ item.raw.description }}</v-list-item-subtitle>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="joinFormData.role_id"
                :label="$t('profile.selectRole')"
                :items="availableRoles"
                item-title="name"
                item-value="id"
                variant="outlined"
                density="comfortable"
                :rules="[rules.required]"
                :loading="loadingRoles"
              >
                <template #item="{ props, item }">
                  <v-list-item v-bind="props">
                    <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
                    <v-list-item-subtitle>{{ item.raw.description }}</v-list-item-subtitle>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" class="d-flex justify-end">
              <v-btn
                type="submit"
                color="primary"
                :loading="joiningGroup"
                :disabled="!joinFormData.group_id || !joinFormData.role_id"
              >
                <v-icon start>mdi-account-plus</v-icon>
                {{ $t('profile.joinGroup') }}
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import type { UserProfile, UserGroup, UserRole } from '@/stores/profile'

interface Props {
  profile: UserProfile
  groups: UserGroup[]
  roles: UserRole[]
}

interface Emits {
  (e: 'join-group', data: { group_id: number; role_id: number }): void
  (e: 'leave-group', data: { group_id: number }): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()

// State
const joiningGroup = ref(false)
const leavingGroupId = ref<number | null>(null)
const loadingGroups = ref(false)
const loadingRoles = ref(false)

const joinFormData = ref({
  group_id: null as number | null,
  role_id: null as number | null,
})

// Validation rules
const rules = {
  required: (value: any) => !!value || t('validation.required'),
}

// Computed
const availableGroups = computed(() => {
  const currentGroupIds = props.profile.group_memberships
    .filter((m) => m.is_active)
    .map((m) => m.group.id)

  return props.groups.filter((group) => group.is_active && !currentGroupIds.includes(group.id))
})

const availableRoles = computed(() => {
  return props.roles.filter((role) => role.is_active)
})

// Methods
const handleJoinGroup = async () => {
  if (!joinFormData.value.group_id || !joinFormData.value.role_id) return

  joiningGroup.value = true
  try {
    emit('join-group', {
      group_id: joinFormData.value.group_id,
      role_id: joinFormData.value.role_id,
    })

    // Reset form
    joinFormData.value = {
      group_id: null,
      role_id: null,
    }
  } finally {
    joiningGroup.value = false
  }
}

const handleLeaveGroup = async (groupId: number) => {
  leavingGroupId.value = groupId
  try {
    emit('leave-group', { group_id: groupId })
  } finally {
    leavingGroupId.value = null
  }
}

// Lifecycle
onMounted(() => {
  // Groups and roles should be loaded by parent component
})
</script>
