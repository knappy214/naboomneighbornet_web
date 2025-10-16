<template>
  <div class="profile-editor">
    <div class="card bg-base-100 shadow-sm">
      <div class="card-body">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <h2 class="card-title text-2xl">{{ $t('user.editProfile') }}</h2>
          <button class="btn btn-ghost btn-sm" @click="$emit('close')">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- Tabs -->
        <div class="tabs tabs-boxed mb-6">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="tab"
            :class="{ 'tab-active': activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="tab.icon" />
            </svg>
            {{ tab.label }}
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Basic Information Tab -->
          <div v-if="activeTab === 'basic'" class="space-y-4">
            <h3 class="text-lg font-semibold mb-4">{{ $t('user.basicInformation') }}</h3>

            <!-- Avatar Upload -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">{{ $t('user.avatar') }}</span>
              </label>
              <div class="flex items-center gap-4">
                <div class="avatar">
                  <div
                    class="w-20 h-20 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2"
                  >
                    <img
                      v-if="form.avatar || user?.avatar"
                      :src="form.avatar || user?.avatar"
                      :alt="form.displayName || user?.displayName"
                      class="w-full h-full object-cover rounded-full"
                    />
                    <div
                      v-else
                      class="w-full h-full bg-primary text-primary-content flex items-center justify-center text-xl font-bold"
                    >
                      {{ (form.displayName || user?.displayName || 'U').charAt(0).toUpperCase() }}
                    </div>
                  </div>
                </div>
                <div class="flex-1">
                  <input
                    type="file"
                    class="file-input file-input-bordered w-full max-w-xs"
                    accept="image/*"
                    @change="handleAvatarChange"
                  />
                  <div class="label">
                    <span class="label-text-alt">{{ $t('user.avatarDescription') }}</span>
                  </div>
                </div>
                <button
                  v-if="form.avatar || user?.avatar"
                  type="button"
                  class="btn btn-error btn-sm"
                  @click="removeAvatar"
                >
                  {{ $t('user.removeAvatar') }}
                </button>
              </div>
            </div>

            <!-- Display Name -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">{{ $t('user.displayName') }} *</span>
              </label>
              <input
                v-model="form.displayName"
                type="text"
                class="input input-bordered"
                :class="{ 'input-error': errors.displayName }"
                :placeholder="$t('user.displayNamePlaceholder')"
                required
              />
              <label v-if="errors.displayName" class="label">
                <span class="label-text-alt text-error">{{ errors.displayName }}</span>
              </label>
            </div>

            <!-- Username -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">{{ $t('user.username') }} *</span>
              </label>
              <input
                v-model="form.username"
                type="text"
                class="input input-bordered"
                :class="{ 'input-error': errors.username }"
                :placeholder="$t('user.usernamePlaceholder')"
                required
                pattern="^[a-zA-Z0-9_-]+$"
                title="Username can only contain letters, numbers, underscores, and hyphens"
              />
              <label v-if="errors.username" class="label">
                <span class="label-text-alt text-error">{{ errors.username }}</span>
              </label>
            </div>

            <!-- Bio -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">{{ $t('user.bio') }}</span>
              </label>
              <textarea
                v-model="form.bio"
                class="textarea textarea-bordered h-24"
                :class="{ 'textarea-error': errors.bio }"
                :placeholder="$t('user.bioPlaceholder')"
                maxlength="500"
              ></textarea>
              <label class="label">
                <span class="label-text-alt">{{ form.bio?.length || 0 }}/500</span>
                <span v-if="errors.bio" class="label-text-alt text-error">{{ errors.bio }}</span>
              </label>
            </div>

            <!-- Location -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">{{ $t('user.location') }}</span>
              </label>
              <input
                v-model="form.location"
                type="text"
                class="input input-bordered"
                :class="{ 'input-error': errors.location }"
                :placeholder="$t('user.locationPlaceholder')"
              />
              <label v-if="errors.location" class="label">
                <span class="label-text-alt text-error">{{ errors.location }}</span>
              </label>
            </div>
          </div>

          <!-- Contact Information Tab -->
          <div v-if="activeTab === 'contact'" class="space-y-4">
            <h3 class="text-lg font-semibold mb-4">{{ $t('user.contactInformation') }}</h3>

            <!-- Email -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">{{ $t('user.email') }} *</span>
              </label>
              <input
                v-model="form.email"
                type="email"
                class="input input-bordered"
                :class="{ 'input-error': errors.email }"
                :placeholder="$t('user.emailPlaceholder')"
                required
              />
              <label v-if="errors.email" class="label">
                <span class="label-text-alt text-error">{{ errors.email }}</span>
              </label>
            </div>

            <!-- Phone -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">{{ $t('user.phone') }}</span>
              </label>
              <input
                v-model="form.phone"
                type="tel"
                class="input input-bordered"
                :class="{ 'input-error': errors.phone }"
                :placeholder="$t('user.phonePlaceholder')"
                pattern="^[\+]?[1-9][\d]{0,15}$"
                title="Enter a valid phone number"
              />
              <label v-if="errors.phone" class="label">
                <span class="label-text-alt text-error">{{ errors.phone }}</span>
              </label>
            </div>

            <!-- Website -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">{{ $t('user.website') }}</span>
              </label>
              <input
                v-model="form.website"
                type="url"
                class="input input-bordered"
                :class="{ 'input-error': errors.website }"
                :placeholder="$t('user.websitePlaceholder')"
                pattern="^(https?://)?([a-zA-Z0-9]([a-zA-Z0-9\\-].*[a-zA-Z0-9])?\.)+[a-zA-Z].*$"
                title="Enter a valid website URL"
              />
              <label v-if="errors.website" class="label">
                <span class="label-text-alt text-error">{{ errors.website }}</span>
              </label>
            </div>
          </div>

          <!-- Social Links Tab -->
          <div v-if="activeTab === 'social'" class="space-y-4">
            <h3 class="text-lg font-semibold mb-4">{{ $t('user.socialLinks') }}</h3>

            <!-- Twitter -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">Twitter</span>
              </label>
              <input
                v-model="form.socialLinks.twitter"
                type="url"
                class="input input-bordered"
                :class="{ 'input-error': errors.socialLinks?.twitter }"
                :placeholder="$t('user.twitterPlaceholder')"
                pattern="^https?://(www\.)?twitter\.com/[a-zA-Z0-9_]+$"
                title="Enter a valid Twitter profile URL"
              />
              <label v-if="errors.socialLinks?.twitter" class="label">
                <span class="label-text-alt text-error">{{ errors.socialLinks.twitter }}</span>
              </label>
            </div>

            <!-- LinkedIn -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">LinkedIn</span>
              </label>
              <input
                v-model="form.socialLinks.linkedin"
                type="url"
                class="input input-bordered"
                :class="{ 'input-error': errors.socialLinks?.linkedin }"
                :placeholder="$t('user.linkedinPlaceholder')"
                pattern="^https?://(www\.)?linkedin\.com/in/[a-zA-Z0-9-]+/?$"
                title="Enter a valid LinkedIn profile URL"
              />
              <label v-if="errors.socialLinks?.linkedin" class="label">
                <span class="label-text-alt text-error">{{ errors.socialLinks.linkedin }}</span>
              </label>
            </div>

            <!-- Facebook -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">Facebook</span>
              </label>
              <input
                v-model="form.socialLinks.facebook"
                type="url"
                class="input input-bordered"
                :class="{ 'input-error': errors.socialLinks?.facebook }"
                :placeholder="$t('user.facebookPlaceholder')"
                pattern="^https?://(www\.)?facebook\.com/[a-zA-Z0-9.]+/?$"
                title="Enter a valid Facebook profile URL"
              />
              <label v-if="errors.socialLinks?.facebook" class="label">
                <span class="label-text-alt text-error">{{ errors.socialLinks.facebook }}</span>
              </label>
            </div>

            <!-- Instagram -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">Instagram</span>
              </label>
              <input
                v-model="form.socialLinks.instagram"
                type="url"
                class="input input-bordered"
                :class="{ 'input-error': errors.socialLinks?.instagram }"
                :placeholder="$t('user.instagramPlaceholder')"
                pattern="^https?://(www\.)?instagram\.com/[a-zA-Z0-9_.]+/?$"
                title="Enter a valid Instagram profile URL"
              />
              <label v-if="errors.socialLinks?.instagram" class="label">
                <span class="label-text-alt text-error">{{ errors.socialLinks.instagram }}</span>
              </label>
            </div>
          </div>

          <!-- Preferences Tab -->
          <div v-if="activeTab === 'preferences'" class="space-y-4">
            <h3 class="text-lg font-semibold mb-4">{{ $t('user.preferences') }}</h3>

            <!-- Theme -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">{{ $t('user.theme') }}</span>
              </label>
              <select v-model="form.preferences.theme" class="select select-bordered">
                <option value="light">{{ $t('user.themes.light') }}</option>
                <option value="dark">{{ $t('user.themes.dark') }}</option>
                <option value="auto">{{ $t('user.themes.auto') }}</option>
              </select>
            </div>

            <!-- Language -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">{{ $t('user.language') }}</span>
              </label>
              <select v-model="form.preferences.language" class="select select-bordered">
                <option value="en">{{ $t('user.languages.english') }}</option>
                <option value="af">{{ $t('user.languages.afrikaans') }}</option>
              </select>
            </div>

            <!-- Timezone -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">{{ $t('user.timezone') }}</span>
              </label>
              <select v-model="form.preferences.timezone" class="select select-bordered">
                <option value="Africa/Johannesburg">Africa/Johannesburg (SAST)</option>
                <option value="Africa/Cape_Town">Africa/Cape_Town (SAST)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>

            <!-- Privacy Level -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">{{ $t('user.privacyLevel') }}</span>
              </label>
              <select v-model="form.preferences.privacyLevel" class="select select-bordered">
                <option value="public">{{ $t('user.privacyLevels.public') }}</option>
                <option value="community">{{ $t('user.privacyLevels.community') }}</option>
                <option value="private">{{ $t('user.privacyLevels.private') }}</option>
              </select>
            </div>

            <!-- Show Online Status -->
            <div class="form-control">
              <label class="label cursor-pointer">
                <span class="label-text">{{ $t('user.showOnlineStatus') }}</span>
                <input
                  v-model="form.preferences.showOnlineStatus"
                  type="checkbox"
                  class="toggle toggle-primary"
                />
              </label>
            </div>

            <!-- Show Last Seen -->
            <div class="form-control">
              <label class="label cursor-pointer">
                <span class="label-text">{{ $t('user.showLastSeen') }}</span>
                <input
                  v-model="form.preferences.showLastSeen"
                  type="checkbox"
                  class="toggle toggle-primary"
                />
              </label>
            </div>

            <!-- Allow Direct Messages -->
            <div class="form-control">
              <label class="label cursor-pointer">
                <span class="label-text">{{ $t('user.allowDirectMessages') }}</span>
                <input
                  v-model="form.preferences.allowDirectMessages"
                  type="checkbox"
                  class="toggle toggle-primary"
                />
              </label>
            </div>

            <!-- Allow Event Invites -->
            <div class="form-control">
              <label class="label cursor-pointer">
                <span class="label-text">{{ $t('user.allowEventInvites') }}</span>
                <input
                  v-model="form.preferences.allowFriendRequests"
                  type="checkbox"
                  class="toggle toggle-primary"
                />
              </label>
            </div>

            <!-- Allow Friend Requests -->
            <div class="form-control">
              <label class="label cursor-pointer">
                <span class="label-text">{{ $t('user.allowFriendRequests') }}</span>
                <input
                  v-model="form.preferences.allowFriendRequests"
                  type="checkbox"
                  class="toggle toggle-primary"
                />
              </label>
            </div>
          </div>

          <!-- Privacy Settings Tab -->
          <div v-if="activeTab === 'privacy'" class="space-y-4">
            <h3 class="text-lg font-semibold mb-4">{{ $t('user.privacySettings') }}</h3>

            <!-- Email Visibility -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">{{ $t('user.emailVisibility') }}</span>
              </label>
              <select v-model="form.visibility.email" class="select select-bordered">
                <option value="public">{{ $t('user.visibilityLevels.public') }}</option>
                <option value="community">{{ $t('user.visibilityLevels.community') }}</option>
                <option value="private">{{ $t('user.visibilityLevels.private') }}</option>
              </select>
            </div>

            <!-- Phone Visibility -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">{{ $t('user.phoneVisibility') }}</span>
              </label>
              <select v-model="form.visibility.phone" class="select select-bordered">
                <option value="public">{{ $t('user.visibilityLevels.public') }}</option>
                <option value="community">{{ $t('user.visibilityLevels.community') }}</option>
                <option value="private">{{ $t('user.visibilityLevels.private') }}</option>
              </select>
            </div>

            <!-- Location Visibility -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">{{ $t('user.locationVisibility') }}</span>
              </label>
              <select v-model="form.visibility.location" class="select select-bordered">
                <option value="public">{{ $t('user.visibilityLevels.public') }}</option>
                <option value="community">{{ $t('user.visibilityLevels.community') }}</option>
                <option value="private">{{ $t('user.visibilityLevels.private') }}</option>
              </select>
            </div>

            <!-- Bio Visibility -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">{{ $t('user.bioVisibility') }}</span>
              </label>
              <select v-model="form.visibility.bio" class="select select-bordered">
                <option value="public">{{ $t('user.visibilityLevels.public') }}</option>
                <option value="community">{{ $t('user.visibilityLevels.community') }}</option>
                <option value="private">{{ $t('user.visibilityLevels.private') }}</option>
              </select>
            </div>

            <!-- Social Links Visibility -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">{{ $t('user.socialLinksVisibility') }}</span>
              </label>
              <select v-model="form.visibility.socialLinks" class="select select-bordered">
                <option value="public">{{ $t('user.visibilityLevels.public') }}</option>
                <option value="community">{{ $t('user.visibilityLevels.community') }}</option>
                <option value="private">{{ $t('user.visibilityLevels.private') }}</option>
              </select>
            </div>

            <!-- Activity History Visibility -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">{{ $t('user.activityHistoryVisibility') }}</span>
              </label>
              <select v-model="form.visibility.activityHistory" class="select select-bordered">
                <option value="public">{{ $t('user.visibilityLevels.public') }}</option>
                <option value="community">{{ $t('user.visibilityLevels.community') }}</option>
                <option value="private">{{ $t('user.visibilityLevels.private') }}</option>
              </select>
            </div>

            <!-- Online Status Visibility -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">{{ $t('user.onlineStatusVisibility') }}</span>
              </label>
              <select v-model="form.visibility.onlineStatus" class="select select-bordered">
                <option value="public">{{ $t('user.visibilityLevels.public') }}</option>
                <option value="community">{{ $t('user.visibilityLevels.community') }}</option>
                <option value="private">{{ $t('user.visibilityLevels.private') }}</option>
              </select>
            </div>

            <!-- Last Seen Visibility -->
            <div class="form-control">
              <label class="label">
                <span class="label-text">{{ $t('user.lastSeenVisibility') }}</span>
              </label>
              <select v-model="form.visibility.lastSeen" class="select select-bordered">
                <option value="public">{{ $t('user.visibilityLevels.public') }}</option>
                <option value="community">{{ $t('user.visibilityLevels.community') }}</option>
                <option value="private">{{ $t('user.visibilityLevels.private') }}</option>
              </select>
            </div>
          </div>

          <!-- Notifications Tab -->
          <div v-if="activeTab === 'notifications'" class="space-y-4">
            <h3 class="text-lg font-semibold mb-4">{{ $t('user.notificationSettings') }}</h3>

            <!-- Email Notifications -->
            <div class="card bg-base-200">
              <div class="card-body">
                <h4 class="card-title text-base">{{ $t('user.emailNotifications') }}</h4>
                <div class="space-y-3">
                  <div class="form-control">
                    <label class="label cursor-pointer">
                      <span class="label-text">{{ $t('user.newMessages') }}</span>
                      <input
                        v-model="form.notificationSettings.email.newMessages"
                        type="checkbox"
                        class="toggle toggle-primary"
                      />
                    </label>
                  </div>
                  <div class="form-control">
                    <label class="label cursor-pointer">
                      <span class="label-text">{{ $t('user.mentions') }}</span>
                      <input
                        v-model="form.notificationSettings.email.mentions"
                        type="checkbox"
                        class="toggle toggle-primary"
                      />
                    </label>
                  </div>
                  <div class="form-control">
                    <label class="label cursor-pointer">
                      <span class="label-text">{{ $t('user.eventInvites') }}</span>
                      <input
                        v-model="form.notificationSettings.email.eventInvites"
                        type="checkbox"
                        class="toggle toggle-primary"
                      />
                    </label>
                  </div>
                  <div class="form-control">
                    <label class="label cursor-pointer">
                      <span class="label-text">{{ $t('user.eventReminders') }}</span>
                      <input
                        v-model="form.notificationSettings.email.eventReminders"
                        type="checkbox"
                        class="toggle toggle-primary"
                      />
                    </label>
                  </div>
                  <div class="form-control">
                    <label class="label cursor-pointer">
                      <span class="label-text">{{ $t('user.roleChanges') }}</span>
                      <input
                        v-model="form.notificationSettings.email.roleChanges"
                        type="checkbox"
                        class="toggle toggle-primary"
                      />
                    </label>
                  </div>
                  <div class="form-control">
                    <label class="label cursor-pointer">
                      <span class="label-text">{{ $t('user.systemUpdates') }}</span>
                      <input
                        v-model="form.notificationSettings.email.systemUpdates"
                        type="checkbox"
                        class="toggle toggle-primary"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Push Notifications -->
            <div class="card bg-base-200">
              <div class="card-body">
                <h4 class="card-title text-base">{{ $t('user.pushNotifications') }}</h4>
                <div class="space-y-3">
                  <div class="form-control">
                    <label class="label cursor-pointer">
                      <span class="label-text">{{ $t('user.newMessages') }}</span>
                      <input
                        v-model="form.notificationSettings.push.newMessages"
                        type="checkbox"
                        class="toggle toggle-primary"
                      />
                    </label>
                  </div>
                  <div class="form-control">
                    <label class="label cursor-pointer">
                      <span class="label-text">{{ $t('user.mentions') }}</span>
                      <input
                        v-model="form.notificationSettings.push.mentions"
                        type="checkbox"
                        class="toggle toggle-primary"
                      />
                    </label>
                  </div>
                  <div class="form-control">
                    <label class="label cursor-pointer">
                      <span class="label-text">{{ $t('user.eventInvites') }}</span>
                      <input
                        v-model="form.notificationSettings.push.eventInvites"
                        type="checkbox"
                        class="toggle toggle-primary"
                      />
                    </label>
                  </div>
                  <div class="form-control">
                    <label class="label cursor-pointer">
                      <span class="label-text">{{ $t('user.eventReminders') }}</span>
                      <input
                        v-model="form.notificationSettings.push.eventReminders"
                        type="checkbox"
                        class="toggle toggle-primary"
                      />
                    </label>
                  </div>
                  <div class="form-control">
                    <label class="label cursor-pointer">
                      <span class="label-text">{{ $t('user.roleChanges') }}</span>
                      <input
                        v-model="form.notificationSettings.push.roleChanges"
                        type="checkbox"
                        class="toggle toggle-primary"
                      />
                    </label>
                  </div>
                  <div class="form-control">
                    <label class="label cursor-pointer">
                      <span class="label-text">{{ $t('user.systemUpdates') }}</span>
                      <input
                        v-model="form.notificationSettings.push.systemUpdates"
                        type="checkbox"
                        class="toggle toggle-primary"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- SMS Notifications -->
            <div class="card bg-base-200">
              <div class="card-body">
                <h4 class="card-title text-base">{{ $t('user.smsNotifications') }}</h4>
                <div class="space-y-3">
                  <div class="form-control">
                    <label class="label cursor-pointer">
                      <span class="label-text">{{ $t('user.urgentMessages') }}</span>
                      <input
                        v-model="form.notificationSettings.sms.urgentMessages"
                        type="checkbox"
                        class="toggle toggle-primary"
                      />
                    </label>
                  </div>
                  <div class="form-control">
                    <label class="label cursor-pointer">
                      <span class="label-text">{{ $t('user.emergencyAlerts') }}</span>
                      <input
                        v-model="form.notificationSettings.sms.emergencyAlerts"
                        type="checkbox"
                        class="toggle toggle-primary"
                      />
                    </label>
                  </div>
                  <div class="form-control">
                    <label class="label cursor-pointer">
                      <span class="label-text">{{ $t('user.systemUpdates') }}</span>
                      <input
                        v-model="form.notificationSettings.sms.systemUpdates"
                        type="checkbox"
                        class="toggle toggle-primary"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- In-App Notifications -->
            <div class="card bg-base-200">
              <div class="card-body">
                <h4 class="card-title text-base">{{ $t('user.inAppNotifications') }}</h4>
                <div class="space-y-3">
                  <div class="form-control">
                    <label class="label cursor-pointer">
                      <span class="label-text">{{ $t('user.newMessages') }}</span>
                      <input
                        v-model="form.notificationSettings.inApp.newMessages"
                        type="checkbox"
                        class="toggle toggle-primary"
                      />
                    </label>
                  </div>
                  <div class="form-control">
                    <label class="label cursor-pointer">
                      <span class="label-text">{{ $t('user.mentions') }}</span>
                      <input
                        v-model="form.notificationSettings.inApp.mentions"
                        type="checkbox"
                        class="toggle toggle-primary"
                      />
                    </label>
                  </div>
                  <div class="form-control">
                    <label class="label cursor-pointer">
                      <span class="label-text">{{ $t('user.reactions') }}</span>
                      <input
                        v-model="form.notificationSettings.inApp.reactions"
                        type="checkbox"
                        class="toggle toggle-primary"
                      />
                    </label>
                  </div>
                  <div class="form-control">
                    <label class="label cursor-pointer">
                      <span class="label-text">{{ $t('user.eventUpdates') }}</span>
                      <input
                        v-model="form.notificationSettings.inApp.eventUpdates"
                        type="checkbox"
                        class="toggle toggle-primary"
                      />
                    </label>
                  </div>
                  <div class="form-control">
                    <label class="label cursor-pointer">
                      <span class="label-text">{{ $t('user.roleChanges') }}</span>
                      <input
                        v-model="form.notificationSettings.inApp.roleChanges"
                        type="checkbox"
                        class="toggle toggle-primary"
                      />
                    </label>
                  </div>
                  <div class="form-control">
                    <label class="label cursor-pointer">
                      <span class="label-text">{{ $t('user.systemUpdates') }}</span>
                      <input
                        v-model="form.notificationSettings.inApp.systemUpdates"
                        type="checkbox"
                        class="toggle toggle-primary"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex justify-end gap-3 pt-6 border-t border-base-300">
            <button type="button" class="btn btn-ghost" @click="$emit('close')">
              {{ $t('common.cancel') }}
            </button>
            <button type="button" class="btn btn-outline" @click="resetForm">
              {{ $t('common.reset') }}
            </button>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              <span v-if="loading" class="loading loading-spinner loading-sm"></span>
              {{ $t('common.save') }}
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
import { useUserStore } from '@/stores/hub/user'
import type { UserProfile, UpdateUserProfilePayload } from '@/types/user'

interface Props {
  user: UserProfile | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (event: 'close'): void
  (event: 'saved', user: UserProfile): void
}>()

const { t } = useI18n()
const userStore = useUserStore()

// Reactive data
const activeTab = ref('basic')
const loading = ref(false)
const errors = ref<Record<string, string>>({})

// Form data
const form = reactive<UpdateUserProfilePayload>({
  displayName: '',
  bio: '',
  location: '',
  phone: '',
  website: '',
  socialLinks: {
    twitter: '',
    linkedin: '',
    facebook: '',
    instagram: '',
  },
  preferences: {
    theme: 'light',
    language: 'en',
    timezone: 'Africa/Johannesburg',
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    privacyLevel: 'community',
    showOnlineStatus: true,
    showLastSeen: true,
    allowDirectMessages: true,
    allowEventInvites: true,
    allowFriendRequests: true,
  },
  visibility: {
    email: 'community',
    phone: 'private',
    location: 'community',
    bio: 'public',
    socialLinks: 'public',
    activityHistory: 'community',
    onlineStatus: 'public',
    lastSeen: 'public',
  },
  notificationSettings: {
    email: {
      newMessages: true,
      mentions: true,
      eventInvites: true,
      eventReminders: true,
      roleChanges: true,
      systemUpdates: true,
    },
    push: {
      newMessages: true,
      mentions: true,
      eventInvites: true,
      eventReminders: true,
      roleChanges: true,
      systemUpdates: true,
    },
    sms: {
      urgentMessages: true,
      emergencyAlerts: true,
      systemUpdates: false,
    },
    inApp: {
      newMessages: true,
      mentions: true,
      reactions: true,
      eventUpdates: true,
      roleChanges: true,
      systemUpdates: true,
    },
  },
})

// Avatar handling
const avatarFile = ref<File | null>(null)

// Tabs configuration
const tabs = [
  {
    id: 'basic',
    label: t('user.basicInformation'),
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  },
  {
    id: 'contact',
    label: t('user.contactInformation'),
    icon: 'M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  },
  {
    id: 'social',
    label: t('user.socialLinks'),
    icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
  },
  {
    id: 'preferences',
    label: t('user.preferences'),
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
  },
  {
    id: 'privacy',
    label: t('user.privacySettings'),
    icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
  },
  {
    id: 'notifications',
    label: t('user.notificationSettings'),
    icon: 'M15 17h5l-5 5v-5zM4.828 7l2.586 2.586a2 2 0 002.828 0L16 7M4.828 7H9m-4.172 0a2 2 0 012-2h2.586a2 2 0 011.414.586L15 7M4.828 7l-1.414-1.414A2 2 0 014.828 4.172M9 7h6m0 0v6m0-6l2.586-2.586A2 2 0 0118.828 4.172L16 7',
  },
]

// Methods
function initializeForm() {
  if (props.user) {
    form.displayName = props.user.displayName || ''
    form.bio = props.user.bio || ''
    form.location = props.user.location || ''
    form.phone = props.user.phone || ''
    form.website = props.user.website || ''
    form.socialLinks = { ...props.user.socialLinks } || {}
    form.preferences = { ...props.user.preferences }
    form.visibility = { ...props.user.visibility }
    form.notificationSettings = { ...props.user.notificationSettings }
  }
}

function validateForm(): boolean {
  errors.value = {}

  // Display name validation
  if (!form.displayName?.trim()) {
    errors.value.displayName = t('user.errors.displayNameRequired')
  } else if (form.displayName.length < 2) {
    errors.value.displayName = t('user.errors.displayNameTooShort')
  } else if (form.displayName.length > 50) {
    errors.value.displayName = t('user.errors.displayNameTooLong')
  }

  // Username validation
  if (!form.username?.trim()) {
    errors.value.username = t('user.errors.usernameRequired')
  } else if (!/^[a-zA-Z0-9_-]+$/.test(form.username)) {
    errors.value.username = t('user.errors.usernameInvalid')
  } else if (form.username.length < 3) {
    errors.value.username = t('user.errors.usernameTooShort')
  } else if (form.username.length > 30) {
    errors.value.username = t('user.errors.usernameTooLong')
  }

  // Email validation
  if (!form.email?.trim()) {
    errors.value.email = t('user.errors.emailRequired')
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.value.email = t('user.errors.emailInvalid')
  }

  // Bio validation
  if (form.bio && form.bio.length > 500) {
    errors.value.bio = t('user.errors.bioTooLong')
  }

  // Phone validation
  if (form.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(form.phone)) {
    errors.value.phone = t('user.errors.phoneInvalid')
  }

  // Website validation
  if (
    form.website &&
    !/^(https?:\/\/)?([a-zA-Z0-9]([a-zA-Z0-9\\-].*[a-zA-Z0-9])?\.)+[a-zA-Z].*$/.test(form.website)
  ) {
    errors.value.website = t('user.errors.websiteInvalid')
  }

  // Social links validation
  if (
    form.socialLinks?.twitter &&
    !/^https?:\/\/(www\.)?twitter\.com\/[a-zA-Z0-9_]+$/.test(form.socialLinks.twitter)
  ) {
    errors.value.socialLinks = {
      ...errors.value.socialLinks,
      twitter: t('user.errors.twitterInvalid'),
    }
  }

  if (
    form.socialLinks?.linkedin &&
    !/^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/.test(form.socialLinks.linkedin)
  ) {
    errors.value.socialLinks = {
      ...errors.value.socialLinks,
      linkedin: t('user.errors.linkedinInvalid'),
    }
  }

  if (
    form.socialLinks?.facebook &&
    !/^https?:\/\/(www\.)?facebook\.com\/[a-zA-Z0-9.]+$/.test(form.socialLinks.facebook)
  ) {
    errors.value.socialLinks = {
      ...errors.value.socialLinks,
      facebook: t('user.errors.facebookInvalid'),
    }
  }

  if (
    form.socialLinks?.instagram &&
    !/^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9_.]+$/.test(form.socialLinks.instagram)
  ) {
    errors.value.socialLinks = {
      ...errors.value.socialLinks,
      instagram: t('user.errors.instagramInvalid'),
    }
  }

  return Object.keys(errors.value).length === 0
}

async function handleSubmit() {
  if (!validateForm()) {
    return
  }

  if (!props.user) {
    return
  }

  loading.value = true
  errors.value = {}

  try {
    // Upload avatar if changed
    if (avatarFile.value) {
      await userStore.uploadAvatar(props.user.id, avatarFile.value)
    }

    // Update profile
    const updatedUser = await userStore.updateUserProfile(props.user.id, form)
    emit('saved', updatedUser)
  } catch (error) {
    console.error('Failed to update profile:', error)
    errors.value.general = error instanceof Error ? error.message : t('user.errors.updateFailed')
  } finally {
    loading.value = false
  }
}

function handleAvatarChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      errors.value.avatar = t('user.errors.avatarInvalidType')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      errors.value.avatar = t('user.errors.avatarTooLarge')
      return
    }

    avatarFile.value = file

    // Create preview URL
    const reader = new FileReader()
    reader.onload = (e) => {
      form.avatar = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

function removeAvatar() {
  avatarFile.value = null
  form.avatar = undefined
}

function resetForm() {
  initializeForm()
  avatarFile.value = null
  errors.value = {}
}

// Lifecycle
onMounted(() => {
  initializeForm()
})

// Watch for user changes
watch(
  () => props.user,
  () => {
    initializeForm()
  },
)
</script>

<style scoped>
.profile-editor {
  @apply max-w-4xl mx-auto;
}

.tabs {
  @apply flex-wrap;
}

.tab {
  @apply transition-all duration-200;
}

.tab:hover {
  @apply transform scale-105;
}

.form-control {
  @apply transition-all duration-200;
}

.input,
.textarea,
.select {
  @apply transition-all duration-200;
}

.input:focus,
.textarea:focus,
.select:focus {
  @apply transform scale-105;
}

.toggle {
  @apply transition-all duration-200;
}

.toggle:hover {
  @apply transform scale-110;
}

.btn {
  @apply transition-all duration-200;
}

.btn:hover {
  @apply transform scale-105;
}

.card {
  @apply transition-all duration-200;
}

.avatar {
  @apply transition-all duration-200;
}

.avatar:hover {
  @apply transform scale-105;
}
</style>
