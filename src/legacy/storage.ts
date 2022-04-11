/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import AsyncStorage from '@react-native-async-storage/async-storage'
import ExtendableError from 'es6-error'
import _ from 'lodash'

import assert from './assert'

export class StorageError extends ExtendableError {}

const checkPathFormat = (path: string) => path.startsWith('/') && !path.endsWith('/')

const parseJson = (json: string) => (json !== null ? JSON.parse(json) : undefined)

export const read = async <T = unknown>(path: string): Promise<T> => {
  assert.preconditionCheck(checkPathFormat(path), 'Wrong storage key path')

  try {
    const text = await AsyncStorage.getItem(path)
    return parseJson(text!)
  } catch (error) {
    throw new StorageError((error as Error).message)
  }
}

export const readMany = async (paths: Array<string>) => {
  assert.preconditionCheck(_.every(paths, checkPathFormat), 'Wrong storage key path')

  try {
    const items = await AsyncStorage.multiGet(paths)

    return items.map(([key, value]) => [key, parseJson(value!)])
  } catch (error) {
    throw new StorageError((error as Error).message)
  }
}

export const write = async (path: string, data: any) => {
  assert.preconditionCheck(path.startsWith('/'), 'Wrong storage key path')
  assert.preconditionCheck(!path.endsWith('/'), 'Wrong storage key path')
  assert.preconditionCheck(data !== undefined, 'Cannot store undefined')

  try {
    await AsyncStorage.setItem(path, JSON.stringify(data))
  } catch (error) {
    throw new StorageError((error as Error).message)
  }
}

export const remove = async (path: string) => {
  assert.preconditionCheck(path.startsWith('/'), 'Wrong storage key path')
  assert.preconditionCheck(!path.endsWith('/'), 'Wrong storage key path')

  try {
    await AsyncStorage.removeItem(path)
  } catch (error) {
    throw new StorageError((error as Error).message)
  }
}

export const clearAll = async () => {
  try {
    await AsyncStorage.clear()
  } catch (error) {
    throw new StorageError((error as Error).message)
  }
}

export const keys = async (path: string, includeSubdirs?: boolean): Promise<Array<string>> => {
  try {
    const all = await AsyncStorage.getAllKeys()
    const matched = all.filter((key) => key.startsWith(path)).map((key) => key.substring(path.length))

    return includeSubdirs === true ? matched : matched.filter((key) => !key.includes('/'))
  } catch (error) {
    throw new StorageError((error as Error).message)
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
