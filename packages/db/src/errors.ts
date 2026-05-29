const errorCodes = [
  "FAILED_TO_PARSE_TO_DOMAIN_SHAPE",
  "FAILED_TO_INSERT",
  "FAILED_TO_UPDATE",
  "FAILED_TO_DELETE"
] as const
export type ErrorCode = (typeof errorCodes)[number]
