const errorCodes = [
  "FAILED_TO_PARSE_TO_DOMAIN_SHAPE",
  "FAILED_TO_INSERT",
  "FAILED_TO_UPDATE",
  "NO_FIELDS_TO_UPDATE",
  "FAILED_TO_DELETE",
  "DB_CONNECTION_ERROR",
  "DB_OPERATION_ERROR"
] as const
export type ErrorCode = (typeof errorCodes)[number]

export type DBError = {
  code: ErrorCode
  message?: Error["message"]
  name?: Error["name"]
  cause?: Error["cause"]
  stack?: Error["stack"]
}
