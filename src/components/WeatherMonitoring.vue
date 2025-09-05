<template>
  <v-card class="elevation-2">
    <v-card-title class="d-flex align-center">
      <v-icon class="mr-2" color="primary">mdi-weather-cloudy</v-icon>
      {{ $t('weather.title') }}
      <v-spacer />
      <v-btn
        color="primary"
        variant="outlined"
        size="small"
        @click="handleRefresh"
        :loading="isLoading"
      >
        <v-icon start>mdi-refresh</v-icon>
        {{ $t('weather.refresh') }}
      </v-btn>
    </v-card-title>

    <v-card-text>
      <!-- Current Weather -->
      <v-row class="mb-4">
        <v-col cols="12" md="6">
          <v-card
            :color="getWeatherColor(currentWeather.condition)"
            variant="tonal"
            class="text-center"
          >
            <v-card-text>
              <v-icon :color="getWeatherIconColor(currentWeather.condition)" size="64" class="mb-2">
                {{ getWeatherIcon(currentWeather.condition) }}
              </v-icon>
              <div class="text-h3 font-weight-bold">{{ currentWeather.temperature }}°C</div>
              <div class="text-h6">{{ $t(`weather.conditions.${currentWeather.condition}`) }}</div>
              <div class="text-caption">
                {{ $t('weather.feelsLike', { temp: currentWeather.feelsLike }) }}
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-list density="compact">
            <v-list-item>
              <template #prepend>
                <v-icon>mdi-water</v-icon>
              </template>
              <v-list-item-title>{{ $t('weather.humidity') }}</v-list-item-title>
              <v-list-item-subtitle>{{ currentWeather.humidity }}%</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <template #prepend>
                <v-icon>mdi-weather-windy</v-icon>
              </template>
              <v-list-item-title>{{ $t('weather.windSpeed') }}</v-list-item-title>
              <v-list-item-subtitle>{{ currentWeather.windSpeed }} km/h</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <template #prepend>
                <v-icon>mdi-eye</v-icon>
              </template>
              <v-list-item-title>{{ $t('weather.visibility') }}</v-list-item-title>
              <v-list-item-subtitle>{{ currentWeather.visibility }} km</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <template #prepend>
                <v-icon>mdi-gauge</v-icon>
              </template>
              <v-list-item-title>{{ $t('weather.pressure') }}</v-list-item-title>
              <v-list-item-subtitle>{{ currentWeather.pressure }} hPa</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-col>
      </v-row>

      <!-- Weather Alerts -->
      <v-alert
        v-if="weatherAlerts.length > 0"
        :type="getAlertType(weatherAlerts[0]?.severity || 'low')"
        variant="tonal"
        class="mb-4"
      >
        <template #prepend>
          <v-icon>{{ getAlertIcon(weatherAlerts[0]?.severity || 'low') }}</v-icon>
        </template>
        <div>
          <div class="font-weight-bold">{{ weatherAlerts[0]?.title }}</div>
          <div class="text-caption">{{ weatherAlerts[0]?.description }}</div>
        </div>
      </v-alert>

      <!-- Hourly Forecast -->
      <v-card class="mb-4" variant="outlined">
        <v-card-title class="text-h6">
          <v-icon class="mr-2">mdi-clock-outline</v-icon>
          {{ $t('weather.hourlyForecast') }}
        </v-card-title>
        <v-card-text>
          <v-slide-group show-arrows>
            <v-slide-group-item v-for="(hour, index) in hourlyForecast" :key="index">
              <v-card class="ma-2" width="120" height="140" variant="outlined">
                <v-card-text class="text-center">
                  <div class="text-caption mb-2">{{ formatHour(hour.time) }}</div>
                  <v-icon :color="getWeatherIconColor(hour.condition)" size="32" class="mb-2">
                    {{ getWeatherIcon(hour.condition) }}
                  </v-icon>
                  <div class="text-h6 font-weight-bold">{{ hour.temperature }}°</div>
                  <div class="text-caption">{{ hour.precipitation }}%</div>
                </v-card-text>
              </v-card>
            </v-slide-group-item>
          </v-slide-group>
        </v-card-text>
      </v-card>

      <!-- Daily Forecast -->
      <v-card variant="outlined">
        <v-card-title class="text-h6">
          <v-icon class="mr-2">mdi-calendar</v-icon>
          {{ $t('weather.dailyForecast') }}
        </v-card-title>
        <v-card-text>
          <v-list>
            <v-list-item v-for="(day, index) in dailyForecast" :key="index">
              <template #prepend>
                <v-icon :color="getWeatherIconColor(day.condition)" size="24">
                  {{ getWeatherIcon(day.condition) }}
                </v-icon>
              </template>
              <v-list-item-title>{{ formatDay(day.date) }}</v-list-item-title>
              <v-list-item-subtitle>{{
                $t(`weather.conditions.${day.condition}`)
              }}</v-list-item-subtitle>
              <template #append>
                <div class="d-flex align-center">
                  <div class="text-h6 font-weight-bold mr-4">
                    {{ day.maxTemp }}° / {{ day.minTemp }}°
                  </div>
                  <v-progress-linear
                    :model-value="day.precipitation"
                    color="info"
                    height="4"
                    width="60"
                    rounded
                  />
                  <span class="text-caption ml-2">{{ day.precipitation }}%</span>
                </div>
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>

      <!-- Agricultural Recommendations -->
      <v-card class="mt-4" variant="outlined" color="info">
        <v-card-title class="text-h6">
          <v-icon class="mr-2">mdi-sprout</v-icon>
          {{ $t('weather.recommendations.title') }}
        </v-card-title>
        <v-card-text>
          <v-list density="compact">
            <v-list-item
              v-for="recommendation in agriculturalRecommendations"
              :key="recommendation.id"
            >
              <template #prepend>
                <v-icon
                  :color="
                    recommendation.priority === 'high'
                      ? 'error'
                      : recommendation.priority === 'medium'
                        ? 'warning'
                        : 'info'
                  "
                >
                  {{ recommendation.icon }}
                </v-icon>
              </template>
              <v-list-item-title>{{ $t(recommendation.title) }}</v-list-item-title>
              <v-list-item-subtitle>{{ $t(recommendation.description) }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

// TypeScript interfaces
interface WeatherData {
  temperature: number
  feelsLike: number
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'foggy' | 'snowy'
  humidity: number
  windSpeed: number
  visibility: number
  pressure: number
  uvIndex: number
}

interface WeatherAlert {
  id: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  startTime: Date
  endTime: Date
}

interface HourlyForecast {
  time: Date
  temperature: number
  condition: string
  precipitation: number
  windSpeed: number
}

interface DailyForecast {
  date: Date
  maxTemp: number
  minTemp: number
  condition: string
  precipitation: number
  windSpeed: number
}

interface AgriculturalRecommendation {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  icon: string
  applicable: boolean
}

interface Props {
  farmId?: string
  autoRefresh?: boolean
  refreshInterval?: number
}

interface Emits {
  (e: 'refresh'): void
  (e: 'alert-clicked', alert: WeatherAlert): void
  (e: 'recommendation-clicked', recommendation: AgriculturalRecommendation): void
}

const props = withDefaults(defineProps<Props>(), {
  farmId: '',
  autoRefresh: true,
  refreshInterval: 300000, // 5 minutes
})

const emit = defineEmits<Emits>()

// Composables
const { t, locale } = useI18n()

// Reactive data
const isLoading = ref(false)

// Mock data
const currentWeather = computed<WeatherData>(() => ({
  temperature: 24,
  feelsLike: 26,
  condition: 'cloudy',
  humidity: 65,
  windSpeed: 12,
  visibility: 10,
  pressure: 1013,
  uvIndex: 6,
}))

const weatherAlerts = computed<WeatherAlert[]>(() => [
  {
    id: '1',
    title: 'Heavy Rain Warning',
    description: 'Heavy rainfall expected this evening. Secure equipment and livestock.',
    severity: 'high',
    startTime: new Date(Date.now() + 1000 * 60 * 60 * 2),
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 8),
  },
])

const hourlyForecast = computed<HourlyForecast[]>(() => [
  {
    time: new Date(Date.now() + 1000 * 60 * 60 * 0),
    temperature: 24,
    condition: 'cloudy',
    precipitation: 20,
    windSpeed: 12,
  },
  {
    time: new Date(Date.now() + 1000 * 60 * 60 * 1),
    temperature: 23,
    condition: 'cloudy',
    precipitation: 30,
    windSpeed: 15,
  },
  {
    time: new Date(Date.now() + 1000 * 60 * 60 * 2),
    temperature: 22,
    condition: 'rainy',
    precipitation: 80,
    windSpeed: 18,
  },
  {
    time: new Date(Date.now() + 1000 * 60 * 60 * 3),
    temperature: 20,
    condition: 'stormy',
    precipitation: 95,
    windSpeed: 25,
  },
  {
    time: new Date(Date.now() + 1000 * 60 * 60 * 4),
    temperature: 19,
    condition: 'rainy',
    precipitation: 70,
    windSpeed: 20,
  },
  {
    time: new Date(Date.now() + 1000 * 60 * 60 * 5),
    temperature: 18,
    condition: 'cloudy',
    precipitation: 40,
    windSpeed: 15,
  },
  {
    time: new Date(Date.now() + 1000 * 60 * 60 * 6),
    temperature: 17,
    condition: 'cloudy',
    precipitation: 20,
    windSpeed: 12,
  },
  {
    time: new Date(Date.now() + 1000 * 60 * 60 * 7),
    temperature: 16,
    condition: 'foggy',
    precipitation: 10,
    windSpeed: 8,
  },
])

const dailyForecast = computed<DailyForecast[]>(() => [
  {
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 0),
    maxTemp: 24,
    minTemp: 16,
    condition: 'cloudy',
    precipitation: 60,
    windSpeed: 15,
  },
  {
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1),
    maxTemp: 26,
    minTemp: 18,
    condition: 'sunny',
    precipitation: 10,
    windSpeed: 8,
  },
  {
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
    maxTemp: 28,
    minTemp: 20,
    condition: 'sunny',
    precipitation: 5,
    windSpeed: 6,
  },
  {
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
    maxTemp: 25,
    minTemp: 19,
    condition: 'cloudy',
    precipitation: 30,
    windSpeed: 10,
  },
  {
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4),
    maxTemp: 22,
    minTemp: 17,
    condition: 'rainy',
    precipitation: 70,
    windSpeed: 14,
  },
])

const agriculturalRecommendations = computed<AgriculturalRecommendation[]>(() => [
  {
    id: '1',
    title: 'weather.recommendations.irrigation',
    description: 'weather.recommendations.irrigationDesc',
    priority: 'medium',
    icon: 'mdi-water',
    applicable: true,
  },
  {
    id: '2',
    title: 'weather.recommendations.planting',
    description: 'weather.recommendations.plantingDesc',
    priority: 'high',
    icon: 'mdi-sprout',
    applicable: true,
  },
  {
    id: '3',
    title: 'weather.recommendations.equipment',
    description: 'weather.recommendations.equipmentDesc',
    priority: 'high',
    icon: 'mdi-tools',
    applicable: true,
  },
])

// Methods
const getWeatherIcon = (condition: string) => {
  const icons = {
    sunny: 'mdi-weather-sunny',
    cloudy: 'mdi-weather-cloudy',
    rainy: 'mdi-weather-rainy',
    stormy: 'mdi-weather-lightning-rainy',
    foggy: 'mdi-weather-fog',
    snowy: 'mdi-weather-snowy',
  }
  return icons[condition as keyof typeof icons] || 'mdi-weather-cloudy'
}

const getWeatherIconColor = (condition: string) => {
  const colors = {
    sunny: 'warning',
    cloudy: 'info',
    rainy: 'primary',
    stormy: 'error',
    foggy: 'grey',
    snowy: 'blue',
  }
  return colors[condition as keyof typeof colors] || 'info'
}

const getWeatherColor = (condition: string) => {
  const colors = {
    sunny: 'warning',
    cloudy: 'info',
    rainy: 'primary',
    stormy: 'error',
    foggy: 'grey',
    snowy: 'blue',
  }
  return colors[condition as keyof typeof colors] || 'info'
}

const getAlertType = (severity: string): 'error' | 'success' | 'warning' | 'info' => {
  const types = {
    low: 'info' as const,
    medium: 'warning' as const,
    high: 'error' as const,
    critical: 'error' as const,
  }
  return types[severity as keyof typeof types] || 'info'
}

const getAlertIcon = (severity: string) => {
  const icons = {
    low: 'mdi-information',
    medium: 'mdi-alert',
    high: 'mdi-alert-circle',
    critical: 'mdi-alert-octagon',
  }
  return icons[severity as keyof typeof icons] || 'mdi-information'
}

const formatHour = (date: Date): string => {
  return new Intl.DateTimeFormat(locale.value, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const formatDay = (date: Date): string => {
  return new Intl.DateTimeFormat(locale.value, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

const handleRefresh = () => {
  isLoading.value = true
  emit('refresh')
  setTimeout(() => {
    isLoading.value = false
  }, 1000)
}
</script>

<i18n>
{
  "en": {
    "weather": {
      "title": "Weather Monitoring",
      "refresh": "Refresh",
      "humidity": "Humidity",
      "windSpeed": "Wind Speed",
      "visibility": "Visibility",
      "pressure": "Pressure",
      "feelsLike": "Feels like {temp}°C",
      "conditions": {
        "sunny": "Sunny",
        "cloudy": "Cloudy",
        "rainy": "Rainy",
        "stormy": "Stormy",
        "foggy": "Foggy",
        "snowy": "Snowy"
      },
      "hourlyForecast": "Hourly Forecast",
      "dailyForecast": "7-Day Forecast",
      "recommendations": {
        "title": "Agricultural Recommendations",
        "irrigation": "Irrigation Schedule",
        "irrigationDesc": "Consider reducing irrigation due to expected rainfall",
        "planting": "Planting Conditions",
        "plantingDesc": "Optimal conditions for planting in the next 2 days",
        "equipment": "Equipment Protection",
        "equipmentDesc": "Secure outdoor equipment before the storm arrives"
      }
    }
  },
  "af": {
    "weather": {
      "title": "Weer Monitering",
      "refresh": "Verfris",
      "humidity": "Vog",
      "windSpeed": "Wind Spoed",
      "visibility": "Sigbaarheid",
      "pressure": "Druk",
      "feelsLike": "Voel soos {temp}°C",
      "conditions": {
        "sunny": "Sonnig",
        "cloudy": "Bewolk",
        "rainy": "Reënerig",
        "stormy": "Stormerig",
        "foggy": "Mistig",
        "snowy": "Sneeu"
      },
      "hourlyForecast": "Uurlikse Voorspelling",
      "dailyForecast": "7-Dag Voorspelling",
      "recommendations": {
        "title": "Landbou Aanbevelings",
        "irrigation": "Besproeiing Skedule",
        "irrigationDesc": "Oorweeg om besproeiing te verminder weens verwagte reënval",
        "planting": "Planting Toestande",
        "plantingDesc": "Optimale toestande vir planting in die volgende 2 dae",
        "equipment": "Toerusting Beskerming",
        "equipmentDesc": "Beveilig buite toerusting voor die storm aankom"
      }
    }
  }
}
</i18n>
