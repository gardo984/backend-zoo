# Changelog — app-backoffice

## 2026-06-30 — Pagination, search, status filter & user edit

- Replace client-side `.slice(-20)` with server-side pagination on all views (limit=20)
- Search input now queries the API instead of client-side filtering
- Add status filter dropdown: Books/Authors/Categories → All / Active / Inactive; Users → All / Disabled / Enabled
- Add Previous / Next pagination buttons
- Add Edit button + modal for users (email, password, disabled toggle)
- Add `updateUser()` API function and `UserUpdate` type
- `records-info` shows dynamic range instead of static "Last 20 records"

## 2026-06-29 — Initial backoffice features

- Add search box + collapse sidebar + user dropdown

## 2026-06-28 — Initial setup

- Connect backoffice with app-library API
- Vue.js backoffice scaffold with Books, Authors, Categories, Users views
