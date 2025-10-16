/**
 * Language Detection Utility
 * Simple language detection for text content
 * Part of User Story 2: Multilingual Community Interface
 */

export interface LanguageDetectionResult {
  language: string
  confidence: number
  isRTL: boolean
}

// Common words for language detection
const LANGUAGE_WORDS: Record<string, string[]> = {
  en: [
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
    'have',
    'has',
    'had',
    'will',
    'would',
    'could',
    'should',
    'can',
    'may',
    'might',
    'must',
    'shall',
    'do',
    'does',
    'did',
    'are',
    'was',
    'were',
    'be',
    'been',
    'being',
    'am',
    'get',
    'got',
    'make',
    'made',
    'take',
    'took',
    'come',
    'came',
    'go',
    'went',
    'see',
    'saw',
    'know',
    'knew',
    'think',
    'thought',
    'say',
    'said',
    'tell',
    'told',
    'give',
    'gave',
    'find',
    'found',
    'look',
    'looked',
    'use',
    'used',
    'work',
    'worked',
    'call',
    'called',
    'try',
    'tried',
    'ask',
    'asked',
    'need',
    'needed',
    'feel',
    'felt',
    'become',
    'became',
    'leave',
    'left',
    'put',
    'put',
    'mean',
    'meant',
    'keep',
    'kept',
    'let',
    'let',
    'begin',
    'began',
    'seem',
    'seemed',
    'help',
    'helped',
    'talk',
    'talked',
    'turn',
    'turned',
    'start',
    'started',
    'show',
    'showed',
    'hear',
    'heard',
    'play',
    'played',
    'run',
    'ran',
    'move',
    'moved',
    'live',
    'lived',
    'believe',
    'believed',
    'hold',
    'held',
    'bring',
    'brought',
    'happen',
    'happened',
    'write',
    'wrote',
    'provide',
    'provided',
    'sit',
    'sat',
    'stand',
    'stood',
    'lose',
    'lost',
    'pay',
    'paid',
    'meet',
    'met',
    'include',
    'included',
    'continue',
    'continued',
    'set',
    'set',
    'learn',
    'learned',
    'change',
    'changed',
    'lead',
    'led',
    'understand',
    'understood',
    'watch',
    'watched',
    'follow',
    'followed',
    'stop',
    'stopped',
    'create',
    'created',
    'speak',
    'spoke',
    'read',
    'read',
    'allow',
    'allowed',
    'add',
    'added',
    'spend',
    'spent',
    'grow',
    'grew',
    'open',
    'opened',
    'walk',
    'walked',
    'win',
    'won',
    'offer',
    'offered',
    'remember',
    'remembered',
    'love',
    'loved',
    'consider',
    'considered',
    'appear',
    'appeared',
    'buy',
    'bought',
    'wait',
    'waited',
    'serve',
    'served',
    'die',
    'died',
    'send',
    'sent',
    'expect',
    'expected',
    'build',
    'built',
    'stay',
    'stayed',
    'fall',
    'fell',
    'cut',
    'cut',
    'reach',
    'reached',
    'kill',
    'killed',
    'remain',
    'remained',
    'suggest',
    'suggested',
    'raise',
    'raised',
    'pass',
    'passed',
    'sell',
    'sold',
    'require',
    'required',
    'report',
    'reported',
    'decide',
    'decided',
    'pull',
    'pulled',
  ],
  af: [
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
    'het',
    'was',
    'sal',
    'kan',
    'moet',
    'wil',
    'mag',
    'behoort',
    'doen',
    'gedoen',
    'maak',
    'gemaak',
    'neem',
    'geneem',
    'kom',
    'gekom',
    'gaan',
    'gegaan',
    'sien',
    'gesien',
    'weet',
    'gewet',
    'dink',
    'gedink',
    'sê',
    'gesê',
    'vertel',
    'vertel',
    'gee',
    'gegee',
    'vind',
    'gevind',
    'kyk',
    'gekyk',
    'gebruik',
    'gebruik',
    'werk',
    'gewerk',
    'bel',
    'gebel',
    'probeer',
    'geprobeer',
    'vra',
    'gevra',
    'benodig',
    'benodig',
    'voel',
    'gevoel',
    'word',
    'geword',
    'verlaat',
    'verlaat',
    'sit',
    'gesit',
    'beteken',
    'beteken',
    'hou',
    'gehou',
    'laat',
    'gelaat',
    'begin',
    'begin',
    'lyk',
    'gelyk',
    'help',
    'gehelp',
    'praat',
    'gepraat',
    'draai',
    'gedraai',
    'begin',
    'begin',
    'wys',
    'gewys',
    'hoor',
    'gehoor',
    'speel',
    'gespeel',
    'hardloop',
    'gehardloop',
    'beweeg',
    'beweeg',
    'leef',
    'geleef',
    'glo',
    'geglo',
    'hou',
    'gehou',
    'bring',
    'gebring',
    'gebeur',
    'gebeur',
    'skryf',
    'geskryf',
    'voorsien',
    'voorsien',
    'sit',
    'gesit',
    'staan',
    'gestaan',
    'verloor',
    'verloor',
    'betaal',
    'betaal',
    'ontmoet',
    'ontmoet',
    'insluit',
    'ingesluit',
    'voortgaan',
    'voortgegaan',
    'stel',
    'gestel',
    'leer',
    'geleer',
    'verander',
    'verander',
    'lei',
    'gelei',
    'verstaan',
    'verstaan',
    'kyk',
    'gekyk',
    'volg',
    'gevolg',
    'stop',
    'gestop',
    'skep',
    'geskep',
    'praat',
    'gepraat',
    'lees',
    'gelees',
    'toelaat',
    'toegelaat',
    'voeg',
    'bygevoeg',
    'spandeer',
    'gespandeer',
    'groei',
    'gegroei',
    'oopmaak',
    'oopgemaak',
    'loop',
    'geloop',
    'wen',
    'gewen',
    'bied',
    'gebied',
    'onthou',
    'onthou',
    'lief',
    'lief',
    'oorweeg',
    'oorweeg',
    'verskyn',
    'verskyn',
    'koop',
    'gekoop',
    'wag',
    'gewag',
    'dien',
    'gedien',
    'sterf',
    'gesterf',
    'stuur',
    'gestuur',
    'verwag',
    'verwag',
    'bou',
    'gebou',
    'bly',
    'gebly',
    'val',
    'geval',
    'sny',
    'gesny',
    'bereik',
    'bereik',
    'doodmaak',
    'doodgemaak',
    'bly',
    'gebly',
    'voorstel',
    'voorgestel',
    'verhoog',
    'verhoog',
    'verbygaan',
    'verbygegaan',
    'verkoop',
    'verkoop',
    'vereis',
    'vereis',
    'rapporteer',
    'gerapporteer',
    'besluit',
    'besluit',
    'trek',
    'getrek',
  ],
}

// RTL languages
const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur', 'yi', 'ji']

/**
 * Detect language from text content
 */
export function detectLanguage(text: string): LanguageDetectionResult {
  if (!text || text.trim().length === 0) {
    return {
      language: 'en',
      confidence: 0.5,
      isRTL: false,
    }
  }

  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .split(/\s+/)
    .filter((word) => word.length > 2) // Filter out short words

  if (words.length === 0) {
    return {
      language: 'en',
      confidence: 0.5,
      isRTL: false,
    }
  }

  const scores: Record<string, number> = {}
  const totalWords = words.length

  // Calculate scores for each language
  for (const [lang, commonWords] of Object.entries(LANGUAGE_WORDS)) {
    let matches = 0
    for (const word of words) {
      if (commonWords.includes(word)) {
        matches++
      }
    }
    scores[lang] = matches / totalWords
  }

  // Find the language with the highest score
  let bestLanguage = 'en'
  let bestScore = 0

  for (const [lang, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score
      bestLanguage = lang
    }
  }

  // Calculate confidence (0.5 to 1.0)
  const confidence = Math.min(0.9, Math.max(0.5, 0.5 + bestScore))

  return {
    language: bestLanguage,
    confidence,
    isRTL: RTL_LANGUAGES.includes(bestLanguage),
  }
}

/**
 * Get language name from code
 */
export function getLanguageName(code: string): string {
  const names: Record<string, string> = {
    en: 'English',
    af: 'Afrikaans',
    ar: 'Arabic',
    he: 'Hebrew',
    fa: 'Persian',
    ur: 'Urdu',
    yi: 'Yiddish',
    ji: 'Yiddish',
  }
  return names[code] || code.toUpperCase()
}

/**
 * Check if language is RTL
 */
export function isRTLLanguage(code: string): boolean {
  return RTL_LANGUAGES.includes(code)
}

/**
 * Get text direction for language
 */
export function getTextDirection(code: string): 'ltr' | 'rtl' {
  return isRTLLanguage(code) ? 'rtl' : 'ltr'
}

/**
 * Format text for display based on language
 */
export function formatTextForLanguage(text: string, language: string): string {
  const isRTL = isRTLLanguage(language)

  if (isRTL) {
    // For RTL languages, we might want to add some formatting
    return text
  }

  return text
}

/**
 * Detect multiple languages in text (for mixed content)
 */
export function detectMultipleLanguages(text: string): LanguageDetectionResult[] {
  // Split text into sentences
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0)

  if (sentences.length === 0) {
    return [detectLanguage(text)]
  }

  // Detect language for each sentence
  const results = sentences.map((sentence) => detectLanguage(sentence.trim()))

  // Group by language and calculate average confidence
  const grouped: Record<string, number[]> = {}
  results.forEach((result) => {
    if (!grouped[result.language]) {
      grouped[result.language] = []
    }
    grouped[result.language].push(result.confidence)
  })

  // Return unique languages with average confidence
  return Object.entries(grouped).map(([language, confidences]) => ({
    language,
    confidence: confidences.reduce((a, b) => a + b, 0) / confidences.length,
    isRTL: isRTLLanguage(language),
  }))
}

/**
 * Get confidence level description
 */
export function getConfidenceLevel(confidence: number): 'high' | 'medium' | 'low' {
  if (confidence >= 0.8) return 'high'
  if (confidence >= 0.6) return 'medium'
  return 'low'
}

/**
 * Get confidence color class for UI
 */
export function getConfidenceColorClass(confidence: number): string {
  if (confidence >= 0.8) return 'text-success'
  if (confidence >= 0.6) return 'text-warning'
  return 'text-error'
}

export default {
  detectLanguage,
  getLanguageName,
  isRTLLanguage,
  getTextDirection,
  formatTextForLanguage,
  detectMultipleLanguages,
  getConfidenceLevel,
  getConfidenceColorClass,
}
