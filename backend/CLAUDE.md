# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Web-based inventory and tracking management system. Two separate projects:
- `inventory/` — Spring Boot 4.0.6 backend (Java 17, Maven)
- `../frontend/` — React 19 frontend (Create React App)

## Backend (inventory/)

### Commands
```bash
# Run the application
./mvnw spring-boot:run

# Build (skip tests)
./mvnw clean package -DskipTests

# Run all tests
./mvnw test

# Run a single test class
./mvnw test -Dtest=InventoryApplicationTests
```

### MySQL Setup
Before running, create the database and update `application.properties`:
```sql
CREATE DATABASE inventory_db;
```
Then set `spring.datasource.username` and `spring.datasource.password` to your MySQL credentials. Hibernate auto-creates all tables on first run (`ddl-auto=update`).

### Architecture

Standard Spring Boot layered architecture under `com.sanjose.inventory`:

```
config/         SecurityConfig (CORS + auth)
controller/     REST controllers — thin, delegate to services
service/        Business logic, @Transactional
repository/     Spring Data JPA interfaces
entity/         JPA @Entity classes
exception/      ResourceNotFoundException, InsufficientStockException, GlobalExceptionHandler
```

**Domain model:**
- `Category` — product categories
- `Supplier` — supplier contact info
- `Product` → Category, Supplier (ManyToOne)
- `InventoryItem` → Product (OneToOne) — tracks current stock quantity and minimum stock level
- `StockTransaction` → Product (ManyToOne) — records every IN / OUT / ADJUSTMENT movement

**Key business rule (StockTransactionService):** Creating a transaction atomically updates the linked `InventoryItem` quantity. OUT transactions throw `InsufficientStockException` if stock is insufficient.

### REST API Base URLs (all under `/api/`)
| Endpoint | Description |
|---|---|
| `/api/categories` | CRUD categories |
| `/api/suppliers` | CRUD suppliers, `?search=` |
| `/api/products` | CRUD products, `?search=`, `?categoryId=`, `?supplierId=` |
| `/api/inventory` | All inventory items |
| `/api/inventory/low-stock` | Items at or below min stock level |
| `/api/inventory/product/{id}` | Create/read/update inventory for a product |
| `/api/transactions` | All transactions, `?type=IN\|OUT\|ADJUSTMENT` |
| `/api/transactions/product/{id}` | Transaction history for a product |

### Security
CSRF disabled. All `/api/**` endpoints currently permit unauthenticated access (open for development). CORS allows `http://localhost:3000`.

### Dependencies
- Spring Web MVC, Spring Data JPA, Spring Security
- MySQL Connector/J, Lombok, Bean Validation

## Frontend (../frontend/)

### Commands
```bash
# Start dev server (http://localhost:3000)
npm start

# Run tests
npm test

# Production build
npm run build
```

### Stack
React 19, Create React App, React Testing Library + Jest
