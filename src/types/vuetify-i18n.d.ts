import type { DefineComponent } from 'vue'
import type { Composer, I18n } from 'vue-i18n'
import type { LocaleInstance } from 'vuetify'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    // vue-i18n methods
    $t: (key: string, ...args: any[]) => string
    $tc: (key: string, choice?: number, ...args: any[]) => string
    $te: (key: string) => boolean
    $d: (value: Date | number, key?: string) => string
    $n: (value: number, key?: string) => string
    $tm: (key: string) => any
    $rt: (message: string) => string

    // Vuetify locale methods
    $vuetify: {
      locale: LocaleInstance
      theme: any
    }
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    // vue-i18n methods
    $t: (key: string, ...args: any[]) => string
    $tc: (key: string, choice?: number, ...args: any[]) => string
    $te: (key: string) => boolean
    $d: (value: Date | number, key?: string) => string
    $n: (value: number, key?: string) => string
    $tm: (key: string) => any
    $rt: (message: string) => string

    // Vuetify locale methods
    $vuetify: {
      locale: LocaleInstance
      theme: any
    }
  }
}

// Vuetify locale integration is handled by createVueI18nAdapter

// Type definitions for our locale messages
export interface LocaleMessages {
  app: {
    title: string
    language: string
    english: string
    afrikaans: string
    login: string
    register: string
    logout: string
  }
  auth: {
    email: string
    password: string
    forgot: string
    haveAccount: string
    needAccount: string
    sendLink: string
    resetPassword: string
    newPassword: string
    confirm: string
  }
  $vuetify: {
    dataIterator: {
      noResultsText: string
      loadingText: string
    }
    dataTable: {
      itemsPerPageText: string
      ariaLabel: {
        sortDesc: string
        sortAsc: string
        sortNone: string
        activateNone: string
        activateDesc: string
        activateAsc: string
      }
      sortBy: string
    }
    noDataText: string
    carousel: {
      prev: string
      next: string
      ariaLabel: {
        delimiter: string
      }
    }
    calendar: {
      moreEvents: string
    }
    fileInput: {
      counter: string
      counterSize: string
    }
    timePicker: {
      am: string
      pm: string
    }
    pagination: {
      ariaLabel: {
        wrapper: string
        next: string
        previous: string
        page: string
        currentPage: string
      }
    }
    rating: {
      ariaLabel: {
        item: string
      }
    }
    loading: string
    infiniteLoading: {
      loadMore: string
      empty: string
    }
  }
}

export type AppLocale = 'en' | 'af'

export {}
