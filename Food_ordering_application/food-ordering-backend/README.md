# Food Ordering Backend

Spring Boot REST API for the Food Ordering Application.

## What It Does

- Handles authentication with email/password and Google login
- Serves restaurant, menu, cart, order, review, favorite, and address APIs
- Sends email notifications
- Uses JWT for protected routes
- Persists data in PostgreSQL via Spring Data JPA

## Tech Stack

- Java 17
- Spring Boot 3.3.5
- Spring Security
- Spring Data JPA + Hibernate
- PostgreSQL
- JavaMail
- Spring AOP
- Maven
- Docker

## Prerequisites

- Java 17
- Maven 3.9+
- PostgreSQL database
- Gmail App Password if email sending is enabled

## Local Setup

1. Create an `.env` file from `.env.example`.
2. Set database and auth values.
3. Build the app.

```bash
mvn clean package -DskipTests
```

4. Run the jar.

```bash
java -jar target/*.jar
```

5. Default local API base URL.

```text
http://localhost:8080
```

## Environment Variables

| Variable | Purpose |
|---|---|
| `DB_URL` | JDBC connection URL for PostgreSQL or Neon |
| `DB_USERNAME` | Database username |
| `DB_PASSWORD` | Database password |
| `JWT_SECRET` | Secret used to sign JWT tokens |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `MAIL_USERNAME` | Gmail address used for SMTP |
| `MAIL_PASSWORD` | Gmail App Password |
| `PORT` | App port for hosting platforms |

## API Endpoints

All responses use the application response wrapper.

### Auth

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register user |
| POST | `/api/auth/login` | Public | Login user |
| POST | `/api/auth/google` | Public | Google sign-in |
| POST | `/api/auth/refresh` | Public | Refresh token |

### Restaurant and Menu

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/restaurants` | Public | List restaurants |
| GET | `/api/restaurants/search` | Public | Search restaurants |
| GET | `/api/restaurants/{id}` | Public | Restaurant details |
| GET | `/api/restaurants/{id}/menu` | Public | Restaurant menu |
| GET | `/api/menu/restaurant/{restaurantId}` | Public | Alternate menu endpoint |

### Cart

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/cart` | Protected | Get cart |
| POST | `/api/cart/items` | Protected | Add item to cart |
| PUT | `/api/cart/items/{itemId}` | Protected | Update quantity |
| DELETE | `/api/cart/items/{itemId}` | Protected | Remove item |
| DELETE | `/api/cart` | Protected | Clear cart |

### Orders

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/orders` | Protected | Place order |
| GET | `/api/orders/my` | Protected | Current user orders |
| GET | `/api/orders/{id}` | Protected | Get order by id |
| PUT | `/api/orders/{id}/cancel` | Protected | Cancel pending order |
| GET | `/api/orders/{id}/status` | Protected | Track order status |

### User

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/users/me` | Protected | Current user profile |

## Run With Render

1. Push the backend folder to GitHub.
2. Create a Render Web Service.
3. Choose Docker deployment.
4. Add environment variables in Render.
5. Make sure `DB_URL` points to a live PostgreSQL database, such as Neon.
6. Deploy.

If Render still tries `localhost:5432`, it means the database environment variables were not set correctly.

## Notes

- Do not commit secrets.
- Use a strong JWT secret.
- Email errors should not block core API behavior.
