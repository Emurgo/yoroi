import AsyncStorage from '@react-native-async-storage/async-storage'

import {mountStorage} from './storage'

describe('prefixed storage', () => {
  beforeEach(() => AsyncStorage.clear())

  it('getAllKeys, setItem, getItem, removeItem, clear', async () => {
    const storage = mountStorage('prefix/')
    await storage.getAllKeys().then((keys) => expect(keys).toEqual([]))

    await storage.setItem('item1', item1)
    await storage.getItem('item1').then((item) => expect(item).toEqual(item1))
    await storage.setItem('item2', item2)
    await storage.getItem('item2').then((item) => expect(item).toEqual(item2))
    await storage.getItem('does not exist').then((item) => expect(item).toEqual(null))
    await storage.getAllKeys().then((keys) => expect(keys).toEqual(['item1', 'item2']))

    await storage.removeItem('item1')
    await storage.getItem('item1').then((item) => expect(item).toEqual(null))
    await storage.getAllKeys().then((keys) => expect(keys).toEqual(['item2']))

    await storage.clear()
    await storage.getAllKeys().then((keys) => expect(keys).toEqual([]))
  })

  it('getAllKeys, multiSet, multiGet, multiRemove', async () => {
    const storage = mountStorage('prefix/')

    await storage.multiSet([
      ['item1', item1],
      ['item2', item2],
    ])
    const keys = await storage.getAllKeys()
    expect(keys).toEqual(['item1', 'item2'])

    const items1 = await storage.multiGet(['item1', 'item2'])
    expect(items1).toEqual([
      ['item1', {a: 123, b: 234}],
      ['item2', {c: 123, d: 234}],
    ])

    await storage.multiRemove(['item1', 'item2'])
    const items2 = await storage.multiGet(['item1', 'item2'])
    expect(items2).toEqual([
      ['item1', null],
      ['item2', null],
    ])

    await storage.getAllKeys().then((keys) => expect(keys).toEqual([]))
  })
})

const item1 = {a: 123, b: 234}
const item2 = {c: 123, d: 234}
