# Crystal Cube

A NestJS-based authentication API with JWT implementation. This project provides a robust starting point for building secure web applications with user authentication functionality.

## Authentication System Overview

This API implements a secure JWT-based authentication system with these key features:

- **Registration**: Users create accounts with email, name, and password
- **Login**: Users authenticate to receive a JWT token
- **Authentication Check**: Simple endpoint to verify if a token is valid
- **Password Security**: Bcrypt hashing with strong password requirements

### Authentication Flow

```bash
# 1. Register a new user
POST /auth/signup
Body: { "name": "John Doe", "email": "john@example.com", "password": "StrongP@ss1", "passwordConfirm": "StrongP@ss1" }
Response: { "id": 1, "email": "john@example.com", "name": "John Doe" }

# 2. Login to get a token
POST /auth/login
Body: { "email": "john@example.com", "password": "StrongP@ss1" }
Response: { "accessToken": "eyJhbGciOiJIUzI1NiIsIn..." }

# 3. Check authentication status
GET /auth/check
Header: Authorization: Bearer eyJhbGciOiJIUzI1NiIsIn...
Response: { "isAuthenticated": true, "message": "You are authenticated. Thank you for using Crystal Cube." }
```

### Technical Implementation

- **Password Security**: Passwords are hashed with bcrypt (cost factor 10)
- **JWT Implementation**: Tokens contain user data (id, name, email) with a 1-hour expiration
- **Token Verification**: AuthGuard middleware verifies tokens for protected routes
- **Authentication Check**: Simple endpoint returns authentication status without exposing user data
- **Stateless Design**: No server-side token storage for better scalability

> **Note on Token Expiration**: The default token expiration is set to 1 hour (`expiresIn: '1h'`) in `auth.module.ts`. For production environments, this should be paired with a refresh token mechanism for better security. You can modify this value based on your security requirements.

## Features

- **User Authentication**: Complete signup and login system
- **JWT-based Authorization**: Secure API endpoints with JSON Web Tokens
- **Simple Auth Check**: Lightweight endpoint to verify authentication status
- **Data Validation**: Strong request validation with custom decorators
- **Password Security**: Bcrypt hashing for secure password storage
- **PostgreSQL Integration**: Database persistence with Prisma ORM
- **Docker Support**: Containerized setup for easy deployment and development
- **Comprehensive Testing**: Jest testing framework with high coverage for reliable code quality

## Tech Stack

- **Backend Framework**: NestJS 11
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Package Manager**: pnpm (with security-enhanced configuration)
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: class-validator & class-transformer
- **Password Hashing**: bcrypt
- **Testing**: Jest with comprehensive test coverage
- **Containerization**: Docker & Docker Compose

## Getting Started

You can run this application either directly on your machine or using Docker.

### Option 1: Using Docker (Recommended)

#### Prerequisites

- Docker installed on your machine
- Docker Compose installed on your machine

#### Setup and Run

1. Clone the repository:

   ```bash
   git clone https://github.com/codigoisaac/CrystalCube.git
   cd CrystalCube
   ```

2. Create environment file:

   ```bash
   cp .env.example .env
   # Edit .env with your configuration if needed
   ```

3. Start the application using Docker Compose:

   ```bash
   docker-compose up -d
   ```

   This command starts three containers:

   - `crystal-cube_api`: The NestJS API running on port 3333
   - `crystal-cube_postgres`: PostgreSQL database running on port 7777
   - `crystal-cube_prismastudio`: Prisma Studio for database management running on port 5555

4. Access the application:

   - API: http://localhost:3333
   - Prisma Studio: http://localhost:5555

5. To stop the application:
   ```bash
   docker-compose down
   ```

### Option 2: Local Development

#### Prerequisites

- Node.js (v18 or higher)
- pnpm (v8 or higher)
- PostgreSQL

#### Environment Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/codigoisaac/CrystalCube.git
   cd CrystalCube
   ```

2. Install pnpm (if not already installed):

   ```bash
   # Using npm
   npm install -g pnpm

   # Or using curl (recommended)
   curl -fsSL https://get.pnpm.io/install.sh | sh -

   # Or using your package manager (Linux)
   sudo apt install pnpm
   ```

3. Install dependencies and set up environment:
   ```bash
   pnpm install
   cp .env.example .env
   # Edit .env with your configuration
   ```

#### Database Setup

1. **PostgreSQL**: Ensure your PostgreSQL server is running. This application requires PostgreSQL to function.

2. Configure your database connection in the `.env` file:

   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/crystal-cube?schema=public"
   ```

3. Apply migrations and generate the Prisma client:
   ```bash
   pnpm exec prisma migrate dev
   pnpm exec prisma generate
   ```

#### Running the Application

```bash
# Development
pnpm run start:dev

# Production
pnpm run build
pnpm run start:prod
```

The API will be available at `http://localhost:3333` (or the port specified in your env variables).

#### Running Prisma Studio Locally

Prisma Studio is a visual editor for your database. To run it locally (without Docker):

```bash
pnpm exec prisma studio
```

This will start Prisma Studio at http://localhost:5555. You can use it to view and edit the data in your database with a user-friendly interface.

## Testing

This project includes comprehensive testing using Jest to ensure code reliability and maintainability.

### Test Structure

The testing suite covers all critical components:

- **Authentication Service**: Tests for user registration, login, and error handling
- **Authentication Controller**: Tests for endpoint behavior and request/response handling
- **Authentication Guard**: Tests for JWT token validation and authorization
- **Data Transfer Objects (DTOs)**: Tests for validation rules and custom decorators
- **Custom Validators**: Tests for the Match decorator functionality

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode (automatically re-runs when files change)
pnpm run test:w

# Run tests with coverage report
pnpm run test:c

# Run tests with verbose output
pnpm run test:v

# Run tests with verbose output and coverage
pnpm run test:vc
```

### Test Coverage

The project maintains high test coverage across all modules. Coverage reports are generated in the `coverage/` directory when running tests with the coverage flag.

### Test Configuration

Jest is configured to:

- Use TypeScript with ts-jest transformer
- Support path mapping aliases (`@root/*` and `@src/*`)
- Exclude build artifacts and node_modules
- Generate coverage reports for all TypeScript files except configuration files
- Use Node.js test environment for backend testing

The Jest configuration can be found in the `jest` section of `package.json`.

## Docker Details

This project includes a complete Docker setup optimized for both development and production environments:

### Docker Components

- **Main API Container**: NestJS application with automatic database migrations on startup
- **PostgreSQL Container**: Database persistence with volume mapping
- **Prisma Studio Container**: Minimal web-based database management interface (optimized for resource efficiency)

### Docker Services

- **api**: The main NestJS application

  - Builds from `Dockerfile`
  - Runs on port 3333 (configurable in .env)
  - Automatically runs database migrations on startup
  - Uses multi-stage build for production optimization
  - Uses non-root user for enhanced security

- **postgres**: PostgreSQL database

  - Uses official PostgreSQL 16 Alpine image
  - Runs on port 7777 (maps to internal 5432)
  - Persists data using Docker volumes

- **prisma-studio**: Web interface for database management
  - Builds from `Dockerfile.prisma-studio`
  - Runs on port 5555
  - Minimal installation (only Prisma dependencies)
  - Provides a convenient UI for managing database records

### Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs from all containers
docker-compose logs -f

# View logs from a specific container
docker-compose logs -f api

# Stop all services
docker-compose down

# Rebuild containers (after making changes)
docker-compose up -d --build

# Remove volumes (caution: this deletes all database data)
docker-compose down -v
```

## Package Management

This project uses **pnpm** for enhanced performance, security, and disk efficiency:

### pnpm Advantages

- **Faster installations**: ~2x speed improvement over npm
- **Disk space efficiency**: Shared dependencies across projects
- **Enhanced security**: Prevents phantom dependencies and blocks untrusted scripts by default
- **Better monorepo support**: Excellent workspace management

### Security Configuration

The project includes security-enhanced pnpm configuration in `package.json`:

```json
{
  "pnpm": {
    "onlyBuiltDependencies": [
      "@nestjs/core",
      "@prisma/client",
      "@prisma/engines",
      "bcrypt",
      "prisma"
    ]
  }
}
```

This configuration follows pnpm v10+ security best practices by only allowing trusted packages to run build scripts.

### Common pnpm Commands

```bash
# Install dependencies
pnpm install

# Add a new dependency
pnpm add package-name

# Add a dev dependency
pnpm add -D package-name

# Remove a dependency
pnpm remove package-name

# Update dependencies
pnpm update

# Run scripts
pnpm run start:dev
pnpm run build

# Execute packages
pnpm exec prisma studio
pnpm exec nest generate module users
```

## API Endpoints

### Authentication

- **POST /auth/signup** - Register a new user
- **POST /auth/login** - Authenticate and receive token
- **GET /auth/check** - Check if current token is valid (protected route)

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
- If the token is valid, the request proceeds and returns the expected response

You can protect individual routes or apply the guard to an entire controller by placing the decorator at the controller level.

The `/auth/check` endpoint is perfect for frontend applications to verify if a user is still authenticated before accessing protected features.

## Password Requirements

- Minimum 8 characters
- At least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 symbol

## Development Notes

- JWT tokens expire after 1 hour by default (set in `auth.module.ts`)
- For production, consider implementing a refresh token mechanism for better security
- The API uses global validation pipes to automatically validate incoming requests
- Custom validation decorator (`Match`) is implemented for password confirmation
- Docker setup includes optimized containers with minimal attack surfaces
- pnpm configuration ensures secure dependency management and faster builds
- Comprehensive test suite ensures code reliability and facilitates safe refactoring

## Performance & Security

### Package Management Security

- **Script execution control**: Only trusted packages can run build scripts
- **Dependency isolation**: Prevents phantom dependencies and version conflicts
- **Faster CI/CD**: Improved build times in continuous integration pipelines

### Docker Optimization

- **Multi-stage builds**: Minimal production images
- **Resource efficiency**: Prisma Studio container ~70% smaller than full dependency installation
- **Security hardening**: Non-root users in all containers

### Testing Quality Assurance

- **High test coverage**: Comprehensive testing ensures code reliability
- **Automated validation**: Jest runs validate business logic and data flow
- **Continuous integration ready**: Tests can be easily integrated into CI/CD pipelines

## License

This project is licensed under the MIT License - see the LICENSE file for details.

The MIT License is a permissive license that allows anyone to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software, subject to the condition that the original copyright notice and permission notice be included in all copies or substantial portions of the software.

## Author

Isaac Muniz - [isaacmuniz.vercel.app](https://isaacmuniz.vercel.app)
