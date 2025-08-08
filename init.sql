-- init.sql
-- This script will be run automatically by the PostgreSQL container on its first startup.

-- Create the hosts table with all the necessary columns.
-- "IF NOT EXISTS" makes it safe to run this script every time.
CREATE TABLE IF NOT EXISTS hosts (
    id SERIAL PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL UNIQUE,
    mac_address VARCHAR(17),
    hostname VARCHAR(255),
    os_name VARCHAR(255),
    vendor VARCHAR(255),
    status VARCHAR(50),
    last_seen TIMESTAMP WITHOUT TIME ZONE
);

-- You can add other tables here using the same CREATE TABLE IF NOT EXISTS pattern.
-- For example:
-- CREATE TABLE IF NOT EXISTS users ( ... );
-- CREATE TABLE IF NOT EXISTS vulnerabilities ( ... );

-- A log message to confirm the script ran.
-- NOTE: In PostgreSQL logs, this will appear as a command, not a printed message.
SELECT 'Database initialization script completed successfully.';
