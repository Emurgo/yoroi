// @flow
import assert from './assert'

import ExtendableError from 'es6-error'
import {AsyncStorage} from 'react-native'
import _ from 'lodash'

export class StorageError extends ExtendableError {}

const parseJson = (json) => {
  // Caller is responsible for checking for undefined keys
  if (typeof json === 'undefined') return json
  return JSON.parse(json)
}

const checkPathFormat = (path: string) =>
  path.startsWith('/') && !path.endsWith('/')

export const read = async (path: string) => {
  assert.preconditionCheck(checkPathFormat(path), 'Wrong storage key path')
  try {
    const json = await AsyncStorage.getItem(path)
    // Caller is responsible for checking for undefined keys
    return parseJson(json)
  } catch (error) {
    throw new StorageError(error.message)
  }
}

export const readMany = async (paths: Array<string>) => {
  assert.preconditionCheck(
    _.every(paths, checkPathFormat),
    'Wrong storage key path',
  )
  try {
    const items = await AsyncStorage.multiGet(paths)
    return items.map(([key, value]) => [key, parseJson(value)])
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
    const matched = all
      .filter((key) => key.startsWith(path))
      .map((key) => key.substring(path.length))

    return includeSubdirs
      ? matched
      : matched.filter((key) => !key.includes('/'))
  } catch (error) {
    throw new StorageError(error.message)
  }
}

export default {
  read,
  readMany,
  write,
  remove,
  clearAll,
  keys,
}
