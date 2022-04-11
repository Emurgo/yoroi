import {errorMessages} from '../i18n/global-messages'
import LocalizableError from '../i18n/LocalizableError'

// thrown when the request did go through but
// backend returned an unexpected result
export class ApiError extends LocalizableError {
  constructor(response: string | null) {
    super({
      id: errorMessages.apiError.message.id,
      defaultMessage: errorMessages.apiError.message.defaultMessage || '',
      values: {
        response,
      },
    })
  }
}

// thrown when api failed to connect to the server
export class NetworkError extends LocalizableError {
  constructor() {
    super({
      id: errorMessages.networkError.message.id,
      defaultMessage: errorMessages.networkError.message.defaultMessage || '',
    })
  }
}

// thrown by the backend after a rollback
export class ApiHistoryError extends ApiError {}

// TODO(v-almonacid): redefine errors as instances of LocalizableError
import ExtendableError from 'es6-error'
import {defineMessages} from 'react-intl'

const messages = defineMessages({
  rewardAddressEmptyError: {
    id: 'crypto.errors.rewardAddressEmpty',
    defaultMessage: '!!!Reward address is empty.',
  },
})
export class CardanoError extends ExtendableError {}
export class WrongPassword extends ExtendableError {
  constructor() {
    super('WrongPassword')
  }
}
export class InsufficientFunds extends ExtendableError {
  constructor() {
    super('InsufficientFunds')
  }
}
export class NoOutputsError extends ExtendableError {
  constructor() {
    super('NoOutputsError')
  }
}
export class AssetOverflowError extends ExtendableError {
  constructor() {
    super('AssetOverflowError')
  }
}
export const _rethrow = <T>(x: Promise<T>): Promise<T> =>
  x.catch((e) => {
    throw new CardanoError(e.message)
  })
export class InvalidState extends ExtendableError {}
export class RewardAddressEmptyError extends LocalizableError {
  constructor() {
    super({
      id: messages.rewardAddressEmptyError.id,
      defaultMessage: messages.rewardAddressEmptyError.defaultMessage || '',
    })
  }
}
