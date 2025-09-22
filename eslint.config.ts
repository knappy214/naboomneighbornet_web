import js from '@eslint/js'
import { createConfig as createVueTsConfig } from '@vue/eslint-config-typescript'
import configPrettier from 'eslint-config-prettier'
import configPrettierOverrides from 'eslint-config-prettier/prettier'
import eslintPluginPrettier from 'eslint-plugin-prettier'
import type { Linter } from 'eslint'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const vueTsConfig = createVueTsConfig({ rootDir: __dirname })
const prettierPluginModule = eslintPluginPrettier as { default?: Linter.Plugin }
const prettierPlugin = prettierPluginModule.default ?? (eslintPluginPrettier as Linter.Plugin)

const basePrettierRules = (configPrettier as { default?: { rules?: Linter.RulesRecord } })
const overridePrettierRules = (
  configPrettierOverrides as { default?: { rules?: Linter.RulesRecord } }
)

const prettierConfig: Linter.FlatConfig = {
  plugins: {
    prettier: prettierPlugin,
  },
  rules: {
    ...(basePrettierRules.default?.rules ?? basePrettierRules.rules ?? {}),
    ...(overridePrettierRules.default?.rules ?? overridePrettierRules.rules ?? {}),
    'prettier/prettier': 'warn',
  },
}

export default [
  js.configs.recommended,
  ...vueTsConfig,
  prettierConfig,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: __dirname,
      },
    },
  },
]
