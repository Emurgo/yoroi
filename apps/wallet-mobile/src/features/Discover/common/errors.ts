const USER_REJECTED_ERROR_MESSAGE = 'User rejected'

export const userRejectedError = () => new Error(USER_REJECTED_ERROR_MESSAGE)

export const isUserRejectedError = (error: Error): boolean => {
  return error.message === USER_REJECTED_ERROR_MESSAGE
}
