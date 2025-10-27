# Book Memo
A memo is the bit and piece you remember about a given book.

## Functional requirements
- Search for a book 
- list should show the search result (list)
- Add a memo to a book
- View a list of books that have your memo (grid/table)

## Non-Functional requirements
- Intl support (DONE)
- Caching search queries (DONE)
- The web application should be responsive, look well on desktop and mobile (DONE)
- Lazy loading components that are rarely used
- Offline/PWA/Service Worker, allow a user to write a memo, even if they do not have internet
- Skeleton loading - useful when searching for books

## Enhancements
- Allow users to share their memos with other users


## Tech stack
- Reactjs
- Vite
- `@mui/material`, `@emotion/react` for stylng with css-in-js
- yarn for package management
- localStorage is used to mock backend (stores and share memos)

## Folder structure 
Goal is to make sure each file has at most 100 lines (to help future developer understand the code)

```sh
screens/
  ├── {screen-1}/
  │   ├── index.tsx       (main component)
  │   ├── hooks.ts        (custom hooks for state & logic)
  │   ├── styles.ts       (styled components)
  │   └── components/     (sub-components)
  └── {screen-2}/
      ├── index.tsx       (main component)
      ├── hooks.ts        (custom hooks for state & logic)
      ├── styles.ts       (styled components)
      └── components/     (sub-components)

components/
  ├── {complex-component}/
  │   ├── index.tsx       (main component)
  │   ├── hooks.ts        (custom hooks for business logic)
  │   ├── styles.ts       (styled components)
  │   └── {helper}.tsx    (sub-component)
  ├── {base-component}.tsx
  └── {simple-component}/
      ├── index.tsx
      └── styles.ts
```

### Architecture Guidelines
- Keep main component files under 100 lines
- Extract business logic and state management into custom hooks (hooks.ts)
- Keep styled components in separate styles.ts files
- Sub-components can be extracted into separate files when needed
