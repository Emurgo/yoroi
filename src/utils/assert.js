// @flow

import ExtendableError from 'es6-error'
import {Logger} from './logging'

export class AssertionFailed extends ExtendableError {}

export const assertTrue = (value: any, message: ?string) => {
  if (!value) throw new AssertionFailed(message)
}

export const checkIsTrue = (value: any, ...args: any) => {
  if (!value) Logger.error('Check failed', ...args)
}

export const checkIsFalse = (value: any, ...args: any) => {
  if (!value) Logger.error('Check failed', ...args)
}
