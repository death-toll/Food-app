# AI Use Guide (Food App Mono)

This document is a quick “how to work in this repo” guide for frontend + backend, with pointers to important files and safe patterns to follow more.

## Frontend (Vite + React)

### Where to change API base URL
- Axios client: [Frontend/food/src/services/axiosInstance.js](Frontend/food/src/services/axiosInstance.js)

Recommended pattern:
- Local dev: `VITE_API_BASE_URL=http://localhost:8083/`
- Azure: `VITE_API_BASE_URL=https://backendnew-dha7bzdkd2cmb7ej.canadacentral-01.azurewebsites.net/`

If you see `ERR_CONNECTION_REFUSED` to localhost, it usually means:
- frontend is running locally but backend is NOT running on `http://localhost:8083`, OR
- axios baseURL is still set to localhost.

### API caching / repeated calls
- Cache utility: [Frontend/food/src/services/apiCache.js](Frontend/food/src/services/apiCache.js)
- Average rating API wrapper: [Frontend/food/src/api/rating.js](Frontend/food/src/api/rating.js)

Guideline:
- Use short TTL caching (ex: 2s) for “chatty” endpoints like rating average that can be triggered by many cards rendering.
- Prefer caching in the API layer (rating.js) instead of sprinkling timers across components.

### Key components/pages
Routing root:
- [Frontend/food/src/App.jsx](Frontend/food/src/App.jsx)

Auth guard:
- [Frontend/food/src/components/RequireAuth.jsx](Frontend/food/src/components/RequireAuth.jsx)

Layouts:
- [Frontend/food/src/layouts/CustomerLayout.jsx](Frontend/food/src/layouts/CustomerLayout.jsx)
- [Frontend/food/src/layouts/OwnerLayout.jsx](Frontend/food/src/layouts/OwnerLayout.jsx)

Restaurant browsing:
- List page: [Frontend/food/src/pages/Restaurantlist.jsx](Frontend/food/src/pages/Restaurantlist.jsx)
- Card component: [Frontend/food/src/components/foodcard.jsx](Frontend/food/src/components/foodcard.jsx)
- Menu/details page: [Frontend/food/src/pages/RestaurantMenu.jsx](Frontend/food/src/pages/RestaurantMenu.jsx)

Owner views:
- Owner restaurants: [Frontend/food/src/pages/MyRestaurants.jsx](Frontend/food/src/pages/MyRestaurants.jsx)
- Food manager: [Frontend/food/src/components/RestaurantFoodManager.jsx](Frontend/food/src/components/RestaurantFoodManager.jsx)

Cart:
- Cart API: [Frontend/food/src/api/cart.js](Frontend/food/src/api/cart.js)
- Cart UI: [Frontend/food/src/components/Cart.jsx](Frontend/food/src/components/Cart.jsx)

Theme:
- Theme sync: [Frontend/food/src/components/ThemeSync.jsx](Frontend/food/src/components/ThemeSync.jsx)

### Preferred async style
- In API wrappers, one-liner `.then(res => res.data)` is fine (consistent and concise).
- In React components, prefer `async/await` with `try/catch` for clearer control flow.

## Backend (Spring Boot)

### Test endpoint (health check)
A simple GET endpoint exists for verifying the backend is up:
- Controller: [Backend/FoodApplication/FoodApplication/src/main/java/com/example/FoodApplication/Controller/TestController.java](Backend/FoodApplication/FoodApplication/src/main/java/com/example/FoodApplication/Controller/TestController.java)

Request:
- `GET /api/test`

### CORS configuration (Azure + local)
- Security/CORS config: [Backend/FoodApplication/FoodApplication/src/main/java/com/example/FoodApplication/Security/SecurityConfig.java](Backend/FoodApplication/FoodApplication/src/main/java/com/example/FoodApplication/Security/SecurityConfig.java)

Guideline:
- Allow the frontend origin (Azure URL) + localhost dev origins.
- Prefer using the env/property `app.cors.allowed-origins` in production so you can change allowed origins without code changes.

### Exception handling (recommended pattern)
Today many controllers throw `ResponseStatusException`. That works, but as the app grows it’s better to centralize errors.

Recommended approach to add:
- Create a `@ControllerAdvice` that maps common exceptions to a consistent JSON shape:
  - `ResponseStatusException`
  - validation errors (`MethodArgumentNotValidException`)
  - fallback `Exception` (500)

Suggested JSON structure:
- `timestamp`, `status`, `error`, `message`, `path`

This keeps frontend error handling consistent (one shape).

### Logging (current + recommended)
Current logging config lives in:
- [Backend/FoodApplication/FoodApplication/src/main/resources/application.properties](Backend/FoodApplication/FoodApplication/src/main/resources/application.properties)

Notes:
- `logging.file.name=logs/app.log` writes server logs to a file (good for local; on Azure also check platform logs).
- Consider reducing noise in production:
  - `spring.jpa.show-sql=false` (SQL logs can be very verbose)
  - tune `logging.level.*` by package (INFO in prod, DEBUG only when needed)

Controller/service logging guideline:
- Log at INFO for major events (login success, order created)
- Log at WARN for recoverable problems (bad input, not found)
- Log at ERROR for unexpected failures (exceptions), ideally once in the global exception handler

## Deployment notes (Azure Web Apps + Docker)
- You do NOT need new URLs if you keep the same Web Apps.
- Usual flow: rebuild Docker image -> push to registry -> restart Web App (or enable continuous deployment).

## Quick troubleshooting
- CORS error: backend must allow the exact frontend origin in CORS config.
- 401/403: token missing/expired; check Authorization header and auth guard.
- ERR_CONNECTION_REFUSED (localhost): backend not running locally OR axios baseURL still points to localhost.