# State Management Overview

This directory now follows a simple rule of thumb:

- `slices/` owns local state shape, synchronous reducers, and selectors.
- `thunks/` owns every Redux action that talks to the network or other async APIs (including follow-up persistence writes).

Keeping the split explicit makes it easy to answer two common questions:

1. **Where do I add or debug a fetch call?** Start in `src/store/thunks/`. Each file maps 1:1 with a domain (`libraryThunks.ts`, `searchThunks.ts`, etc.) and wraps the API helpers found under `src/api`. Any new async thunk should live beside its peers in this folder.
2. **Which Redux actions trigger API calls?** Anything exported from `thunks/` does. Anything exported from `slices/` is synchronous. Components that need async work import from `thunks/`, while selectors and local reducers continue to live in the slice files.

### Adding a new API-backed action

1. Create or update a thunk inside `thunks/`, keeping the side-effects close to the relevant API helper. For example, `libraryThunks.ts` now exports both read (`loadLibrary`) and write (`ensureBookInLibrary`, `addMemo`, `updateMemo`) flows so persistence is centralized, and `publicMemosThunks.ts` wraps both `loadPublicMemos` and the publish/unpublish operations.
2. Import the thunk in the matching slice and handle its lifecycle (`pending/fulfilled/rejected`) inside `extraReducers`.
3. Update the component to dispatch the thunk from `thunks/` and keep synchronous actions/selectors imported from `slices/`.

With this structure, new developers can jump straight to `thunks/` for API concerns and to `slices/` for state updates without digging through mixed responsibilities.
