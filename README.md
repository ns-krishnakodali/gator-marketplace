
# Gator Marketplace

Gator Marketplace is a full-stack web application built with Angular for the frontend and Gin (Go) for the backend. It facilitates a streamlined marketplace experience for users at the University of Florida.

---

##  Project Structure

```plaintext
gator-marketplace/
├── gator-marketplace-frontend/   # Angular frontend
├── gator-marketplace-backend/    # Gin backend
```

---

##  Getting Started

### Prerequisites

Ensure the following tools are installed:

- **Node.js** (v16+)
- **Angular CLI** (v19.1.4+)
- **Go** (v1.18+)
- **PostgreSQL**
- (Optional) **Docker & Docker Compose**

---

##  Frontend (Angular)

###  Installing Dependencies

```bash
cd gator-marketplace-frontend
npm install
```

###  Running the Development Server

```bash
ng serve
```

Visit `http://localhost:4200/` to see the app running. It will auto-reload on source changes.

### 🏗️ Building the Project

```bash
ng build         # Dev build
ng build --prod  # Production build
```

###  Running Unit Tests

```bash
ng test
```

###  Running E2E Tests (with Cypress)

Ensure Cypress is installed and configured. Then:

```bash
npx cypress open
```

or run headlessly:

```bash
npx cypress run
```

---

##  Backend (Gin + PostgreSQL)

###  Clone & Navigate

```bash
git clone <repository-url>
cd gator-marketplace-backend
```

###  Install Go Modules

```bash
go mod tidy
```

###  Setup PostgreSQL

#### Option 1: Manual Setup

```sql
-- Replace <USER>, <PASSWORD>, <DB> accordingly
CREATE USER <USER> WITH PASSWORD '<PASSWORD>';
CREATE DATABASE <DB>;
GRANT ALL PRIVILEGES ON DATABASE <DB> TO <USER>;
\c <DB> postgres
GRANT ALL ON SCHEMA public TO <USER>;
```

#### Option 2: With Docker

```bash
docker-compose up -d
```

> Creates:
> - User: `gator`
> - DB: `marketplace`
> - Password: from `.env` file

###  Environment Variables

Create a `.env` file in the root of the backend directory:

```bash
cp .env.example .env
```

Generate a JWT secret:

```bash
openssl rand -base64 32
```

Update the database URL, JWT secret, and other values as needed.

###  Running the Server

```bash
go run main.go
```

Backend starts on the port defined in `.env` (default: `5000`).

---

##  Linting & Code Quality

### Angular

```bash
ng lint
```

### Go

Use `golangci-lint` or `go fmt` for linting and formatting.

---

##  Additional Resources

- [Angular CLI Documentation](https://angular.dev/tools/cli)
- [Gin Framework Docs](https://gin-gonic.com/docs/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Cypress Testing](https://docs.cypress.io/)

## Contributors
- Krishna Kodali
- Harshak Parmar
- Bhanu Prasad
- Anshita Rao
