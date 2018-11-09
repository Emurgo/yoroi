// @flow

import ExtendableError from 'es6-error'
import {Logger} from './logging'

export class AssertionFailed extends ExtendableError {}

const _assert = (value: any, message: string, ...args: any) => {
  if (value) return
  Logger.error('Assertion failed', message, ...args)
  throw new AssertionFailed(message)
}

export const assertTrue = (value: any, message: string, ...args: any) => {
  _assert(value, message, ...args)
}

export const assertFalse = (value: any, message: string) => {
  _assert(!value, message)
}

export const checkIsTrue = (value: any, ...args: any) => {
  if (!value) Logger.error('Check failed', ...args)
}

export const checkIsFalse = (value: any, ...args: any) => {
  if (!value) Logger.error('Check failed', ...args)
}

export const preconditionIsTrue = (
  value: any,
  message: string,
  ...args: any
) => {
  _assert(value, `Precondition check failed: ${message}`, ...args)
}

export default {
  assert: assertTrue,
  preconditionCheck: preconditionIsTrue,
}
