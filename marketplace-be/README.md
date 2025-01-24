# Gator Marketplace Backend Service

This repository contains the backend service for the Gator Marketplace application. It is built using the [Gin Web Framework](https://gin-gonic.com/), providing APIs for the application's functionality. \

## Prerequisites
To set up and run the project locally, ensure the following are installed:

1. **Go** (version 1.18 or higher): [Download Go](https://go.dev/dl/)
2. **PostgreSQL** (or another database, if configured in the project): [Download PostgreSQL](https://www.postgresql.org/download/)

## Getting Started

Follow these steps to set up the project locally:

### 1. Clone the Repository
```bash
git clone <repository-url>
cd gator-marketplace-backend
```

### 2. Install Dependencies
Download the necessary Go modules by running:
```bash
go mod tidy
```

### 3. Run the Application
Start the Gin server by executing:
```bash
go run main.go
```
The server will start on the port specified in the `.env` file (default: `5000`).
