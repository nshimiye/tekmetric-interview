# Internationalization (i18n) Setup

## Overview

This application now supports internationalization (i18n) with three languages:
- **English (en)** - Default language
- **French (fr)** - Français
- **Spanish (es)** - Español

## Implementation Details

### Libraries Used

- **i18next**: Core internationalization framework
- **react-i18next**: React bindings for i18next
- **i18next-browser-languagedetector**: Automatically detects user's preferred language

### File Structure

```
src/
├── i18n/
│   ├── config.ts                 # i18n configuration
│   └── locales/
│       ├── en.json               # English translations
│       ├── fr.json               # French translations
│       └── es.json               # Spanish translations
├── components/
│   └── LanguageSwitcher.tsx      # Language selection component
└── index.tsx                     # i18n initialization
```

### Configuration

The i18n configuration (`src/i18n/config.ts`) includes:

- **Language detection**: Automatically detects user's language from browser settings or localStorage
- **Fallback language**: English (en)
- **Persistence**: User's language choice is saved in localStorage
- **Supported languages**: English, French, Spanish

### Language Switcher

A language switcher component has been added to the header that:
- Displays a globe icon (🌐)
- Opens a dropdown menu with available languages
- Shows the currently selected language
- Persists the user's language choice

The language switcher is visible to both authenticated and non-authenticated users.

### Translation Keys Structure

Translations are organized by feature/section:

```json
{
  "app": { ... },           // Application-wide text
  "header": { ... },        // Header component text
  "login": { ... },         // Login screen text
  "register": { ... },      // Registration screen text
  "home": { ... },          // Home screen text
  "search": { ... },        // Search functionality text
  "book": { ... },          // Book-related text
  "language": { ... }       // Language selector text
}
```

### Features

1. **Pluralization Support**: Proper handling of singular/plural forms
   ```json
   "memoCount": "{{count}} memo",
   "memoCount_plural": "{{count}} memos"
   ```

2. **Variable Interpolation**: Dynamic text with variables
   ```json
   "searchingFor": "Searching for {{query}}"
   ```

3. **Context-aware translations**: Different translations based on context

## Usage

### In React Components

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('mySection.title')}</h1>
      <p>{t('mySection.description', { name: 'John' })}</p>
      <span>{t('mySection.items', { count: 5 })}</span>
    </div>
  );
}
```

### Changing Language Programmatically

```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { i18n } = useTranslation();
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };
  
  return (
    <button onClick={() => changeLanguage('fr')}>
      Switch to French
    </button>
  );
}
```

## Adding a New Language

1. Create a new translation file in `src/i18n/locales/`:
   ```
   src/i18n/locales/de.json  # For German
   ```

2. Copy the structure from `en.json` and translate all values

3. Update `src/i18n/config.ts`:
   ```typescript
   import de from './locales/de.json';
   
   const resources = {
     en: { translation: en },
     fr: { translation: fr },
     es: { translation: es },
     de: { translation: de },  // Add new language
   };
   
   // Update supported languages
   supportedLngs: ['en', 'fr', 'es', 'de'],
   ```

4. Update `src/components/LanguageSwitcher.tsx`:
   ```typescript
   const languages = [
     { code: 'en', name: 'language.english' },
     { code: 'fr', name: 'language.french' },
     { code: 'es', name: 'language.spanish' },
     { code: 'de', name: 'language.german' },  // Add new language
   ];
   ```

5. Add the language name translation in all locale files:
   ```json
   {
     "language": {
       "german": "Deutsch"
     }
   }
   ```

## Adding New Translation Keys

1. Add the key to all locale files (`en.json`, `fr.json`, `es.json`)
2. Use the translation in your component:
   ```typescript
   {t('section.newKey')}
   ```

## Testing Translations

1. **Manual Testing**: Use the language switcher in the header
2. **Browser Language**: Clear localStorage and reload - app will use browser's language
3. **Persistence**: Change language, reload page - selection should persist

## Best Practices

1. **Key Naming**: Use descriptive, hierarchical keys (e.g., `login.errorDefault`)
2. **Avoid Hardcoded Text**: All user-facing text should use translations
3. **Consistency**: Keep translation structure consistent across languages
4. **Context**: Provide context in variable names (e.g., `{{count}}`, `{{query}}`)
5. **Pluralization**: Always use i18next pluralization for counts
6. **Test All Languages**: Verify translations in all supported languages

## Translated Components

The following components have been internationalized:

- ✅ Header (navigation, search, account menu)
- ✅ LoginScreen
- ✅ RegisterScreen
- ✅ HomeScreen
- ✅ SearchResultsPanel
- ✅ ResultCard
- ✅ ShelfCard
- ✅ LanguageSwitcher

## Current Translation Coverage

All user-facing text in the application has been translated, including:
- Navigation and buttons
- Form labels and placeholders
- Error messages
- Success messages
- Search functionality
- Book metadata
- User account information
- Accessibility labels (aria-label)

## Notes

- The language preference is stored in `localStorage` under the key `i18nextLng`
- Language detection happens automatically on first load
- If no language preference is found, the app defaults to English
- All three languages are loaded at build time (no dynamic imports)

