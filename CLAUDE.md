# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based website for Fireworks Play, a mobile application available at https://fireworksplay.com. The site showcases the app with marketing content, release notes, and a protected dashboard for managing updates.

## Development Commands

### Start Development Server
```bash
npm start
```
Note: ESLint errors are suppressed in development with `ESLINT_NO_DEV_ERRORS=true`

### Build for Production
```bash
npm run build
```
Both `start` and `build` commands automatically run the update index generation step.

### Linting
```bash
npm run lint          # Check for ESLint errors
npm run lint:fix      # Auto-fix ESLint errors
```

### Testing
```bash
npm test              # Run Jest tests
```

### Generate Updates Index
```bash
npm run generate-updates-index
```
This script auto-generates `src/data/updates/index.js` by scanning for `.js` files in the updates directory and sorting them by date (newest first).

## Architecture

### Routing Structure
The app uses `react-router-dom` with the following routes:
- `/` - Main landing page
- `/release-note` - Public release notes view
- `/dashboard` - Protected dashboard for update management
- `/login` and `/register` - Authentication pages
- `/fireworksplay` - Duplicate routes for base path

Authentication is handled through `ProtectedRoute` component which wraps protected routes.

### Key Directories
- `src/components/` - Reusable UI components (SocialButton, StoreBadges, ImageSlider, etc.)
- `src/pages/` - Page-level components that correspond to routes
- `src/data/` - Static data and configuration
- `src/data/updates/` - Monthly update files with auto-generated index
- `public/` - Static assets and HTML template

### UI Framework
- **Chakra UI** - Primary component library for styling and layout
- **Framer Motion** - Animation library used throughout the app
- **React Icons** - Icon library

### Data Management
- Updates are stored as individual `.js` files in `src/data/updates/` named by date format (YYYY-MM.js)
- The `auto-generate-index.js` script automatically creates an index file that imports and sorts all updates
- Notion API integration (`@notionhq/client`) for fetching latest updates

### Styling Approach
- Primary styling through Chakra UI props and theme
- Custom CSS files for specific components (`parallaxScroll.css`)
- Emotion (styled-components) for custom styling needs

### Build Configuration
- Uses Create React App (`react-scripts`) with custom webpack configuration
- ESLint configured with `unused-imports` plugin to catch unused imports
- Production builds deploy to GitHub Pages via `gh-pages`

## Important Notes

- The project suppresses ESLint errors in development but maintains linting rules for code quality
- Updates directory has automatic index generation - do not manually edit `src/data/updates/index.js`
- The site supports both root and `/fireworksplay` base paths
- Dashboard routes require authentication through the ProtectedRoute component