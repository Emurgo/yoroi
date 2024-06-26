import AsyncStorage from '@react-native-async-storage/async-storage'
import {parseSafe} from '@yoroi/common'

import {rootStorage} from '../../../kernel/storage/rootStorage'
import {enableAuthWithOs} from './hooks'

describe('enableAuthWithOs', () => {
  beforeEach(() => AsyncStorage.clear())

  it('empty', async () => {
    await enableAuthWithOs(rootStorage)
    expect(await storageSnapshot()).toEqual({
      '/appSettings/auth': 'os',
    })
  })

  it('existing value', async () => {
    rootStorage.join('appSettings/').setItem('auth', 'pin')

    await enableAuthWithOs(rootStorage)
    expect(await storageSnapshot()).toEqual({
      '/appSettings/auth': 'os',
    })
  })

  it('remove pin', async () => {
    rootStorage.join('appSettings/').setItem('auth', 'pin')
    rootStorage.join('appSettings/').setItem('customPinHash', '123456789')

    await enableAuthWithOs(rootStorage)
    expect(await storageSnapshot()).toEqual({
      '/appSettings/auth': 'os',
    })
  })
})

const storageSnapshot = async () => {
  const keys = await AsyncStorage.getAllKeys()
  const entries = await AsyncStorage.multiGet(keys).then((entries) =>
    entries.map(([key, value]) => [key, parseSafe(value)]),
  )

  return Object.fromEntries(entries)
}
