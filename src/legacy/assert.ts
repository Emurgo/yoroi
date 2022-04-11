/* eslint-disable @typescript-eslint/no-explicit-any */
import ExtendableError from 'es6-error'

import {Logger} from './logging'

export class AssertionFailed extends ExtendableError {}
export class PreconditionFailed extends ExtendableError {}

const _assert = (value: any, message: string, ...args: any) => {
  if (value) return
  Logger.error(`Assertion failed: ${message}`, ...args)
  throw new AssertionFailed(message)
}

const _preconditionCheck = (value: any, message: string, ...args: any) => {
  if (value) return
  Logger.error(`Precondition check failed: ${message}`, ...args)
  throw new PreconditionFailed(message)
}

export default {
  assert: _assert,
  preconditionCheck: _preconditionCheck,
}
