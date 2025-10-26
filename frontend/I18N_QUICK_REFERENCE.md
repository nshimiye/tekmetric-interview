# i18n Quick Reference Guide

## 🌐 Language Switcher Location

The language switcher is located in the **header** of the application:

```
┌─────────────────────────────────────────────────────────────┐
│  Book Memo    [Search...]  [Search]  🌐 [👤]  [Sign In]    │
│                                       ↑                      │
│                              Language Switcher               │
└─────────────────────────────────────────────────────────────┘
```

### For Authenticated Users
Header displays: `Logo | Search Bar | Language Switcher 🌐 | User Avatar`

### For Non-Authenticated Users  
Header displays: `Logo | Language Switcher 🌐 | Sign In | Create Account`

## 🗣️ Supported Languages

| Language | Code | Display Name |
|----------|------|--------------|
| English  | `en` | English      |
| French   | `fr` | Français     |
| Spanish  | `es` | Español      |

## 🔑 Common Translation Keys

### Header
```typescript
t('header.logo')                    // "Book Memo" / "Mémo Livre" / "Memo de Libros"
t('header.searchPlaceholder')       // Search box placeholder
t('header.searchButton')            // "Search" / "Rechercher" / "Buscar"
t('header.logout')                  // "Log out" / "Se déconnecter" / "Cerrar sesión"
```

### Authentication
```typescript
t('login.title')                    // "Welcome back" / "Bon retour" / "Bienvenido de nuevo"
t('login.signIn')                   // "Sign in" / "Se connecter" / "Iniciar sesión"
t('register.createAccount')         // "Create account" / "Créer un compte" / "Crear cuenta"
```

### Books
```typescript
t('book.by')                        // "by" / "par" / "por"
t('book.addMemo')                   // "Add memo" / "Ajouter un mémo" / "Agregar memo"
t('book.memoCount', { count: 5 })   // "5 memos" / "5 mémos" / "5 memos"
```

### Search
```typescript
t('search.resultsFor', { query })   // "Results for "React"" / "Résultats pour "React""
t('search.clearSearch')             // "Clear search" / "Effacer la recherche"
```

## 🎨 Using Translations in Components

### Basic Usage
```typescript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return <h1>{t('mySection.title')}</h1>;
}
```

### With Variables
```typescript
<p>{t('search.resultsFor', { query: searchTerm })}</p>
```

### With Pluralization
```typescript
<span>{t('book.memoCount', { count: memoCount })}</span>
```

### Changing Language Programmatically
```typescript
const { i18n } = useTranslation();

// Change to French
i18n.changeLanguage('fr');

// Get current language
const currentLanguage = i18n.language; // 'en', 'fr', or 'es'
```

## 📂 File Locations

```
src/
├── i18n/
│   ├── config.ts              # i18n setup
│   └── locales/
│       ├── en.json            # English
│       ├── fr.json            # French
│       └── es.json            # Spanish
└── components/
    └── LanguageSwitcher.tsx   # Language selector component
```

## 🔧 Adding a New Translation

1. **Add to English (`en.json`)**
```json
{
  "mySection": {
    "newKey": "Hello {{name}}"
  }
}
```

2. **Add to French (`fr.json`)**
```json
{
  "mySection": {
    "newKey": "Bonjour {{name}}"
  }
}
```

3. **Add to Spanish (`es.json`)**
```json
{
  "mySection": {
    "newKey": "Hola {{name}}"
  }
}
```

4. **Use in component**
```typescript
{t('mySection.newKey', { name: 'Marie' })}
```

## 🐛 Troubleshooting

### Translation not showing
- Check that the key exists in all locale files
- Verify the key path is correct (e.g., `section.key` not `section/key`)
- Check browser console for missing translation warnings

### Language not persisting
- Check localStorage for `i18nextLng` key
- Ensure cookies/localStorage are enabled in browser
- Clear browser cache and try again

### Wrong language on first load
- i18n uses browser language by default
- To force a language: `i18n.changeLanguage('en')`
- Check `navigator.language` in browser console

## ✅ Testing Checklist

- [ ] Language switcher visible in header
- [ ] Can switch between all 3 languages
- [ ] Language choice persists on page reload
- [ ] All text updates when changing language
- [ ] Pluralization works correctly (test with 1 item vs multiple)
- [ ] Error messages are translated
- [ ] Form labels are translated
- [ ] Button text is translated
- [ ] Accessibility labels are translated

## 🌟 Example Translations

### Login Screen

| English | French | Spanish |
|---------|--------|---------|
| Welcome back | Bon retour | Bienvenido de nuevo |
| Email | E-mail | Correo electrónico |
| Password | Mot de passe | Contraseña |
| Sign in | Se connecter | Iniciar sesión |

### Search

| English | French | Spanish |
|---------|--------|---------|
| Searching for "React" | Recherche de "React" | Buscando "React" |
| No books matched | Aucun livre ne correspond | No se encontraron libros |
| Clear search | Effacer la recherche | Borrar búsqueda |

### Books

| English | French | Spanish |
|---------|--------|---------|
| by Charles Dickens | par Charles Dickens | por Charles Dickens |
| Add memo | Ajouter un mémo | Agregar memo |
| View memos | Voir les mémos | Ver memos |
| 1 memo | 1 mémo | 1 memo |
| 5 memos | 5 mémos | 5 memos |

## 💡 Pro Tips

1. **Always use translations** - Never hardcode text in components
2. **Consistent keys** - Use descriptive, hierarchical keys
3. **Test all languages** - Switch languages to verify translations
4. **Use pluralization** - For any counts, use i18next pluralization
5. **Context matters** - Provide context in variable names

## 📞 Need Help?

- See `I18N_SETUP.md` for detailed documentation
- Check `I18N_IMPLEMENTATION_SUMMARY.md` for overview
- Review translation files in `src/i18n/locales/`
- Consult [i18next docs](https://www.i18next.com/)

