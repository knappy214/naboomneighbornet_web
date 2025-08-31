# Naboom NeighborNet Web Application

A community security and neighborhood watch platform built with Vue 3, TypeScript, Tailwind CSS 4, and DaisyUI 5.

## 🎨 Custom Themes: Community Security

This application features custom DaisyUI themes with the following color palettes:

### 🌞 Community Security (Light)

- **Primary**: Corporate blue (#4b6bfb) - Main brand color
- **Secondary**: Winter light blue (#047aff) - Secondary actions
- **Accent**: Warm orange (#f97316) - Community-focused elements
- **Neutral**: Dark gray (#374151) - Text and borders
- **Base**: Clean whites and grays for backgrounds
- **Status Colors**: Info, success, warning, and error colors for alerts

### 🌙 Community Security (Dark)

- **Primary**: Bright blue (#60a5fa) - Enhanced visibility on dark backgrounds
- **Secondary**: Sky blue (#38bdf8) - Secondary actions with dark theme
- **Accent**: Vibrant orange (#fb923c) - Community elements in dark mode
- **Base**: Deep slate colors (#0f172a, #1e293b, #334155) for dark backgrounds
- **Content**: Light text (#e2e8f0) for excellent readability
- **Status Colors**: Bright, accessible colors for dark environments

### 🌟 Theme Features

- **Triple Theme Switcher**: Cycle between Light, Dark, and Default DaisyUI themes
- **Custom Colors**: All DaisyUI components use your brand colors
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Component Library**: Full DaisyUI v5 component support
- **Dark Mode Support**: Automatic dark theme with proper contrast ratios

## 🚀 Getting Started

### Prerequisites

- Node.js 20.19.0 or >=22.12.0
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Build

```bash
npm run preview
```

## 🛠️ Technology Stack

- **Frontend Framework**: Vue 3 with Composition API
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 + DaisyUI 5
- **Build Tool**: Vite
- **Package Manager**: npm
- **Testing**: Vitest

## 🎯 DaisyUI Components Used

The application showcases various DaisyUI components:

- **Hero**: Main landing section
- **Cards**: Feature showcases
- **Buttons**: Primary, secondary, and accent variants
- **Badges**: Status indicators
- **Join**: Connected button groups
- **Footer**: Site footer
- **Navbar**: Enhanced theme switcher navigation

## 🎨 Theme Usage

### Using Theme Colors

```html
<!-- Primary brand color -->
<button class="btn btn-primary">Primary Action</button>

<!-- Secondary color -->
<button class="btn btn-secondary">Secondary Action</button>

<!-- Accent color -->
<button class="btn btn-accent">Community Action</button>

<!-- Base colors -->
<div class="bg-base-100 text-base-content">Content Area</div>
<div class="bg-base-200">Secondary Background</div>
```

### Theme Switching

The application includes an enhanced theme switcher that allows you to cycle through:

1. **Community Security (Light)**: Your custom light theme with brand colors
2. **Community Security (Dark)**: Your custom dark theme with brand colors
3. **DaisyUI Light**: Default DaisyUI light theme for comparison

Click the "Switch Theme" button in the navbar to cycle through all three themes!

### Custom CSS Variables

Both themes define all required DaisyUI CSS variables including:

- Color palette (primary, secondary, accent, etc.)
- Border radius settings
- Component sizes
- Depth and noise effects

## 📁 Project Structure

```
src/
├── App.vue              # Main application component with enhanced theme switcher
├── main.ts             # Application entry point with CSS import
├── style.css           # Global styles with both light and dark DaisyUI themes
└── stores/             # Pinia state management
```

## 🔧 Configuration Files

- **style.css**: DaisyUI theme configuration for both light and dark variants
- **vite.config.ts**: Vite configuration with Tailwind CSS plugin
- **tsconfig.json**: TypeScript configuration
- **package.json**: Dependencies and scripts

## 🧪 Testing

```bash
npm run test:unit
```

## 📝 Code Quality

```bash
npm run lint
npm run format
npm run type-check
```

## 🌟 Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Type Safety**: Full TypeScript support
- **Modern UI**: DaisyUI component library
- **Dual Custom Themes**: Light and dark variants of your brand
- **Enhanced Theme Switcher**: Cycle through three different themes
- **Fast Development**: Vite hot module replacement

## 🎨 Theme Configuration

Your custom themes are configured in `src/style.css` using DaisyUI v5's `@plugin "daisyui/theme"` syntax:

### Light Theme

```css
@plugin "daisyui/theme" {
  name: 'community-security';
  default: true;
  prefersdark: false;
  color-scheme: light;

  --color-primary: #4b6bfb;
  --color-secondary: #047aff;
  --color-accent: #f97316;
  /* ... more color variables */
}
```

### Dark Theme

```css
@plugin "daisyui/theme" {
  name: 'community-security-dark';
  default: false;
  prefersdark: true;
  color-scheme: dark;

  --color-primary: #60a5fa;
  --color-secondary: #38bdf8;
  --color-accent: #fb923c;
  /* ... more color variables */
}
```

## 🌙 Dark Theme Benefits

- **Reduced Eye Strain**: Dark backgrounds for low-light environments
- **Battery Saving**: OLED displays use less power with dark themes
- **Modern Aesthetic**: Contemporary design preference for many users
- **Accessibility**: High contrast ratios for better readability
- **Brand Consistency**: Maintains your community security identity

## 📄 License

Private project - All rights reserved
