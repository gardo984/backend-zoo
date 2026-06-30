# Changelog — app-library

## 2026-06-30 — Pagination, search & user update

- Add `search`, `status`, `limit`, `offset`, `sorted_by` query params to `GET /books/`, `GET /author/`, `GET /categories/`, `GET /users/`
- Add `PUT /users/{id}` endpoint for partial user updates (email, password, disabled)
- Add `UserUpdate` schema
- Include `disabled` and `created_at` in `UserResponse`
- Tests: user update, search by email, status filter, invalid sort field

## 2026-06-29 — Pre-commit & maintenance

- Replace custom git hooks with pre-commit (black + flake8)
- Add `.pre-commit-config.yaml`, `.flake8`, `pyproject.toml`

## 2026-06-28 — Redis & book fields

- Add Redis integration for book creation/update events
- Add description, image, price fields to Book model and schemas
- Update Redis publish payload with full book structure
