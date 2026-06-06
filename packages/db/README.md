# Lore Database Package

This package is responsible for database operations and data validation at the persistence layer. It uses:

- SQLite with Bun’s SQLite dialect,
- Drizzle ORM and Drizzle Kit.
- and better-sqlite3 only to run Drizzle Kit smoothly, as Bun does not yet fully support it.

## Main files

- [schema](./src/schema.ts): all drizzle table schema declarations
- [queries](./src/queries.ts): all db queries
- [queries.test.ts](./src/queries.test.ts): unit tests for the queries

## Use

Make sure to have the build, and the database ready

```bash
bun run build
bun run migrate
```

Lastly, set the environment variables in a new .env file as in the the [example file](./.env.example).
