# Food Ordering Frontend

React + Vite frontend for the Food Ordering Application.

## What It Does

- Shows restaurants and menu items
- Supports login, registration, and Google sign-in
- Manages cart, favorites, orders, and tracking
- Connects to the backend through Axios
- Uses protected routes for user-only pages

## Tech Stack

- React 18
- Vite
- React Router
- Axios
- Tailwind CSS

## Prerequisites

- Node.js 18+
- npm
- A running backend API

## Local Setup

1. Install dependencies.

```bash
npm install
```

2. Create an env file.

```bash
cp .env.example .env
```

3. Set environment variables.

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
VITE_RAZORPAY_KEY_ID=your-razorpay-key-id
```

4. Start the dev server.

```bash
npm run dev
```

5. Build for production.

```bash
npm run build
```

## Features

- JWT login and registration
- Google OAuth login
- Restaurant search and menu browsing
- Cart quantity updates
- Order placement and confirmation
- Order history and cancellation
- Responsive layout

## Deployment on Vercel

1. Push the frontend folder to GitHub.
2. Import it into Vercel.
3. Set environment variables.

```env
VITE_API_BASE_URL=https://your-render-backend.onrender.com/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
VITE_RAZORPAY_KEY_ID=your-razorpay-key-id
```

4. Use `npm run build` as the build command.
5. Use `dist` as the output directory.
6. Deploy.

The repo already includes `vercel.json` for React Router support.

## Scripts

- `npm run dev` - Start the local dev server
- `npm run build` - Create a production build
- `npm run preview` - Preview the production build locally

## Notes

- Keep API URLs pointed to the deployed backend in production.
- Do not store secrets directly in source control.
