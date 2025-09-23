import { computed, reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  submitIncident,
  bulkUpsertContacts,
  registerPushDevice,
  submitRelayFrames,
} from '@/services/panic'
import type {
  EmergencyContact,
  PushDevice,
  RelayFrame,
  IncidentPriority,
  IncidentStatus,
} from '@/types/panic.d'

interface IncidentSubmission {
  clientId?: string
  lat?: number
  lng?: number
  description?: string
  source?: string
  address?: string
  priority?: IncidentPriority
  province?: string
  context?: Record<string, unknown>
}

export const usePanicStore = defineStore('panic', () => {
  const emergencyContacts = ref<EmergencyContact[]>([])
  const pushDevices = ref<PushDevice[]>([])
  const isSubmitting = ref(false)
  const lastError = ref<Error | null>(null)

  const activeContacts = computed(() => emergencyContacts.value.filter((c) => c.isActive))
  const activeDevices = computed(() => pushDevices.value.filter((d) => d.isActive))

  async function submitNewIncident(incident: IncidentSubmission): Promise<{
    id: string
    reference: string
    status: IncidentStatus
    createdAt: string
  }> {
    isSubmitting.value = true
    lastError.value = null

    try {
      const result = await submitIncident(incident)
      return result
    } catch (error) {
      lastError.value = error as Error
      console.error('[panic] Failed to submit incident:', error)
      throw error
    } finally {
      isSubmitting.value = false
    }
  }

  async function syncEmergencyContacts(
    clientId: string,
    contacts: Omit<EmergencyContact, 'id' | 'clientId'>[],
  ): Promise<{ created: number; updated: number }> {
    try {
      const result = await bulkUpsertContacts(clientId, contacts)

      // Update local contacts
      const updatedContacts = contacts.map((contact, index) => ({
        ...contact,
        id: `temp-${Date.now()}-${index}`,
        clientId,
      }))
      emergencyContacts.value = updatedContacts

      return result
    } catch (error) {
      lastError.value = error as Error
      console.error('[panic] Failed to sync emergency contacts:', error)
      throw error
    }
  }

  async function registerDevice(
    token: string,
    clientId?: string,
    platform: 'android' | 'ios' | 'web' | 'unknown' = 'unknown',
    appVersion?: string,
  ): Promise<void> {
    try {
      await registerPushDevice(token, clientId, platform, appVersion)

      // Add to local devices
      const device: PushDevice = {
        id: `device-${Date.now()}`,
        clientId,
        token,
        platform,
        appVersion,
        lastSeen: new Date().toISOString(),
        isActive: true,
      }
      pushDevices.value.push(device)
    } catch (error) {
      lastError.value = error as Error
      console.error('[panic] Failed to register device:', error)
      throw error
    }
  }

  async function submitRelayData(frames: RelayFrame[]): Promise<void> {
    try {
      await submitRelayFrames(frames)
    } catch (error) {
      lastError.value = error as Error
      console.error('[panic] Failed to submit relay data:', error)
      throw error
    }
  }

  function addEmergencyContact(contact: Omit<EmergencyContact, 'id'>): void {
    const newContact: EmergencyContact = {
      ...contact,
      id: `contact-${Date.now()}`,
    }
    emergencyContacts.value.push(newContact)
  }

  function removeEmergencyContact(contactId: string): void {
    const index = emergencyContacts.value.findIndex((c) => c.id === contactId)
    if (index > -1) {
      emergencyContacts.value.splice(index, 1)
    }
  }

  function updateEmergencyContact(contactId: string, updates: Partial<EmergencyContact>): void {
    const contact = emergencyContacts.value.find((c) => c.id === contactId)
    if (contact) {
      Object.assign(contact, updates)
    }
  }

  function addPushDevice(device: Omit<PushDevice, 'id'>): void {
    const newDevice: PushDevice = {
      ...device,
      id: `device-${Date.now()}`,
    }
    pushDevices.value.push(newDevice)
  }

  function removePushDevice(deviceId: string): void {
    const index = pushDevices.value.findIndex((d) => d.id === deviceId)
    if (index > -1) {
      pushDevices.value.splice(index, 1)
    }
  }

  function updatePushDevice(deviceId: string, updates: Partial<PushDevice>): void {
    const device = pushDevices.value.find((d) => d.id === deviceId)
    if (device) {
      Object.assign(device, updates)
    }
  }

  function clearError(): void {
    lastError.value = null
  }

  return {
    // State
    emergencyContacts,
    pushDevices,
    isSubmitting,
    lastError,

    // Computed
    activeContacts,
    activeDevices,

    // Actions
    submitNewIncident,
    syncEmergencyContacts,
    registerDevice,
    submitRelayData,
    addEmergencyContact,
    removeEmergencyContact,
    updateEmergencyContact,
    addPushDevice,
    removePushDevice,
    updatePushDevice,
    clearError,
  }
})
