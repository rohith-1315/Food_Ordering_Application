# Food Ordering Application

Monorepo for a food ordering platform with a Spring Boot backend and a React + Vite frontend.

## Overview

This project provides:

- User registration, login, and Google sign-in
- Restaurant browsing, filtering, and menu exploration
- Cart, favorites, coupons, and address management
- Razorpay payment flow and order placement
- Order history, status tracking, and cancellation
- A Docker-ready backend and Vercel-ready frontend

## Repository Layout

- `food-ordering-backend` - Spring Boot REST API
- `food-ordering-frontend` - React + Vite client
- `run-e2e.ps1` - Windows bootstrap script for local development

## Tech Stack

### Backend

- Java 17
- Spring Boot 3.3.5
- Spring Security + JWT
- Spring Data JPA + Hibernate
- PostgreSQL
- JavaMail
- Maven
- Docker

### Frontend

- React 18
- Vite
- React Router
- Axios
- Tailwind CSS

## Local Development

### Backend

```bash
cd food-ordering-backend
cp .env.example .env
mvn spring-boot:run
```

### Frontend

```bash
cd food-ordering-frontend
npm install
cp .env.example .env
npm run dev
```

### One-command Windows bootstrap

From the repository root:

```powershell
powershell -ExecutionPolicy Bypass -File .\run-e2e.ps1
```

This script starts the local database flow, writes local env files, and launches both apps.

## Deployment

### Backend on Render

Use the Dockerfile inside `food-ordering-backend`. Set these environment variables in Render:

- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET`
- `GOOGLE_CLIENT_ID`
- `MAIL_USERNAME`
- `MAIL_PASSWORD`
- `PORT`

### Frontend on Vercel

Set these environment variables:

- `VITE_API_BASE_URL`
- `VITE_GOOGLE_CLIENT_ID`
- `VITE_RAZORPAY_KEY_ID`

## Local URLs

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8080`
- Backend API: `http://localhost:8080/api`

## Notes

- Keep secrets out of source control.
- Use a real PostgreSQL connection for deployed environments.
- Render should receive the backend database variables directly, not localhost values.

## Security Notes

- Keep `.env` files local only.
- Secret-bearing files are ignored by `.gitignore`.
- Rotate credentials immediately if they were ever committed historically.

## Deployment Notes

### Frontend (Vercel)

Set at least these environment variables in Vercel Project Settings:

- `VITE_API_BASE_URL=https://<your-backend-domain>/api`
- `VITE_GOOGLE_CLIENT_ID=<your-google-client-id>`
- `VITE_RAZORPAY_KEY_ID=<your-razorpay-key-id>`

Then deploy.

### Backend (Render/Docker-ready)

The backend includes a Dockerfile and can be deployed to Render as a Web Service with required environment variables.

## License

This project currently does not define a license file in the repository.
