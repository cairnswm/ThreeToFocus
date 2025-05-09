# API Structure


THIS IS UNTESTED!!!!

This API has been organized into a modular structure for better maintainability and separation of concerns.

## Directory Structure

- **api/config/** - Configuration files
  - `database.ts` - Database connection configuration
  - `api-config.ts` - API routes and models configuration

- **api/types/** - TypeScript interfaces
  - `index.ts` - Contains all interface definitions

- **api/middleware/** - Middleware functions
  - `security.ts` - Authentication and authorization middleware

- **api/functions/** - API handler functions
  - `user-functions.ts` - User-related API functions

- **api/utils/** - Utility functions
  - `route-utils.ts` - Route processing utilities
  - `swagger.ts` - Swagger documentation setup

- **api/routes/** - Route handlers
  - `register-routes.ts` - Route registration logic

- **api/index.ts** - Main entry point

## How It Works

1. The API configuration is defined in `api/config/api-config.ts`
2. The configuration is processed by `api/utils/route-utils.ts` to flatten the route structure
3. Routes are registered in `api/routes/register-routes.ts`
4. Swagger documentation is generated in `api/utils/swagger.ts`
5. The main application is initialized in `api/index.ts`

## Running the API

To run the API:

```bash
npm install
npm start
```

The API will be available at http://localhost:3000, and the Swagger documentation at http://localhost:3000/docs.

## Adding New Routes

To add new routes, modify the `exampleConfig` object in `api/config/api-config.ts`. The configuration supports:

- Nested routes
- Different HTTP methods
- Security settings
- Custom handler functions

## Security

The API supports different security mechanisms:

- Public routes (secured: false)
- JWT authentication (default)
- Custom security functions
- Ownership checks
