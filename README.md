# Food NEST Application

[![Backend CI Pipeline](https://github.com/mehdihadeli/food-nest-app/actions/workflows/ci.yml/badge.svg)](https://github.com/mehdihadeli/food-nest-app/actions/workflows/ci.yml)

> 💡 A practical api sample based on Vertical Slice Architecture, NestJs, TypeORM and OpenTelemetry.


## Table of Contents

- [Food NEST Application](#food-nest-application)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Technologies - Libraries](#technologies---libraries)
  - [Set up and Start the Infrastructure](#set-up-and-start-the-infrastructure)
  - [Setup and Start the Backend](#setup-and-start-the-backend)
    - [Install dependencies](#install-dependencies)
    - [Run the project](#run-the-project)
    - [Run tests](#run-tests)
    - [Build Project](#build-project)
    - [Format \&\& Lint](#format--lint)
  - [Application Structure](#application-structure)
  - [🏗️ Backend Folder Structure: Vertical Slice Architecture](#️-backend-folder-structure-vertical-slice-architecture)
    - [🔑 Key Principles](#-key-principles)

## Features

- ✅ Uses **Vertical Slice Architecture** for feature-based modularity and clear separation of concerns
- ✅ Implements a comprehensive test suite: **Unit Tests**, **Integration Tests**, and **End-to-End (E2E) Tests**
- ✅ Employs **NestJS** as the application framework for scalable server-side development
- ✅ Utilizes **TypeORM** for robust ORM and data access
- ✅ Integrates **OpenTelemetry** and **OpenTelemetry-Collector** for collecting logs, metrics, and distributed
  traces to enhance observability
- ✅ Enforces code quality and standards with **ESLint** and **Prettier**
- ✅ Ensures type safety and modern JavaScript with **TypeScript**
- ✅ Advanced backend [Configuration Management](./backend/src/libs/configurations) based on **env** files and
  **appsettings.
  json** files
- ✅ Facilitates efficient development workflow with scripts, hooks (Husky), and commit linting
- ✅ Using **Swagger** and **Api-Versioning** for application apis
- ✅ Using [Problem Details](/backend/src/libs/core/exceptions) standard for readable details of errors.
- ✅ Using Docker-Compose for our deployment mechanism.
- ✅ Using sortable **uuid v7** for Ids
- ✅ Using **Optimistic Conurrency** based on TypeORM concurrency token
- ✅ Using **Soft Delete** based on TypeORM
- ✅ Integration **Aspire** for hosting application

## Technologies - Libraries

- ✔️ **[`microsoft/TypeScript`](https://github.com/microsoft/TypeScript)** - TypeScript is a language for application-scale JavaScript.
- ✔️ **[`nestjs/nest`](https://github.com/nestjs/nest)** - Nest is a framework for building efficient, scalable Node.js server-side applications
- ✔️ **[`nestjs/cqrs`](https://github.com/nestjs/cqrs)** - A lightweight CQRS module for Nest framework (node.js)
- ✔️ **[`nestjs/typeorm`](https://github.com/nestjs/typeorm)** - TypeORM module for Nest
- ✔️ **[`tada5hi/typeorm-extension`](https://github.com/tada5hi/typeorm-extension)** - This library provides utitlites to create & drop the database, seed the database and apply URL query parameter(s)
- ✔️ **[`nestjs/swagger`](https://github.com/nestjs/swagger)** - OpenAPI (Swagger) module for Nest
- ✔️ **[`open-telemetry/opentelemetry-js`](https://github.com/open-telemetry/opentelemetry-js)** - A framework for collecting traces, metrics, and logs from applications
- ✔️ **[`motdotla/dotenv`](https://github.com/motdotla/dotenv)** - Dotenv is a zero-dependency module that loads environment variables from a .env
- ✔️ **[`jestjs/jest`](https://github.com/jestjs/jest)** - A javascript framework for testing
- ✔️ **[`testcontainers/testcontainers-node`](https://github.com/testcontainers/testcontainers-node)** - A library to support tests with throwaway instances of Docker containers
- ✔️ **[`faker-js/faker`](https://github.com/faker-js/faker)** - Generate massive amounts of fake (but realistic) data for testing and development
- ✔️ **[`ladjs/supertest`](https://github.com/ladjs/supertest)** - High-level abstraction for testing HTTP
- ✔️ **[`eslint/eslint`](https://github.com/eslint/eslint)** - ESLint is a tool for identifying and reporting on patterns found in ECMAScript/JavaScript code
- ✔️ **[`prettier/prettier`](https://github.com/prettier/prettier)** - Opinionated Code Formatter
- ✔️ **[`uuidjs/uuid`](https://github.com/uuidjs/uuid)** - Generate RFC-compliant UUIDs in JavaScript
- ✔️ **[`@fluffy-spoon/substitute`](https://github.com/ffMathy/FluffySpoon.JavaScript.Testing.Faking)** - An NSubstitute port to TypeScript called substitute.js

## Set up and Start the Infrastructure

This project uses a PostgreSQL database running in a Docker container. Start the infrastructure using `make`:

```bash
# Start docker-compose
docker-compose -f ./deployments/docker-compose/docker-compose.yaml up -d

# Stop docker-compose
docker-compose -f ./deployments/docker-compose/docker-compose.yaml down
```

This command will run the PostgreSQL docker container using docker-compose. Ensure Docker is installed and running on your machine.

## Setup and Start the Backend

### Install dependencies

First, we need to install [pnpm](https://pnpm.io/) because we use `pnpm` as our package manager. Then we should install the dependencies:

```bash
npm run install:dependencies
```

### Run the project

```bash
# run backend in dev mode
pnpm run dev:backend

# run backend in debug mode
pnpm run debug:backend
```

After running the project, you can access the Swagger UI at <http://localhost:5000/swagger>.

### Run tests

```bash
# run backend unit tests
pnpm run test:unit:backend

# run backend integration tests
pnpm run test:integration:backend

# run backend e2e tests
pnpm run test:e2e:backend
```

### Build Project

```bash
# build backend
pnpm run build:backend
```

### Format && Lint

```bash
# format code
pnpm run format:backend

# fix backend lints
pnpm run lint:fix:backend

# lint backend
pnpm run lint:backend
```

## Using Aspire

Install the [`Aspire CLI`](https://learn.microsoft.com/en-us/dotnet/aspire/cli/install?tabs=windows) tool:

```bash
# Bash
dotnet tool install -g Aspire.Cli
```

To run the application using the `Aspire App Host` and using Aspire dashboard in the development mode run following command:

```bash
aspire run
```

After running the command, `Aspire dashboard` will be available with all application components.

## Application Structure

In this project, I used [vertical slice architecture](https://jimmybogard.com/vertical-slice-architecture/) and
[feature folder structure](http://www.kamilgrzybek.com/design/feature-folders/):

- We treat each request as a distinct use case or slice, encapsulating and grouping all concerns from front-end to back.
- When we are adding or changing a feature in an application in traditional n-tier architecture, we are typically touching many different "layers" in an application. We are changing the user interface, adding fields to models, modifying validation, and so on. Instead of coupling across a layer, we couple vertically along a slice, and each change affects only one slice.
- We `minimize coupling` between slices and `maximize cohesion` within a slice, ensuring that related code is grouped together logically and independently.
- With this approach, each of our vertical slices can decide for itself how to best fulfill the request. New features only add code, and we're not changing shared code and worrying about side effects.
- By grouping all code related to a feature into a single slice, the architecture improves maintainability and makes it easier to understand and modify individual features without affecting others.
- Testing becomes more straightforward, as each slice encapsulates all logic related to its feature, enabling isolated and effective testing.

![](./assets/vertical-slice-architecture.jpg)

## 🏗️ Backend Folder Structure: Vertical Slice Architecture

Our `backend` is organized using **Vertical Slice Architecture** — where each feature (use case) is a self-contained, end-to-end slice spanning controller, DTO, handler, and data access. This ensures **high cohesion, low coupling**, and easy maintainability.

```
src/
├── app/
│   ├── app.module.ts
│   ├── app.infrastructure.ts
│   └── modules/
│       │
│       ├───📁 ingredients/                          # Bounded Context: Ingredient Management
│       │   ├───📁 contracts/                        # Abstractions for external dependencies
│       │   │   └───📄 ingredient-repository.ts
│       │   │
│       │   ├───📁 data/                             # TypeORM implementations
│       │   │   ├───📄 ingredient.repository.ts
│       │   │   ├───📄 ingredient.schema.ts
│       │   │   └───📄 price-history.schema.ts
│       │   │
│       │   ├───📁 dtos/                             # API input/output models
│       │   │   ├───📄 ingredient-dto.ts
│       │   │   ├───📄 csv-row-dto.ts
│       │   │   └───📄 price-data-item-dto.ts
│       │   │
│       │   ├───📁 entities/                         # Domain models
│       │   │   ├───📄 ingredient.entity.ts
│       │   │   └───📄 price-history.entity.ts
│       │   │
│       │   ├───📁 features/                         # VERTICAL SLICES — One folder per use case
│       │   │   ├───📁 adding-price-to-ingredient/
│       │   │   ├───📁 creating-ingredient/
│       │   │   ├───📁 getting-ingredient-by-id/
│       │   │   ├───📁 getting-ingredients/
│       │   │   ├───📁 getting-latest-ingredient-price/
│       │   │   ├───📁 importing-ingredients/
│       │   │   └───📁 importing-price-changes/
│       │   │
│       │   └───📄 ingredients.module.ts
│       │   └───📄 ingredients.mapper.ts
│       │   └───📄 ingredients.tokens.ts
│       │
│       ├───📁 recipes/                              # Bounded Context: Recipe Management
│       │   ├───📁 contracts/
│       │   │   └───📄 recipe-repository.ts
│       │   │
│       │   ├───📁 data/
│       │   │   ├───📄 recipe.repository.ts
│       │   │   ├───📄 recipe.schema.ts
│       │   │   └───📄 recipe-ingredient.schema.ts
│       │   │
│       │   ├───📁 dto/
│       │   │   ├───📄 recipe-dto.ts
│       │   │   ├───📄 recipe-with-cost-dto.ts
│       │   │   └───📄 ingredient-cost-dto.ts
│       │   │
│       │   ├───📁 entities/
│       │   │   ├───📄 recipe.entity.ts
│       │   │   └───📄 recipe-ingredient.entity.ts
│       │   │
│       │   ├───📁 features/                         # VERTICAL SLICES — One folder per use case
│       │   │   ├───📁 creating-recipe/
│       │   │   ├───📁 deleting-recipe/
│       │   │   ├───📁 getting-recipe-by-id-with-cost/
│       │   │   ├───📁 getting-recipes/
│       │   │   └───📁 updating-recipe/
│       │   │
│       │   └───📄 recipes.module.ts
│       │   └───📄 recipes.mapper.ts
│       │   └───📄 recipes.tokens.ts
│       │
│       └───📁 shared/                               # Shared module utilities (e.g., guards, interceptors)
│           └───📄 shared.module.ts
│
├───📁 database/
│   ├───📁 data/                                     # Seed files & sample datasets
│   │   ├───📄 ingredients.csv
│   │   └───📄 price_changes.json
│   │
│   ├───📁 factories/                                # Test/data builders
│   │   ├───📄 ingredient.factory.ts
│   │   └───📄 price-history.factory.ts
│   │
│   ├───📁 migrations/                               # TypeORM migrations
│   │   └───📄 1757874363964-init.ts
│   │
│   └───📁 seeds/                                    # Production seed scripts
│       └───📄 ingredient.seeder.ts
│
├───📁 libs/                                         # Reusable cross-cutting infrastructure
│   ├───📁 configurations/                           # App config loading & typing
│   ├───📁 core/                                     # Base entities, validations, exceptions
│   ├───📁 logger/                                   # Logging abstractions (Pino/Winston/Nest)
│   ├───📁 opentelemetry/                            # Distributed tracing setup
│   ├───📁 postgres-typeorm/                         # TypeORM integration & subscribers
│   ├───📁 swagger/                                  # OpenAPI/Swagger configuration
│   ├───📁 test/                                     # Test harnesses & fixtures
│   ├───📁 versioning/                               # API versioning strategy
│   └───📁 web/                                      # HTTP middleware (CORS, response time, etc.)
│
└───📁 test/
    ├───📁 e2e-tests/                                # End-to-end API tests (HTTP level)
    ├───📁 integration-tests/                        # Feature-level tests (with real DB/repo)
    ├───📁 shared/                                   # Common test utilities & fakes
    └───📁 unit-tests/                               # Pure unit tests (isolated handlers/services)
```

### 🔑 Key Principles

- **Vertical Slices First**:  
  Every feature (`getting-ingredient-by-id`, `importing-ingredients`, etc.) is a **self-contained folder** containing everything needed to implement that use case — no more “layered spaghetti”.

- **Bounded Contexts Isolated**:  
  `ingredients/` and `recipes/` are completely separate modules — no cross-module dependencies beyond contracts.

- **Infrastructure Separated**:  
  Shared logic (logging, tracing, DB, config) lives in `libs/`. Business code never touches infra directly — only through interfaces defined in `contracts/`.

- **Test-Driven by Slice**:  
  Unit, integration, and E2E tests mirror the vertical slice structure — each feature has its own test suite under `/test/unit-tests/modules/[context]/features/...`.

- **No Layered Folders**:  
  No `controllers/`, `services/`, or `repositories/` folders across the board — **code is grouped by behavior, not technical role**.
