import { defineConfig } from "drizzle-kit"
import { DATABASE_URL, DRIZZLE_OUT } from "./src"

export default defineConfig({
  out: DRIZZLE_OUT,
  schema: "./src/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: DATABASE_URL
  }
})
