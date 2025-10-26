# Book Memo
memo is something you remember about a given book

## Functional requirements
- Search for a book 
- list should show the search result (list)
- Add a memo to a book
- View a list of books that have your memo (grid/table)

## Non-Functional requirements
- Offline/PWA/Service Worker, allow a user to write a  even if they do not have internet
- The web application should be responsive, look well on desktop and mobile
- Caching search queries
- Lazy loading components that rarely used



## Enhancements
- Allow users to share their memos with other users


## Tech stack
- Reactjs
- Vite
- `@mui/material`, `@emotion/react` for stylng with css-in-js
- yarn for package management
- localStorage is used to mock backend (stores and shore memos)
