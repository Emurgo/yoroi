// @flow
import ExtendableError from 'es6-error'

export class BluetoothDisabledError extends ExtendableError {
  constructor() {
    super('BluetoothDisabledError')
  }
}
