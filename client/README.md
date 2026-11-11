# Borrow My Stuff client

The client is a React 19 single-page application built with Vite and Tailwind CSS.

## Development

```powershell
npm install
npm run dev
```

The development server runs at `http://localhost:5173`. Set `VITE_API_URL` when the API is not running at `http://localhost:5000`.

## Verification

```powershell
npm run lint
npm run build
```

The app uses cookie-based authentication and calls the Express API through the shared helpers in `src/api`.
