export class ClaimApiErrorsInvalidRequest extends Error {
  static readonly statusCode = 400
}
export class ClaimApiErrorsNotFound extends Error {
  static readonly statusCode = 404
}
export class ClaimApiErrorsAlreadyClaimed extends Error {
  static readonly statusCode = 409
}
export class ClaimApiErrorsExpired extends Error {
  static readonly statusCode = 410
}
export class ClaimApiErrorsTooEarly extends Error {
  static readonly statusCode = 425
}
export class ClaimApiErrorsRateLimited extends Error {
  static readonly statusCode = 429
}

// API errors that when returned from a faucet have a more specific error message
export const claimApiErrors = [
  ClaimApiErrorsInvalidRequest,
  ClaimApiErrorsNotFound,
  ClaimApiErrorsAlreadyClaimed,
  ClaimApiErrorsExpired,
  ClaimApiErrorsTooEarly,
  ClaimApiErrorsRateLimited,
] as const
