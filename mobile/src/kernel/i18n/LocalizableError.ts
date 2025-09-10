import {MessageDescriptor} from 'react-intl'

export class LocalizableError extends Error {
  public values?: Record<string, any>

  constructor(
    readonly descriptor: MessageDescriptor,
    values?: Record<string, any>,
  ) {
    super()
    this.values = values
  }
}
