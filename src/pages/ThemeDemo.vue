<template>
  <div class="min-h-screen bg-base-100 text-base-content p-8">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="hero bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg mb-8">
        <div class="hero-content text-center">
          <div class="max-w-md">
            <h1 class="text-5xl font-bold mb-4">Theme Demo</h1>
            <p class="text-lg opacity-70 mb-6">
              Experience the power of DaisyUI themes with our comprehensive theme system
            </p>
            <div class="flex justify-center gap-4">
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      </div>

      <!-- Current Theme Info -->
      <div class="card bg-base-100 shadow-xl border border-base-300 mb-8">
        <div class="card-body">
          <h2 class="card-title text-2xl mb-4">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
              ></path>
            </svg>
            Current Theme
          </h2>
          <div class="flex items-center gap-4">
            <div class="text-4xl">{{ currentThemeData.icon }}</div>
            <div>
              <h3 class="text-xl font-bold">{{ currentThemeData.label }}</h3>
              <p class="text-sm opacity-70">
                {{ isDarkMode ? 'Dark mode' : 'Light mode' }} • Theme: {{ currentTheme }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Component Showcase -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Buttons -->
        <div class="card bg-base-100 shadow-xl border border-base-300">
          <div class="card-body">
            <h3 class="card-title mb-4">Buttons</h3>
            <div class="space-y-4">
              <div class="flex flex-wrap gap-2">
                <button class="btn btn-primary">Primary</button>
                <button class="btn btn-secondary">Secondary</button>
                <button class="btn btn-accent">Accent</button>
                <button class="btn btn-neutral">Neutral</button>
              </div>
              <div class="flex flex-wrap gap-2">
                <button class="btn btn-outline btn-primary">Outline</button>
                <button class="btn btn-ghost btn-secondary">Ghost</button>
                <button class="btn btn-link btn-accent">Link</button>
              </div>
              <div class="flex flex-wrap gap-2">
                <button class="btn btn-success">Success</button>
                <button class="btn btn-warning">Warning</button>
                <button class="btn btn-error">Error</button>
                <button class="btn btn-info">Info</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Form Elements -->
        <div class="card bg-base-100 shadow-xl border border-base-300">
          <div class="card-body">
            <h3 class="card-title mb-4">Form Elements</h3>
            <div class="space-y-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Input Field</span>
                </label>
                <input type="text" placeholder="Type here" class="input input-bordered w-full" />
              </div>
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Select</span>
                </label>
                <select class="select select-bordered w-full">
                  <option disabled selected>Pick one</option>
                  <option>Option 1</option>
                  <option>Option 2</option>
                </select>
              </div>
              <div class="form-control">
                <label class="label cursor-pointer">
                  <span class="label-text">Checkbox</span>
                  <input type="checkbox" class="checkbox checkbox-primary" />
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Cards -->
        <div class="card bg-base-100 shadow-xl border border-base-300">
          <div class="card-body">
            <h3 class="card-title mb-4">Cards & Alerts</h3>
            <div class="space-y-4">
              <div class="alert alert-success">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                <span>Success alert!</span>
              </div>
              <div class="alert alert-warning">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
                  ></path>
                </svg>
                <span>Warning alert!</span>
              </div>
              <div class="alert alert-error">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <span>Error alert!</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Badges & Progress -->
        <div class="card bg-base-100 shadow-xl border border-base-300">
          <div class="card-body">
            <h3 class="card-title mb-4">Badges & Progress</h3>
            <div class="space-y-4">
              <div class="flex flex-wrap gap-2">
                <div class="badge badge-primary">Primary</div>
                <div class="badge badge-secondary">Secondary</div>
                <div class="badge badge-accent">Accent</div>
                <div class="badge badge-success">Success</div>
                <div class="badge badge-warning">Warning</div>
                <div class="badge badge-error">Error</div>
              </div>
              <div class="space-y-2">
                <div class="text-sm">Progress Bar</div>
                <progress class="progress progress-primary w-full" value="70" max="100"></progress>
              </div>
              <div class="space-y-2">
                <div class="text-sm">Radial Progress</div>
                <div class="radial-progress text-primary" style="--value: 70">70%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Color Palette -->
      <div class="card bg-base-100 shadow-xl border border-base-300">
        <div class="card-body">
          <h3 class="card-title text-2xl mb-6">Color Palette</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div class="text-center">
              <div class="w-16 h-16 bg-primary rounded-lg mx-auto mb-2"></div>
              <div class="text-sm font-medium">Primary</div>
            </div>
            <div class="text-center">
              <div class="w-16 h-16 bg-secondary rounded-lg mx-auto mb-2"></div>
              <div class="text-sm font-medium">Secondary</div>
            </div>
            <div class="text-center">
              <div class="w-16 h-16 bg-accent rounded-lg mx-auto mb-2"></div>
              <div class="text-sm font-medium">Accent</div>
            </div>
            <div class="text-center">
              <div class="w-16 h-16 bg-neutral rounded-lg mx-auto mb-2"></div>
              <div class="text-sm font-medium">Neutral</div>
            </div>
            <div class="text-center">
              <div
                class="w-16 h-16 bg-base-100 border border-base-300 rounded-lg mx-auto mb-2"
              ></div>
              <div class="text-sm font-medium">Base 100</div>
            </div>
            <div class="text-center">
              <div class="w-16 h-16 bg-base-200 rounded-lg mx-auto mb-2"></div>
              <div class="text-sm font-medium">Base 200</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'

const { currentTheme, currentThemeData, isDarkMode } = useTheme()
</script>
