# FOMO - Getting Started

## Quick Start

### Option 1: Using Startup Scripts (Recommended)

**On Linux/Mac:**
```bash
./start.sh
```

**On Windows:**
```bash
start.bat
```

### Option 2: Manual Startup

#### Start Backend (NestJS)
```bash
cd backend
npm install  # Only needed on first run
npm run start
```
- Backend runs on: `http://localhost:3000`
- Swagger API docs: `http://localhost:3000/api`
- **Note:** Migrations run automatically on startup

#### Start Frontend (Angular)
```bash
cd frontend
npm install  # Only needed on first run
npm run start
```
- Frontend runs on: `http://localhost:4200`

---

## Project Structure

```
FOMO/
├── backend/                 # NestJS API Server
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── users/          # User management
│   │   ├── vendors/        # Vendor management
│   │   ├── db/
│   │   │   ├── schema.ts      # Drizzle ORM schema
│   │   │   └── run-migrations.ts  # Migration runner
│   │   └── main.ts         # Application entry point
│   ├── drizzle/            # Database migrations
│   ├── test/               # E2E tests
│   └── package.json
│
├── frontend/               # Angular Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── services/   # Authentication service
│   │   │   ├── guards/     # Route guards
│   │   │   └── login-users/, register-users/, etc.
│   │   └── main.ts
│   └── package.json
│
├── start.sh               # Startup script (Linux/Mac)
├── start.bat              # Startup script (Windows)
└── README.md

```

---

## Database Setup

### Automatic Migrations
- **Migrations run automatically** when the backend starts (`npm run start`)
- The migration runner is implemented in `backend/src/db/run-migrations.ts`
- Called from `backend/src/main.ts` before the app initializes

### Manual Migration (if needed)
```bash
cd backend
npx drizzle-kit migrate
```

### Database Connection
Database credentials are configured in:
- `backend/.env` - contains `DATABASE_URL`
- `backend/drizzle.config.ts` - Drizzle ORM configuration

### Drizzle Kit - Schema Management

**Drizzle Kit** is used to manage database schema changes through migrations. When you modify the database schema in `backend/src/db/schema.ts`, you must generate and commit the migration files.

#### Workflow for Schema Changes

1. **Modify the schema** in `backend/src/db/schema.ts`
   ```typescript
   // Example: Adding a new column
   export const users = pgTable('users', {
     id: serial('id').primaryKey(),
     email: varchar('email', { length: 255 }).notNull().unique(),
     // ... other fields
     newField: varchar('new_field', { length: 255 }).default(''),
   });
   ```

2. **Generate the migration** (creates SQL files in `drizzle/` folder)
   ```bash
   cd backend
   npx drizzle-kit generate postgresql
   ```
   This creates a new migration file like `drizzle/0001_new_migration.sql`

3. **Review the generated SQL** in `drizzle/0001_new_migration.sql` to ensure it's correct

4. **Commit the migration file** to version control
   ```bash
   git add backend/drizzle/0001_new_migration.sql
   git commit -m "Add new migration: [description]"
   ```

5. **Migrations apply automatically** on next backend startup
   - The `run-migrations.ts` script runs migrations when the backend starts
   - All pending migrations in `drizzle/` folder are applied to the database

#### Important Rules

⚠️ **Before committing schema changes:**
- Always run `npx drizzle-kit generate postgresql` to create migration files
- Commit the generated SQL files to version control
- **Never commit raw schema changes without migrations**

✅ **Migration best practices:**
- One migration per feature/change
- Review generated SQL before committing
- Test migrations locally before pushing to shared repository
- Migrations are applied in order (based on filename)
- Never delete or modify existing migration files

#### Useful Drizzle Kit Commands

```bash
cd backend

# Generate migrations (creates SQL files from schema changes)
npx drizzle-kit generate postgresql

# Apply pending migrations to database
npx drizzle-kit migrate

# Drop all tables and recreate from migrations (USE WITH CAUTION - development only!)
npx drizzle-kit drop

# View migration status
npx drizzle-kit studio  # Opens visual migration explorer
```

---

## Available Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and get JWT token
- `GET /auth/profile` - Get current user profile (requires auth)

### Users
- `POST /users` - Create a new user
- `GET /users` - Get all users (requires auth)
- `GET /users/:id` - Get a specific user (requires auth)
- `PATCH /users/:id` - Update a user (requires auth)
- `DELETE /users/:id` - Delete a user (requires auth)

### Vendors
- `POST /vendors` - Register a new vendor
- `GET /vendors` - Get all vendors (requires auth)
- `GET /vendors/:id` - Get a specific vendor (requires auth)
- `PATCH /vendors/:id` - Update a vendor (requires auth)
- `DELETE /vendors/:id` - Delete a vendor (requires auth)

---

## Testing

### Run Backend Unit Tests
```bash
cd backend
npm run test
```

### Run Backend E2E Tests
```bash
cd backend
npm run test:e2e
```

### Run Frontend Tests
```bash
cd frontend
npm test
```

---

## Development Commands

### Backend
```bash
cd backend
npm run start:dev       # Start in watch mode
npm run build          # Build for production
npm run lint          # Run ESLint
npm run format        # Format code with Prettier
```

### Frontend
```bash
cd frontend
ng serve              # Start dev server
ng build              # Build for production
ng test               # Run tests
```

---

## Features

✅ **User Management**
- User registration and login
- JWT-based authentication
- Password hashing with bcryptjs
- User CRUD operations

✅ **Vendor Management**
- Vendor registration (separate flow)
- Vendor activation/approval system (active/inactive)
- Vendor filtering

✅ **Admin Features**
- Superuser property for admin identification
- User approval workflow

✅ **Database**
- PostgreSQL with Drizzle ORM
- Automatic migrations on startup
- Schema management with Drizzle Kit

✅ **API**
- REST API with NestJS
- JWT authentication (Bearer token)
- Swagger/OpenAPI documentation
- Validation with class-validator

✅ **Frontend**
- Angular v21.1
- Reactive forms with validation
- Authentication service with interceptor
- Route guards for protected pages

---

## Troubleshooting

### Port Already in Use
If port 3000 or 4200 is already in use:
```bash
# Kill process on port 3000 (Linux/Mac)
lsof -ti:3000 | xargs kill -9

# Kill process on port 4200 (Linux/Mac)
lsof -ti:4200 | xargs kill -9
```

### Database Connection Error
- Verify `DATABASE_URL` in `backend/.env`
- Ensure PostgreSQL is running
- Check database credentials

### Migration Errors
Clear old migrations and regenerate:
```bash
cd backend
rm -rf drizzle
npx drizzle-kit generate postgresql  # For the first time
```

---

## Environment Variables

Create `backend/.env`:
```
DATABASE_URL=postgresql://fomo:password@localhost:5432/fomo
JWT_SECRET=your-secret-key-here
NODE_ENV=development
PORT=3000
```

---

## Next Steps

- [ ] Implement admin dashboard for vendor approval
- [ ] Implement pagination for list endpoints
- [ ] Add more comprehensive error handling
- [ ] Setup CI/CD pipeline
- [ ] Configure production deployment

---

For more information, see:
- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)
