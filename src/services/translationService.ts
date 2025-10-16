/**
 * Translation Service
 * Handles text translation between languages
 * Part of User Story 2: Multilingual Community Interface
 */

import type { Language } from '@/types/communication'

export interface TranslationResult {
  translatedText: string
  sourceLanguage: string
  targetLanguage: string
  confidence: number
  isRTL: boolean
}

export interface TranslationOptions {
  sourceLanguage?: string
  targetLanguage: string
  preserveFormatting?: boolean
  context?: string
}

export class TranslationService {
  private cache: Map<string, TranslationResult> = new Map()
  private cacheExpiry: Map<string, number> = new Map()
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

  /**
   * Translate text from one language to another
   */
  async translate(text: string, options: TranslationOptions): Promise<TranslationResult> {
    const { sourceLanguage = 'auto', targetLanguage, preserveFormatting = true, context } = options

    // Check cache first
    const cacheKey = this.getCacheKey(text, sourceLanguage, targetLanguage)
    const cached = this.getCachedTranslation(cacheKey)
    if (cached) {
      return cached
    }

    try {
      // Detect source language if auto
      const detectedLanguage =
        sourceLanguage === 'auto' ? await this.detectLanguage(text) : sourceLanguage

      // Check if translation is needed
      if (detectedLanguage === targetLanguage) {
        const result: TranslationResult = {
          translatedText: text,
          sourceLanguage: detectedLanguage,
          targetLanguage,
          confidence: 1.0,
          isRTL: this.isRTLLanguage(targetLanguage),
        }
        this.setCachedTranslation(cacheKey, result)
        return result
      }

      // Perform translation
      const translatedText = await this.performTranslation(
        text,
        detectedLanguage,
        targetLanguage,
        context,
      )

      const result: TranslationResult = {
        translatedText,
        sourceLanguage: detectedLanguage,
        targetLanguage,
        confidence: 0.8, // Placeholder confidence
        isRTL: this.isRTLLanguage(targetLanguage),
      }

      // Cache the result
      this.setCachedTranslation(cacheKey, result)

      return result
    } catch (error) {
      console.error('Translation failed:', error)
      throw new Error('Translation service unavailable')
    }
  }

  /**
   * Detect language of text
   */
  async detectLanguage(text: string): Promise<string> {
    // Simple language detection based on common words
    // In a real implementation, you'd use a proper language detection service

    const afrikaansWords = [
      'die',
      'en',
      'van',
      'is',
      'in',
      'te',
      'vir',
      'met',
      'op',
      'aan',
      'dat',
      'nie',
      'wat',
      'jy',
      'ek',
      'ons',
      'hulle',
      'sy',
      'haar',
      'hierdie',
      'daardie',
    ]
    const englishWords = [
      'the',
      'and',
      'of',
      'is',
      'in',
      'to',
      'for',
      'with',
      'on',
      'at',
      'that',
      'not',
      'what',
      'you',
      'i',
      'we',
      'they',
      'he',
      'she',
      'this',
      'that',
    ]

    const words = text.toLowerCase().split(/\s+/)
    let afrikaansCount = 0
    let englishCount = 0

    words.forEach((word) => {
      if (afrikaansWords.includes(word)) afrikaansCount++
      if (englishWords.includes(word)) englishCount++
    })

    if (afrikaansCount > englishCount) {
      return 'af'
    } else if (englishCount > afrikaansCount) {
      return 'en'
    } else {
      return 'en' // Default to English
    }
  }

  /**
   * Perform actual translation
   */
  private async performTranslation(
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
    context?: string,
  ): Promise<string> {
    // This is a placeholder implementation
    // In a real application, you would integrate with a translation service like:
    // - Google Translate API
    // - Microsoft Translator
    // - DeepL API
    // - AWS Translate

    // For now, we'll use a simple mapping for demonstration
    const translations: Record<string, Record<string, string>> = {
      en: {
        af: this.translateEnglishToAfrikaans(text),
      },
      af: {
        en: this.translateAfrikaansToEnglish(text),
      },
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const translation = translations[sourceLanguage]?.[targetLanguage]
    if (translation) {
      return translation
    }

    // If no translation available, return original text
    return text
  }

  /**
   * Simple English to Afrikaans translation (placeholder)
   */
  private translateEnglishToAfrikaans(text: string): string {
    const translations: Record<string, string> = {
      hello: 'hallo',
      world: 'wêreld',
      good: 'goed',
      morning: 'oggend',
      afternoon: 'middag',
      evening: 'aand',
      night: 'nag',
      'thank you': 'dankie',
      please: 'asseblief',
      yes: 'ja',
      no: 'nee',
      'how are you': 'hoe gaan dit',
      fine: 'goed',
      bad: 'sleg',
      beautiful: 'mooi',
      ugly: 'lelik',
      big: 'groot',
      small: 'klein',
      hot: 'warm',
      cold: 'koud',
      new: 'nuut',
      old: 'oud',
      young: 'jonk',
      happy: 'gelukkig',
      sad: 'hartseer',
      angry: 'kwaad',
      tired: 'moeg',
      hungry: 'honger',
      thirsty: 'dors',
      sick: 'siek',
      healthy: 'gesond',
      rich: 'ryk',
      poor: 'arm',
      fast: 'vinnig',
      slow: 'stadig',
      easy: 'maklik',
      difficult: 'moeilik',
      important: 'belangrik',
      interesting: 'interessant',
      boring: 'vervelig',
      funny: 'snaaks',
      serious: 'ernstig',
      dangerous: 'gevaarlik',
      safe: 'veilig',
      free: 'vry',
      busy: 'besig',
      quiet: 'stil',
      loud: 'hard',
      clean: 'skoon',
      dirty: 'vuil',
      full: 'vol',
      empty: 'leeg',
      open: 'oop',
      closed: 'toe',
      high: 'hoog',
      low: 'laag',
      long: 'lank',
      short: 'kort',
      wide: 'wyd',
      narrow: 'smal',
      thick: 'dik',
      thin: 'dun',
      heavy: 'swaar',
      light: 'lig',
      dark: 'donker',
      bright: 'helder',
      soft: 'sag',
      hard: 'hard',
      smooth: 'glad',
      rough: 'ruw',
      wet: 'nat',
      dry: 'droog',
      fresh: 'vars',
      stale: 'oud',
      sweet: 'soet',
      sour: 'suur',
      bitter: 'bitter',
      salty: 'sout',
      spicy: 'pittig',
      mild: 'sag',
      strong: 'sterk',
      weak: 'swak',
      loud: 'hard',
      quiet: 'stil',
      fast: 'vinnig',
      slow: 'stadig',
      early: 'vroeg',
      late: 'laat',
      soon: 'gou',
      now: 'nou',
      then: 'toe',
      here: 'hier',
      there: 'daar',
      where: 'waar',
      when: 'wanneer',
      why: 'waarom',
      how: 'hoe',
      what: 'wat',
      who: 'wie',
      which: 'watter',
      whose: 'wie se',
      this: 'hierdie',
      that: 'daardie',
      these: 'hierdie',
      those: 'daardie',
      all: 'al',
      some: 'sommige',
      many: 'baie',
      much: 'baie',
      few: 'min',
      little: 'min',
      more: 'meer',
      most: 'meeste',
      less: 'minder',
      least: 'minste',
      enough: 'genoeg',
      too: 'te',
      very: 'baie',
      quite: 'redelik',
      rather: 'eerder',
      pretty: 'mooi',
      really: 'regtig',
      actually: 'eintlik',
      probably: 'waarskynlik',
      maybe: 'miskien',
      perhaps: 'miskien',
      certainly: 'sekerlik',
      definitely: 'beslis',
      absolutely: 'absoluut',
      never: 'nooit',
      always: 'altyd',
      sometimes: 'soms',
      often: 'dikwels',
      usually: 'gewoonlik',
      rarely: 'selde',
      hardly: 'skaars',
      almost: 'amper',
      nearly: 'amper',
      about: 'oor',
      around: 'rondom',
      approximately: 'ongeveer',
      exactly: 'presies',
      just: 'net',
      only: 'net',
      also: 'ook',
      too: 'ook',
      either: 'ook',
      neither: 'ook nie',
      both: 'beide',
      either: 'een van die twee',
      neither: 'geen van die twee nie',
      all: 'al',
      every: 'elke',
      each: 'elke',
      any: 'enige',
      some: 'sommige',
      no: 'geen',
      none: 'geen',
      nothing: 'niks',
      something: 'iets',
      anything: 'enigiets',
      everything: 'alles',
      someone: 'iemand',
      anyone: 'enigiemand',
      everyone: 'almal',
      nobody: 'niemand',
      somebody: 'iemand',
      anybody: 'enigiemand',
      everybody: 'almal',
      somewhere: 'iewers',
      anywhere: 'enige plek',
      everywhere: 'oral',
      nowhere: 'nêrens',
      sometime: 'eendag',
      anytime: 'enige tyd',
      everytime: 'elke keer',
      never: 'nooit',
      always: 'altyd',
      forever: 'vir altyd',
      once: 'een keer',
      twice: 'twee keer',
      again: 'weer',
      back: 'terug',
      forward: 'vorentoe',
      up: 'op',
      down: 'af',
      in: 'in',
      out: 'uit',
      on: 'op',
      off: 'af',
      over: 'oor',
      under: 'onder',
      above: 'bo',
      below: 'onder',
      between: 'tussen',
      among: 'onder',
      through: 'deur',
      across: 'oor',
      around: 'rondom',
      near: 'naby',
      far: 'ver',
      close: 'naby',
      distant: 'ver',
      inside: 'binne',
      outside: 'buite',
      within: 'binne',
      without: 'sonder',
      with: 'met',
      against: 'teen',
      towards: 'na',
      away: 'weg',
      toward: 'na',
      from: 'van',
      to: 'na',
      for: 'vir',
      of: 'van',
      by: 'deur',
      about: 'oor',
      concerning: 'oor',
      regarding: 'oor',
      respecting: 'oor',
      touching: 'oor',
      considering: 'oorweeg',
      including: 'insluitend',
      excluding: 'uitgesluit',
      except: 'behalwe',
      besides: 'behalwe',
      beyond: 'buite',
      past: 'verby',
      since: 'sedert',
      until: 'tot',
      till: 'tot',
      during: 'tydens',
      while: 'terwyl',
      before: 'voor',
      after: 'na',
      behind: 'agter',
      ahead: 'voor',
      beyond: 'buite',
      past: 'verby',
      since: 'sedert',
      until: 'tot',
      till: 'tot',
      during: 'tydens',
      while: 'terwyl',
      before: 'voor',
      after: 'na',
      behind: 'agter',
      ahead: 'voor',
    }

    let translatedText = text.toLowerCase()

    // Replace common words
    for (const [english, afrikaans] of Object.entries(translations)) {
      const regex = new RegExp(`\\b${english}\\b`, 'gi')
      translatedText = translatedText.replace(regex, afrikaans)
    }

    return translatedText
  }

  /**
   * Simple Afrikaans to English translation (placeholder)
   */
  private translateAfrikaansToEnglish(text: string): string {
    const translations: Record<string, string> = {
      hallo: 'hello',
      wêreld: 'world',
      goed: 'good',
      oggend: 'morning',
      middag: 'afternoon',
      aand: 'evening',
      nag: 'night',
      dankie: 'thank you',
      asseblief: 'please',
      ja: 'yes',
      nee: 'no',
      'hoe gaan dit': 'how are you',
      mooi: 'beautiful',
      lelik: 'ugly',
      groot: 'big',
      klein: 'small',
      warm: 'hot',
      koud: 'cold',
      nuut: 'new',
      oud: 'old',
      jonk: 'young',
      gelukkig: 'happy',
      hartseer: 'sad',
      kwaad: 'angry',
      moeg: 'tired',
      honger: 'hungry',
      dors: 'thirsty',
      siek: 'sick',
      gesond: 'healthy',
      ryk: 'rich',
      arm: 'poor',
      vinnig: 'fast',
      stadig: 'slow',
      maklik: 'easy',
      moeilik: 'difficult',
      belangrik: 'important',
      interessant: 'interesting',
      vervelig: 'boring',
      snaaks: 'funny',
      ernstig: 'serious',
      gevaarlik: 'dangerous',
      veilig: 'safe',
      vry: 'free',
      besig: 'busy',
      stil: 'quiet',
      hard: 'loud',
      skoon: 'clean',
      vuil: 'dirty',
      vol: 'full',
      leeg: 'empty',
      oop: 'open',
      toe: 'closed',
      hoog: 'high',
      laag: 'low',
      lank: 'long',
      kort: 'short',
      wyd: 'wide',
      smal: 'narrow',
      dik: 'thick',
      dun: 'thin',
      swaar: 'heavy',
      lig: 'light',
      donker: 'dark',
      helder: 'bright',
      sag: 'soft',
      hard: 'hard',
      glad: 'smooth',
      ruw: 'rough',
      nat: 'wet',
      droog: 'dry',
      vars: 'fresh',
      oud: 'stale',
      soet: 'sweet',
      suur: 'sour',
      bitter: 'bitter',
      sout: 'salty',
      pittig: 'spicy',
      sag: 'mild',
      sterk: 'strong',
      swak: 'weak',
      vroeg: 'early',
      laat: 'late',
      gou: 'soon',
      nou: 'now',
      toe: 'then',
      hier: 'here',
      daar: 'there',
      waar: 'where',
      wanneer: 'when',
      waarom: 'why',
      hoe: 'how',
      wat: 'what',
      wie: 'who',
      watter: 'which',
      'wie se': 'whose',
      hierdie: 'this',
      daardie: 'that',
      al: 'all',
      sommige: 'some',
      baie: 'many',
      min: 'few',
      meer: 'more',
      meeste: 'most',
      minder: 'less',
      minste: 'least',
      genoeg: 'enough',
      te: 'too',
      redelik: 'quite',
      eerder: 'rather',
      regtig: 'really',
      eintlik: 'actually',
      waarskynlik: 'probably',
      miskien: 'maybe',
      sekerlik: 'certainly',
      beslis: 'definitely',
      absoluut: 'absolutely',
      nooit: 'never',
      altyd: 'always',
      soms: 'sometimes',
      dikwels: 'often',
      gewoonlik: 'usually',
      selde: 'rarely',
      skaars: 'hardly',
      amper: 'almost',
      oor: 'about',
      rondom: 'around',
      ongeveer: 'approximately',
      presies: 'exactly',
      net: 'just',
      ook: 'also',
      beide: 'both',
      elke: 'every',
      enige: 'any',
      geen: 'no',
      niks: 'nothing',
      iets: 'something',
      enigiets: 'anything',
      alles: 'everything',
      iemand: 'someone',
      enigiemand: 'anyone',
      almal: 'everyone',
      niemand: 'nobody',
      iewers: 'somewhere',
      'enige plek': 'anywhere',
      oral: 'everywhere',
      nêrens: 'nowhere',
      eendag: 'sometime',
      'enige tyd': 'anytime',
      'elke keer': 'everytime',
      'vir altyd': 'forever',
      'een keer': 'once',
      'twee keer': 'twice',
      weer: 'again',
      terug: 'back',
      vorentoe: 'forward',
      op: 'up',
      af: 'down',
      in: 'in',
      uit: 'out',
      oor: 'over',
      onder: 'under',
      bo: 'above',
      tussen: 'between',
      deur: 'through',
      naby: 'near',
      ver: 'far',
      binne: 'inside',
      buite: 'outside',
      sonder: 'without',
      met: 'with',
      teen: 'against',
      na: 'towards',
      weg: 'away',
      van: 'from',
      vir: 'for',
      deur: 'by',
      behalwe: 'except',
      tydens: 'during',
      terwyl: 'while',
      voor: 'before',
      na: 'after',
      agter: 'behind',
    }

    let translatedText = text.toLowerCase()

    // Replace common words
    for (const [afrikaans, english] of Object.entries(translations)) {
      const regex = new RegExp(`\\b${afrikaans}\\b`, 'gi')
      translatedText = translatedText.replace(regex, english)
    }

    return translatedText
  }

  /**
   * Check if language is RTL
   */
  private isRTLLanguage(code: string): boolean {
    const rtlLanguages = ['ar', 'he', 'fa', 'ur', 'yi', 'ji']
    return rtlLanguages.includes(code)
  }

  /**
   * Get cache key for translation
   */
  private getCacheKey(text: string, sourceLanguage: string, targetLanguage: string): string {
    return `${sourceLanguage}-${targetLanguage}-${text.slice(0, 100)}`
  }

  /**
   * Get cached translation
   */
  private getCachedTranslation(cacheKey: string): TranslationResult | null {
    const cached = this.cache.get(cacheKey)
    const expiry = this.cacheExpiry.get(cacheKey)

    if (cached && expiry && Date.now() < expiry) {
      return cached
    }

    // Remove expired cache
    if (cached) {
      this.cache.delete(cacheKey)
      this.cacheExpiry.delete(cacheKey)
    }

    return null
  }

  /**
   * Set cached translation
   */
  private setCachedTranslation(cacheKey: string, result: TranslationResult): void {
    this.cache.set(cacheKey, result)
    this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_DURATION)
  }

  /**
   * Clear translation cache
   */
  clearCache(): void {
    this.cache.clear()
    this.cacheExpiry.clear()
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; maxAge: number } {
    return {
      size: this.cache.size,
      maxAge: this.CACHE_DURATION,
    }
  }
}

// Export singleton instance
export const translationService = new TranslationService()
export default translationService
