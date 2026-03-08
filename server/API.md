# Backend API

Base URL: `http://localhost:4000/api` (or your `PORT`)

Auth: use `Authorization: Bearer <token>` or cookie `token`. Login/register return `token` in JSON.

## Auth `/api/auth`

| Method | Route | Access | Description |
|--------|--------|--------|-------------|
| POST | /register | Public | Body: `{ name, email, password }` |
| POST | /login | Public | Body: `{ email, password }` |
| POST | /logout | Public | Clears cookie |
| GET | /user | Private | Current user |
| PUT | /user | Private | Update: `{ name, email, password }` |

## Movies `/api/movies`

| Method | Route | Access | Description |
|--------|--------|--------|-------------|
| GET | / | Public | List movies. Query: `category`, `page`, `limit` |
| GET | /:id | Public | Movie by MongoDB id |
| GET | /tmdb/:tmdbId | Public | Movie by TMDB id |
| POST | / | Admin | Create movie (title, poster, description, tmdbId, releaseDate, trailer, genre, category) |
| PUT | /:id | Admin | Update movie |
| DELETE | /:id | Admin | Delete movie |

## Favorites `/api/favorites`

All require authentication.

| Method | Route | Description |
|--------|--------|-------------|
| GET | / | List user favorites |
| GET | /check/:tmdbId | Query: `type=movie|tv`. Returns `{ isFavorite }` |
| POST | / | Body: `{ tmdbId, type?, title?, poster? }` |
| DELETE | /:tmdbId | Query: `type=movie|tv` |

## Watch history `/api/watch-history`

All require authentication.

| Method | Route | Description |
|--------|--------|-------------|
| GET | / | List history. Query: `limit` |
| POST | / | Body: `{ tmdbId, type?, title?, poster? }` |
| DELETE | / | Clear history |

## Admin `/api/admin`

All require admin role.

| Method | Route | Description |
|--------|--------|-------------|
| GET | /users | Query: `page`, `limit` |
| PATCH | /users/:id/ban | Ban user |
| PATCH | /users/:id/unban | Unban user |
| DELETE | /users/:id | Delete user |
