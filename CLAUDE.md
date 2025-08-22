# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Astro-based personal homepage/portfolio project using TypeScript and Tailwind CSS.

## Development Commands

### Essential Commands
```bash
# Install dependencies
npm install

# Start development server (http://localhost:4321)
npm run dev

# Build for production (outputs to ./dist/)
npm run build

# Preview production build locally
npm run preview

# Check TypeScript and Astro components
npm run astro check
```

### Adding Integrations
```bash
# Add official Astro integrations
npm run astro add <integration>
# Example: npm run astro add tailwind
```

## Architecture & Structure

### Technology Stack
- **Astro 5.12.2** - Static site generator with component islands architecture
- **TypeScript** - With strict configuration extending Astro's base config
- **Tailwind CSS** - Currently loaded via CDN in index.html
- **Font Awesome** - Icons library loaded via CDN

### Project Structure
```
/
├── src/
│   ├── pages/        # Astro page components (.astro files)
│   │   └── index.astro
│   └── components/   # Reusable Astro/framework components (when created)
├── public/           # Static assets served as-is
│   └── favicon.svg
├── dist/            # Production build output (git-ignored)
└── index.html       # Standalone portfolio page (needs integration)
```

### Key Architectural Decisions

1. **File-based Routing**: Pages in `src/pages/` automatically become routes
2. **Component Islands**: Astro allows mixing static HTML with interactive framework components
3. **Build Output**: Static HTML by default, with JS only where needed

### Current State Notes

The repository contains a standalone `index.html` file that implements a complete portfolio page with:
- Dark/light theme toggle using localStorage
- Developer font switcher (Inter, Fira Code, Source Code Pro, JetBrains Mono)
- Animated SVG graphics
- Responsive design with Tailwind CSS

This HTML file should be integrated into the Astro project structure by converting it to an Astro component.

## Development Workflow

### Creating New Pages
1. Add `.astro` files to `src/pages/`
2. Use Astro's component syntax with frontmatter fences `---`
3. Import and use components as needed

### Working with Assets
- Place static assets in `public/` directory
- Reference them with absolute paths (e.g., `/favicon.svg`)
- For processed assets (optimized images, bundled CSS), import in components

### TypeScript Configuration
- Extends `astro/tsconfigs/strict`
- Strict mode is enabled
- Module resolution follows Astro's conventions

## Important Considerations

1. **No Linting/Formatting**: Currently no ESLint or Prettier configured
2. **No Testing Framework**: No unit or integration tests set up
3. **Deployment**: No deployment configuration exists yet (consider Vercel, Netlify, or GitHub Pages)
4. **Tailwind Integration**: Currently using CDN; consider adding @astrojs/tailwind for better performance