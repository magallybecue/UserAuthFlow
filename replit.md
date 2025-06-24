# CATMAT Matcher

## Overview

CATMAT Matcher is a full-stack web application designed to standardize material lists using the official Brazilian government CATMAT database. The system allows users to upload CSV/Excel files containing material descriptions, automatically processes them to find matches in the CATMAT database, and provides a review interface for manual verification and approval of matches.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with CSS variables for theming
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and build processes

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Session Management**: Express sessions with PostgreSQL store
- **Authentication**: Replit Auth (OpenID Connect) integration
- **File Processing**: Multer for file uploads, CSV parser and XLSX for file parsing
- **API Design**: RESTful endpoints with proper error handling

### Database Architecture
- **Primary Database**: PostgreSQL with Neon serverless adapter
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection**: Connection pooling with @neondatabase/serverless

## Key Components

### Authentication System
- **Provider**: Replit Auth using OpenID Connect
- **Session Storage**: PostgreSQL-backed sessions with connect-pg-simple
- **User Management**: Automatic user creation/update on authentication
- **Security**: HTTP-only cookies with secure settings

### File Upload & Processing System
- **Upload Handling**: Multer middleware with file type validation (CSV, XLS, XLSX)
- **File Limits**: 10MB maximum file size
- **Processing Pipeline**: Asynchronous processing with status tracking
- **Column Mapping**: User-configurable column mapping for material descriptions

### Material Matching Engine
- **CATMAT Integration**: Integration with Brazilian government material catalog
- **Confidence Scoring**: Automated confidence scoring for material matches
- **Review Workflow**: Manual review process for low-confidence matches
- **Status Management**: Comprehensive status tracking (PENDING, APPROVED, REJECTED, MANUAL)

### Review & Approval Interface
- **Data Grid**: Comprehensive table interface for reviewing matches
- **Bulk Operations**: Batch approval/rejection capabilities
- **Search Integration**: Real-time search through CATMAT database
- **Export Functionality**: Export processed results to various formats

## Data Flow

1. **User Authentication**: User logs in via Replit Auth, session created in PostgreSQL
2. **File Upload**: User uploads CSV/Excel file, stored in uploads directory
3. **Column Mapping**: User maps file columns to expected data fields
4. **Processing**: System parses file, extracts material descriptions, searches CATMAT database
5. **Matching**: Algorithm generates confidence scores and creates matched items
6. **Review**: User reviews matches, approves/rejects/manually assigns materials
7. **Export**: Final processed results exported for use

## External Dependencies

### Authentication & Session Management
- **Replit Auth**: OpenID Connect provider for user authentication
- **PostgreSQL**: Session storage and primary database

### File Processing
- **Multer**: Multipart form data handling for file uploads
- **csv-parser**: CSV file parsing capabilities
- **XLSX**: Excel file format support

### UI & Styling
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library

### Development Tools
- **Vite**: Development server and build tool
- **TypeScript**: Type safety and development experience
- **ESBuild**: Fast JavaScript bundling for production

## Deployment Strategy

### Development Environment
- **Runtime**: Node.js 20
- **Database**: PostgreSQL 16
- **Development Server**: Vite dev server with HMR
- **Port Configuration**: Application runs on port 5000

### Production Build
- **Frontend Build**: Vite builds React app to `dist/public`
- **Backend Build**: ESBuild bundles server code to `dist/index.js`
- **Deployment Target**: Replit Autoscale deployment
- **Environment**: Production environment variables for database and auth

### Database Management
- **Migrations**: Drizzle Kit for schema migrations
- **Connection**: Environment-based DATABASE_URL configuration
- **Session Storage**: Automatic session table management

## Recent Changes

- **June 24, 2025**: Complete CATMAT Matcher application implemented
  - Full-stack application with React frontend and Node.js backend
  - PostgreSQL database with comprehensive schema for materials, uploads, and matching
  - Replit Auth integration with user management
  - All core pages implemented: landing, dashboard, upload, processing, review, search, history
  - Sample CATMAT data loaded with categories, subcategories, and materials
  - File upload functionality with CSV/Excel support
  - Real-time processing simulation with progress tracking
  - Manual review interface for match validation
  - Material search with filtering capabilities
  - Fixed Select component JavaScript errors for proper functionality

## User Preferences

Preferred communication style: Simple, everyday language.