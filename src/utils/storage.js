// @flow
import assert from './assert'

import ExtendableError from 'es6-error'
import {AsyncStorage} from 'react-native'

export class StorageError extends ExtendableError {}

export const read = async (path: string) => {
  assert.preconditionCheck(path.startsWith('/'), 'Wrong storage key path')
  assert.preconditionCheck(!path.endsWith('/'), 'Wrong storage key path')
  try {
    const json = await AsyncStorage.getItem(path)
    // Caller is responsible for checking for undefined keys
    if (typeof json === 'undefined') return json
    return JSON.parse(json)
  } catch (error) {
    throw new StorageError(error.message)
  }
}

export const write = async (path: string, data: any) => {
  assert.preconditionCheck(path.startsWith('/'), 'Wrong storage key path')
  assert.preconditionCheck(!path.endsWith('/'), 'Wrong storage key path')
  try {
    const json = JSON.stringify(data)
    await AsyncStorage.setItem(path, json)
  } catch (error) {
    throw new StorageError(error.message)
  }
}

export const remove = async (path: string) => {
  assert.preconditionCheck(path.startsWith('/'), 'Wrong storage key path')
  assert.preconditionCheck(!path.endsWith('/'), 'Wrong storage key path')
  try {
    await AsyncStorage.removeItem(path)
  } catch (error) {
    throw new StorageError(error.message)
  }
}

export const clearAll = async () => {
  try {
    await AsyncStorage.clear()
  } catch (error) {
    throw new StorageError(error.message)
  }
}

export const keys = async (path: string, includeSubdirs?: boolean) => {
  try {
    const all = await AsyncStorage.getAllKeys()
    const filtered = all
      .filter((key) => key.startswith(path))
      .map((key) => key.splice(path.length))
    if (includeSubdirs) {
      return filtered
    } else {
      return filtered.map((key) => !key.includes('/'))
    }
  } catch (error) {
    throw new StorageError(error.message)
  }
}

export default {
  read,
  write,
  remove,
  clearAll,
  keys,
}
