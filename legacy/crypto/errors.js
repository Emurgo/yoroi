// @flow

// TODO(v-almonacid): redefine errors as instances of LocalizableError

import ExtendableError from 'es6-error'
import {defineMessages} from 'react-intl'

import LocalizableError from '../i18n/LocalizableError'

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
