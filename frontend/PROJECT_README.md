# Book Memo
memo is something you remember about a given book

## Functional requirements
- Search for a book 
- list should show the search result (list)
- Add a memo to a book
- View a list of books that have your memo (grid/table)

## Non-Functional requirements
- Intl support
- Caching search queries
- The web application should be responsive, look well on desktop and mobile
- Lazy loading components that rarely used
- Offline/PWA/Service Worker, allow a user to write a  even if they do not have internet



## Enhancements
- Allow users to share their memos with other users


## Tech stack
- Reactjs
- Vite
- `@mui/material`, `@emotion/react` for stylng with css-in-js
- yarn for package management
- localStorage is used to mock backend (stores and shore memos)

## Folder structure

src
- components
  |- header
    |- index.tsx
    |- styles.ts
  |- shelf-card
    |- index.tsx
    |- styles.ts
- screens
  |- book-memo-screen
    |- index.tsx
    |- state.ts
    |- styles.ts
  - home-screen
    |- index.tsx
    |- state.ts
    |- styles.ts
