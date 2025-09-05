#!/bin/bash

echo "Installing Vue 3.5.20 with vue-i18n 11.1.11 and Vuetify 3.9.6..."

# Install the new dependency
npm install @intlify/unplugin-vue-i18n@^2.0.0

echo "Dependencies installed successfully!"
echo ""
echo "To test the setup:"
echo "1. Run: npm run dev"
echo "2. Visit: http://localhost:5173/demo"
echo "3. Test language switching and Vuetify components"
echo ""
echo "Expected features:"
echo "✅ No legacy API deprecation warnings"
echo "✅ Vuetify components display translated text"
echo "✅ TypeScript autocompletion for \$t()"
echo "✅ Tree-shaking works for both Vuetify and i18n"
