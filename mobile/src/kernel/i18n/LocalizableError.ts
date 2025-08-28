import {MessageDescriptor} from 'react-intl'

export class LocalizableError extends Error {
  constructor(readonly descriptor: MessageDescriptor) {
    super()
  }
}
