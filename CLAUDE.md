# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack Todo application with Koa2 + MySQL backend and vanilla JavaScript frontend. The project includes MCP (Model Context Protocol) integration to enable Claude clients to remotely manage todos through an MCP server.

## Development Commands

### Main Application
- `npm start` - Start the production server
- `npm run dev` - Start development server with nodemon auto-reload
- `npm run package` - Create deployment zip file
- `npm install` - Install dependencies

### MCP Server
- `cd todo-mcp-server && npm start` - Start MCP server for Claude integration
- `cd todo-mcp-server && npm run dev` - Start MCP server in development mode
- `cd todo-mcp-server && node test-mcp.js` - Test MCP server functionality

## Architecture

### Backend Structure (Koa2)
- **server.js** - Main server entry point with middleware setup
- **config/database.js** - MySQL connection pool and database initialization
- **routes/todos.js** - RESTful API routes for todo operations
- **middleware/auth.js** - API key authentication system
- **middleware/security.js** - Rate limiting, input sanitization, security headers

### Frontend (Vanilla JavaScript)
- **index.html** - Main application page
- **script.js** - Frontend logic with Fetch API
- **style.css** - Application styling

### MCP Integration
- **todo-mcp-server/** - Standalone MCP server for Claude integration
  - **src/index.js** - MCP server implementation
  - **test-mcp.js** - MCP server testing script

## Database Configuration

The app uses MySQL with automatic database and table creation. Configure via environment variables:

```bash
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=todoapp
```

### Database Schema
- **todos** table with columns: id, text, completed, created_at, updated_at

## API Endpoints

### Standard CRUD
- `GET /api/todos` - List all todos
- `POST /api/todos` - Create single todo
- `PUT /api/todos/:id` - Update todo
- `DELETE /api/todos/:id` - Delete todo

### MCP-Optimized Endpoints
- `PATCH /api/todos/:id/toggle` - Toggle completion status
- `POST /api/todos/batch` - Batch create todos (max 100)
- `GET /api/todos/stats` - Get statistics (total, completed, pending, completion rate)
- `DELETE /api/todos/completed` - Clear all completed todos

## Security Features

- API key authentication (optional or required modes)
- Rate limiting (1000 requests per 15 minutes per IP)
- Input sanitization for XSS prevention
- Security headers (XSS protection, content sniffing prevention)
- CORS configuration with configurable allowed origins

## Environment Configuration

Copy `.env.example` to `.env` and configure:
- Database connection settings
- API keys for authentication
- CORS allowed origins
- Server port
- Environment mode (development/production)

## MCP Server Integration

The todo-mcp-server enables Claude clients to manage todos remotely:
- 8 MCP tools for todo operations
- Connects to the main Todo API via HTTP
- Supports batch operations and statistics
- Configure in Claude desktop app via `claude_desktop_config.json`

## Development Notes

- Frontend uses vanilla JavaScript with Fetch API - no build process required
- Backend follows RESTful conventions with comprehensive error handling
- Database operations use connection pooling for concurrent access
- Security middleware applied globally for all routes
- MCP server runs independently and communicates via HTTP API

## Deployment

- Production deployment via PM2 process manager recommended
- Nginx reverse proxy configuration available
- Database initialization runs automatically on startup
- Environment variables should be secured in production