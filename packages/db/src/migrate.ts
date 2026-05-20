import { migrate } from "drizzle-orm/bun-sqlite/migrator"

import { db } from "./db"
import { DRIZZLE_OUT } from "./constants"

// the bun-sqlite way to migrate instead of drizzle-kit migrate
// see: https://bun.com/docs/guides/ecosystem/drizzle
migrate(db, { migrationsFolder: DRIZZLE_OUT })
