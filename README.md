# Enter the Nest

A NestJS-based authentication API with JWT implementation. This project provides a robust starting point for building secure web applications with user authentication functionality.

## Authentication System Overview

This API implements a secure JWT-based authentication system with these key features:

- **Registration**: Users create accounts with email, name, and password
- **Login**: Users authenticate to receive a JWT token
- **Protected Resources**: Access secured endpoints using JWT tokens
- **Password Security**: Bcrypt hashing with strong password requirements

### Authentication Flow

```bash
# 1. Register a new user
POST /auth/signup
Body: { "name": "John Doe", "email": "john@example.com", "password": "StrongP@ss1", "passwordConfirm": "StrongP@ss1" }

# 2. Login to get a token
POST /auth/login
Body: { "email": "john@example.com", "password": "StrongP@ss1" }
Response: { "accessToken": "eyJhbGciOiJIUzI1NiIsIn..." }

# 3. Access protected resources
GET /auth/check
Header: Authorization: Bearer eyJhbGciOiJIUzI1NiIsIn...
```

### Technical Implementation

- **Password Security**: Passwords are hashed with bcrypt (cost factor 10)
- **JWT Implementation**: Tokens contain user data (id, name, email) with a 1-hour expiration
- **Token Verification**: AuthGuard middleware verifies tokens and provides user data to controllers
- **Stateless Design**: No server-side token storage for better scalability

> **Note on Token Expiration**: The default token expiration is set to 1 hour (`expiresIn: '1h'`) in `auth.module.ts`. For production environments, this should be paired with a refresh token mechanism for better security. You can modify this value based on your security requirements.

## Features

- **User Authentication**: Complete signup and login system
- **JWT-based Authorization**: Secure API endpoints with JSON Web Tokens
- **Data Validation**: Strong request validation with custom decorators
- **Password Security**: Bcrypt hashing for secure password storage
- **PostgreSQL Integration**: Database persistence with Prisma ORM

## Tech Stack

- **Backend Framework**: NestJS 11
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: class-validator
- **Password Hashing**: bcrypt

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL
- npm or yarn

## Getting Started

### Environment Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/codigoisaac/EnterTheNest.git
   cd EnterTheNest
   ```

2. Install dependencies and set up environment:
   ```bash
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   ```

### Database Setup

1. **PostgreSQL**: Ensure your PostgreSQL server is running. This application requires PostgreSQL to function.

2. Configure your database connection in the `.env` file:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/enter-the-nest?schema=public"
   ```

3. Apply migrations and generate the Prisma client:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

### Running the Application

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000` (or the port specified in your env variables).

## API Endpoints

### Authentication

- **POST /auth/signup** - Register a new user
- **POST /auth/login** - Authenticate and receive token
- **GET /auth/check** - Verify authentication (protected route)

### Creating Protected Routes

You can easily create additional protected routes in your application by using the `AuthGuard`. Simply apply the `@UseGuards(AuthGuard)` decorator to any controller method that should require authentication:

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';

@Controller('items')
export class ItemsController {
  
  // Public route - no authentication required
  @Get('public')
  getPublicItems() {
    return { message: 'This is public data' };
  }
  
  // Protected route - requires a valid JWT token
  @UseGuards(AuthGuard)
  @Get('protected')
  getProtectedItems() {
    return { message: 'This is protected data' };
  }
}
```

When the `AuthGuard` is applied:
- Requests must include a valid JWT token in the Authorization header
- If the token is missing or invalid, the request will be rejected with a 401 Unauthorized error
- If the token is valid, the user's information becomes available via `request.user` in your controller

You can protect individual routes or apply the guard to an entire controller by placing the decorator at the controller level.

## Password Requirements

- Minimum 8 characters
- At least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 symbol

## Development Notes

- JWT tokens expire after 1 hour by default (set in `auth.module.ts`)
- For production, consider implementing a refresh token mechanism for better security
- The API uses global validation pipes to automatically validate incoming requests
- Custom validation decorator (`Match`) is implemented for password confirmation

## License

This project is licensed under the MIT License - see the LICENSE file for details.

The MIT License is a permissive license that allows anyone to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software, subject to the condition that the original copyright notice and permission notice be included in all copies or substantial portions of the software.

## Author

Isaac Muniz - [isaacmuniz.vercel.app](https://isaacmuniz.vercel.app)