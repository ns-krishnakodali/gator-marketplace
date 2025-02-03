-- Create user gator only if it doesn't exist
DO
$$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'gator') THEN
        CREATE USER gator WITH PASSWORD '${DB_PASSWORD}';
    END IF;
END
$$;

-- Set role configurations
ALTER ROLE gator SET client_encoding TO 'utf8';
ALTER ROLE gator SET default_transaction_isolation TO 'read committed';
ALTER ROLE gator SET timezone TO 'UTC';

-- Create the marketplace database only if it doesn't exist
DO
$$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'marketplace') THEN
        CREATE DATABASE marketplace;
    END IF;
END
$$;

-- Grant privileges if the database exists
GRANT ALL PRIVILEGES ON DATABASE marketplace TO gator;

-- Switch to marketplace database and grant privileges
\c marketplace
GRANT ALL ON SCHEMA public TO gator;
