# Hollow Game Archive

This project has been reorganized to separate frontend and backend code:

## Project Structure

- **client/** - Contains all the frontend React application code

  - **src/** - React components, hooks, and pages
  - **public/** - Static assets
  - Own package.json with client-specific dependencies
  - Frontend-specific configuration files (vite.config.ts, tailwind.config.ts, etc.)

- **server/** - Contains all the backend Express application code

  - API routes and controllers
  - Database connection and models
  - Server configuration
  - Own package.json with server-specific dependencies

- **shared/** - Contains code shared between frontend and backend
  - Database schema definitions
  - Type definitions
  - Shared utilities

## Installation

```bash
# Install dependencies for all packages
npm run setup
```

## Development

```bash
# Run both client and server in development mode
npm run dev

# Run only the client
npm run dev:client

# Run only the server
npm run dev:server
```

## Building for Production

```bash
# Build both client and server
npm run build

# Start the production server
npm run start
```
