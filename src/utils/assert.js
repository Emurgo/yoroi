// @flow

import ExtendableError from 'es6-error'
import {Logger} from './logging'

export class AssertionFailed extends ExtendableError {}


const _assert = (value: any, message: ?string) => {
  if (value) return
  // Note(ppershing): Works in V8 (Node/jest)
  const tmp = new Error()
  const location = (
    (tmp.stack || '').split('\n')[3] || ''
  )
  throw new AssertionFailed(message || `Assertion failed ${location}`)
}

export const assertTrue = (value: any, message: ?string) => {
  _assert(value, message)
}

export const assertFalse = (value: any, message: ?string) => {
  _assert(!value, message)
}


export const checkIsTrue = (value: any, ...args: any) => {
  if (!value) Logger.error('Check failed', ...args)
}

export const checkIsFalse = (value: any, ...args: any) => {
  if (!value) Logger.error('Check failed', ...args)
}
