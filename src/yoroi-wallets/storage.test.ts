import AsyncStorage from '@react-native-async-storage/async-storage'

import {storage as yoroiStorage} from './storage'

describe('prefixed storage', () => {
  beforeEach(() => AsyncStorage.clear())

  it('getAllKeys, setItem, getItem, removeItem, clear', async () => {
    const storage = yoroiStorage
    await storage.getAllKeys().then((keys) => expect(keys).toEqual([]))

    await storage.setItem('item1', item1)
    expect(await storage.getItem('item1')).toEqual(item1)
    await storage.setItem('item2', item2)
    expect(await storage.getItem('item2')).toEqual(item2)
    expect(await storage.getItem('does not exist')).toEqual(null)
    expect(await storage.getAllKeys()).toEqual(['item1', 'item2'])

    await storage.removeItem('item1')
    expect(await storage.getItem('item1')).toEqual(null)
    expect(await storage.getAllKeys()).toEqual(['item2'])

    await storage.clear()
    expect(await storage.getAllKeys()).toEqual([])
  })

  it('getAllKeys, setItem, getItem, removeItem, clear, with prefix', async () => {
    const storage = yoroiStorage.join('prefix/')
    expect(await storage.getAllKeys()).toEqual([])

    await storage.setItem('item1', item1)
    expect(await storage.getItem('item1')).toEqual(item1)
    await storage.setItem('item2', item2)
    expect(await storage.getItem('item2')).toEqual(item2)
    expect(await storage.getItem('does not exist')).toEqual(null)
    expect(await storage.getAllKeys()).toEqual(['item1', 'item2'])

    await storage.removeItem('item1')
    expect(await storage.getItem('item1')).toEqual(null)
    expect(await storage.getAllKeys()).toEqual(['item2'])

    await storage.clear()
    expect(await storage.getAllKeys()).toEqual([])
  })

  it('getAllKeys, multiSet, multiGet, multiRemove', async () => {
    const storage = yoroiStorage.join('prefix/')

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

  it('getAllKeys', async () => {
    const storage1 = yoroiStorage.join('prefix/1/')
    expect(await storage1.getAllKeys()).toEqual([])
    await storage1.setItem('key1', item1)
    await storage1.setItem('key2', item2)
    expect(await storage1.getAllKeys()).toEqual(['key1', 'key2'])

    const storage2 = yoroiStorage.join('prefix/2/3/')
    expect(await storage2.getAllKeys()).toEqual([])
    await storage2.setItem('key1', item1)
    await storage2.setItem('key2', item2)
    expect(await storage2.getAllKeys()).toEqual(['key1', 'key2'])

    const storage = yoroiStorage.join('prefix/')
    expect(await storage.getAllKeys()).toEqual([])
    await storage.setItem('key1', item1)
    await storage.setItem('key2', item2)
    expect(await storage.getAllKeys()).toEqual(['key1', 'key2'])
  })

  it('join', async () => {
    const root = yoroiStorage.join('/')
    await root.setItem('key1', item1)
    await root.setItem('key2', item2)
    expect(await root.getAllKeys()).toEqual(['key1', 'key2'])

    const storage = root.join('dir/')
    expect(await storage.getAllKeys()).toEqual([])

    await storage.setItem('item1', item1)
    expect(await storage.getItem('item1')).toEqual(item1)
    await storage.setItem('item2', item2)
    expect(await storage.getItem('item2')).toEqual(item2)
    expect(await storage.getItem('does not exist')).toEqual(null)
    expect(await storage.getAllKeys()).toEqual(['item1', 'item2'])

    await storage.removeItem('item1')
    expect(await storage.getItem('item1')).toEqual(null)
    expect(await storage.getAllKeys()).toEqual(['item2'])

    await storage.clear()
    expect(await storage.getAllKeys()).toEqual([])
  })

  describe('stringify/parse', () => {
    it('getItem, setItem', async () => {
      const storage = yoroiStorage
      const item = 'text'
      const storedItem = 'item123'

      await storage.setItem('item', item, (data) => {
        expect(data).toBe(item)
        return storedItem
      }) // overrides JSON.stringify

      const parsedResult = await storage.getItem('item', (data) => {
        expect(data).toBe(storedItem)
        return item
      }) // overrides JSON.parse

      expect(parsedResult).toBe(item)
    })

    it('multiGet, multiSet', async () => {
      const storage = yoroiStorage
      const item1 = 'item1'
      const storedItem1 = `${item1}-modified`
      const item2 = 'item2'
      const storedItem2 = `${item2}-modified`
      const tuples: [string, unknown][] = [
        ['item1', item1],
        ['item2', item2],
      ]

      await storage.multiSet(tuples, (data) => {
        expect([item1, item2]).toContain(data)
        return `${data}-modified`
      }) // overrides JSON.stringify

      const parsedResult = await storage.multiGet(['item1', 'item2'], (data) => {
        expect([storedItem1, storedItem2]).toContain(data)
        return data?.slice(0, 5)
      }) // overrides JSON.parse

      expect(parsedResult).toEqual(tuples)
    })
  })
})

const item1 = {a: 123, b: 234}
const item2 = {c: 123, d: 234}
