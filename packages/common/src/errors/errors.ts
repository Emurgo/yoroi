export const invalid = (message: string) => {
  throw new Error(message)
}

export class ApiError extends Error {}
