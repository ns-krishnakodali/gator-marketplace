# Gator Marketplace BE

This repository contains the backend service for the Gator Marketplace application. It is built using the [Gin Web Framework](https://gin-gonic.com/), providing APIs for the application's functionality.

## Prerequisites

Before setting up and running the project locally, make sure you have the following installed:

1. **Go** (version 1.18 or higher): [Download Go](https://go.dev/dl/)
2. **PostgreSQL**: [Download PostgreSQL](https://www.postgresql.org/download/)

## Getting Started

Follow the steps below to set up the project locally:

### 1. Clone the Repository

```bash
git clone <repository-url>
cd gator-marketplace-backend
```

### 2. Install Dependencies

Run the following command to download the necessary Go modules:

```bash
go mod tidy
```

### 3. Set Up the Database

Run the following SQL commands to set up the database and user:

```sql
-- Replace the placeholders i.e. USER and PASSWORD with appropriate values.
CREATE USER <USER> WITH PASSWORD '<PASSWORD>';
ALTER ROLE <USER> SET client_encoding TO 'utf8';
ALTER ROLE <USER> SET default_transaction_isolation TO 'read committed';
ALTER ROLE <USER> SET timezone TO 'UTC';
CREATE DATABASE <DB>;
GRANT ALL PRIVILEGES ON DATABASE <DB> TO <USER>;
\c EXAMPLE_DB postgres
GRANT ALL ON SCHEMA public TO <USER>;
```

### 4. Configure Environment Variables

Create a `.env` file (if not already present) and add the following variables:

```plaintext
DATABASE_USER=USER
DATABASE_PASSWORD=PASSWORD
DATABASE_NAME=DB
DATABASE_PORT=5432
DATABASE_HOST=localhost
```

- Replace `USER`, `PASSWORD`, and `DB` with the values used during the PostgreSQL database setup.
- Ensure `.env` is properly configured before running the application.

### 5. Run the Application

Start the server by executing the following command:

```bash
go run main.go
```

The server will start on the port specified in the `.env` file (default: `5000`).
