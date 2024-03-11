# Tetoy

## Installation

Install Dependencies.

```bash
  pnpm install
```

## Run Locally

To run both WebApp and Api server.

```bash
  pnpm dev
```

To run WebApp Dev Server.

```bash
  pnpm dev:web
```

To build WebApp.

```bash
  pnpm build:web
```

To run API Server.

```bash
  pnpm dev:api
```

## Project Strcture

This project is a monorepo with PNPM workspaces. It has three main projects: a web app with [React](https://react.dev), an API with [Hono](https://hono.dev/), and a database([SQLite](https://www.sqlite.org/index.html)) with [DrizzleORM](https://orm.drizzle.team).

```
.
|-- apps
|   |-- web             # Web App
|-- packages
|   |-- api             # Api Server
|   |-- db              # Database
└── README.md
```
