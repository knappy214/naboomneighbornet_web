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

The application includes an enhanced theme switcher that allows you to switch between:

1. **Light**: DaisyUI light theme - clean and bright
2. **Business**: DaisyUI business theme - professional dark theme

Click the theme switcher in the navbar to toggle between light and business themes!

### DaisyUI Theme Configuration

The application uses DaisyUI's built-in themes:

- **Light Theme**: Clean, bright interface with high contrast
- **Business Theme**: Professional dark theme with corporate colors

Both themes are configured using DaisyUI's standard theme system with automatic color management.

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
- **Dual DaisyUI Themes**: Light and business themes
- **Enhanced Theme Switcher**: Toggle between light and business themes
- **Fast Development**: Vite hot module replacement

## 🎨 Theme Configuration

The application uses DaisyUI's built-in themes configured in `src/app.css`:

```css
@plugin "daisyui" {
  themes:
    light --default,
    business --prefersdark;
  root: ':root';
  include:;
  exclude:;
  prefix:;
  logs: true;
}
```

This configuration:

- Sets `light` as the default theme
- Sets `business` as the dark theme (prefers-color-scheme: dark)
- Uses DaisyUI's standard color palette and styling

## 🌙 Business Theme Benefits

- **Professional Appearance**: Corporate-friendly dark theme
- **Reduced Eye Strain**: Dark backgrounds for low-light environments
- **Battery Saving**: OLED displays use less power with dark themes
- **Modern Aesthetic**: Contemporary design preference for many users
- **Accessibility**: High contrast ratios for better readability

## 📄 License

Private project - All rights reserved
