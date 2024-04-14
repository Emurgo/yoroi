import {App} from '@yoroi/types'

import {parseSafe} from '../../utils/parsers'
import {mountMMKVMultiStorage, mountMMKVStorage} from './mmkv-storage'
import {MMKV} from 'react-native-mmkv'

const mmkv = new MMKV({id: 'default.mmkv'})
const rootStorage = mountMMKVStorage(
  {path: '/', id: 'default.mmkv'},
  {instance: mmkv},
)

describe('prefixed storage', () => {
  beforeEach(() => rootStorage.clear())

  it('getAllKeys, setItem, getItem, removeItem, clear', async () => {
    const storage = mountMMKVStorage({path: '/'})
    expect(storage.getAllKeys()).toEqual([])

    storage.setItem('item1', item1)
    expect(storage.getItem('item1')).toEqual(item1)
    storage.setItem('item2', item2)
    expect(storage.getItem('item2')).toEqual(item2)
    expect(storage.getItem('does not exist')).toEqual(null)
    expect(storage.getAllKeys()).toEqual(['item1', 'item2'])

    storage.removeItem('item1')
    expect(storage.getItem('item1')).toEqual(null)
    expect(storage.getAllKeys()).toEqual(['item2'])

    storage.clear()
    expect(storage.getAllKeys()).toEqual([])
  })

  it('getAllKeys, setItem, getItem, removeItem, clear, with prefix', async () => {
    const storage = rootStorage.join('prefix/')
    expect(storage.getAllKeys()).toEqual([])

    storage.setItem('item1', item1)
    expect(storage.getItem('item1')).toEqual(item1)
    storage.setItem('item2', item2)
    expect(storage.getItem('item2')).toEqual(item2)
    expect(storage.getItem('does not exist')).toEqual(null)
    expect(storage.getAllKeys()).toEqual(['item1', 'item2'])

    storage.removeItem('item1')
    expect(storage.getItem('item1')).toEqual(null)
    expect(storage.getAllKeys()).toEqual(['item2'])

    storage.clear()
    expect(storage.getAllKeys()).toEqual([])
  })

  it('getAllKeys, multiSet, multiGet, multiRemove', async () => {
    const storage = rootStorage.join('prefix/')

    storage.multiSet<any>([
      ['item1', item1],
      ['item2', item2],
    ])
    const keys = storage.getAllKeys()
    expect(keys).toEqual(['item1', 'item2'])

    const items1 = storage.multiGet(['item1', 'item2'])
    expect(items1).toEqual([
      ['item1', {a: 123, b: 234}],
      ['item2', {c: 123, d: 234}],
    ])

    storage.multiRemove(['item1', 'item2'])
    const items2 = storage.multiGet(['item1', 'item2'])
    expect(items2).toEqual([
      ['item1', null],
      ['item2', null],
    ])

    expect(storage.getAllKeys()).toEqual([])
  })

  it('getAllKeys', async () => {
    const storage1 = rootStorage.join('prefix/1/')
    expect(storage1.getAllKeys()).toEqual([])
    storage1.setItem('key1', item1)
    storage1.setItem('key2', item2)
    expect(storage1.getAllKeys()).toEqual(['key1', 'key2'])

    const storage2 = rootStorage.join('prefix/2/3/')
    expect(storage2.getAllKeys()).toEqual([])
    storage2.setItem('key1', item1)
    storage2.setItem('key2', item2)
    expect(storage2.getAllKeys()).toEqual(['key1', 'key2'])

    const storage = rootStorage.join('prefix/')
    expect(storage.getAllKeys()).toEqual([])
    storage.setItem('key1', item1)
    storage.setItem('key2', item2)
    expect(storage.getAllKeys()).toEqual(['key1', 'key2'])
  })

  it('join', async () => {
    const root = rootStorage.join('/')
    root.setItem('key1', item1)
    root.setItem('key2', item2)
    expect(root.getAllKeys()).toEqual(['key1', 'key2'])

    const storage = root.join('dir/')
    expect(storage.getAllKeys()).toEqual([])

    storage.setItem('item1', item1)
    expect(storage.getItem('item1')).toEqual(item1)
    storage.setItem('item2', item2)
    expect(storage.getItem('item2')).toEqual(item2)
    expect(storage.getItem('does not exist')).toEqual(null)
    expect(storage.getAllKeys()).toEqual(['item1', 'item2'])

    storage.removeItem('item1')
    expect(storage.getItem('item1')).toEqual(null)
    expect(storage.getAllKeys()).toEqual(['item2'])

    storage.clear()
    expect(storage.getAllKeys()).toEqual([])
  })

  describe('stringify/parse', () => {
    it('getItem, setItem', async () => {
      const item = 'text'
      const storedItem = 'item123'

      rootStorage.setItem('item', item, (data: unknown) => {
        expect(data).toBe(item)
        return storedItem
      }) // overrides JSON.stringify

      const parsedResult = rootStorage.getItem('item', (data: unknown) => {
        expect(data).toBe(storedItem)
        return item
      }) // overrides JSON.parse

      expect(parsedResult).toBe(item)
    })

    it('multiGet, multiSet', async () => {
      const item1 = 'item1'
      const storedItem1 = `${item1}-modified`
      const item2 = 'item2'
      const storedItem2 = `${item2}-modified`
      const tuples: [string, unknown][] = [
        ['item1', item1],
        ['item2', item2],
      ]

      rootStorage.multiSet(tuples, (data: unknown) => {
        expect([item1, item2]).toContain(data)
        return `${data}-modified`
      }) // overrides JSON.stringify

      const parsedResult = rootStorage.multiGet(
        ['item1', 'item2'],
        (data: string | null) => {
          expect([storedItem1, storedItem2]).toContain(data)
          return data?.slice(0, 5)
        },
      ) // overrides JSON.parse

      expect(parsedResult).toEqual(tuples)
    })
  })

  it('clears sub-storage', async () => {
    const storage1 = rootStorage.join('1/')
    const storage2 = storage1.join('2/')
    const storage3 = storage2.join('3/')

    rootStorage.setItem('a', '000')
    rootStorage.setItem('1', '000')
    storage1.setItem('b', 111)
    storage2.setItem('c', 222)
    storage3.setItem('d', 333)

    expect(snapshot()).toEqual({
      // folder named "1"
      '/1/2/3/d': 333,
      '/1/2/c': 222,
      '/1/b': 111,

      // file named "1"
      '/1': '000',
      '/a': '000',
    })

    expect(storage1.getAllKeys()).toEqual(['b'])

    storage1.clear()

    expect(snapshot()).toEqual({
      '/a': '000',
      '/1': '000',
    })
  })

  it('removeFolder', async () => {
    const storage1 = rootStorage.join('1/')
    const storage2 = storage1.join('2/')
    const storage3 = storage2.join('3/')

    rootStorage.setItem('a', '000')
    rootStorage.setItem('1', '000')
    storage1.setItem('b', 111)
    storage2.setItem('c', 222)
    storage3.setItem('d', 333)

    expect(snapshot()).toEqual({
      // folder named "1"
      '/1/2/3/d': 333,
      '/1/2/c': 222,
      '/1/b': 111,

      // root folder
      '/1': '000',
      '/a': '000',
    })

    storage2.removeFolder('3/')

    expect(snapshot()).toEqual({
      '/1/2/c': 222,
      '/1/b': 111,

      '/1': '000',
      '/a': '000',
    })

    rootStorage.removeFolder('1/')

    expect(snapshot()).toEqual({
      '/1': '000',
      '/a': '000',
    })
  })
})

describe('multi storage', () => {
  it('saveMany, readAll, readMany, keys, and clear providing the serializers', async () => {
    const storage = mountMMKVMultiStorage(options)
    storage.saveMany([item3, item4])

    const readItems = storage.readAll()
    expect(readItems).toEqual([
      ['1', item3],
      ['2', item4],
    ])

    const readItem = storage.readMany(['1'])
    expect(readItem).toEqual([['1', item3]])

    const keys = storage.getAllKeys()
    expect(keys).toEqual(['1', '2'])

    storage.clear()

    const emptyKeys = storage.getAllKeys()
    expect(emptyKeys).toEqual([])
  })
  it('saveMany, readAll, readMany, keys, and clear default serializers / key as extractor', async () => {
    const storage = mountMMKVMultiStorage({
      storage: rootStorage.join('multiStorage/'),
      dataFolder: 'dataFolder/',
      keyExtractor: 'id',
    })
    storage.saveMany([item3, item4])

    const readItems = storage.readAll()
    expect(readItems).toEqual([
      ['1', item3],
      ['2', item4],
    ])

    const keys = storage.getAllKeys()
    expect(keys).toEqual(['1', '2'])

    storage.removeMany(['2'])
    const keysLeft = storage.getAllKeys()
    expect(keysLeft).toEqual(['1'])

    const readItem = storage.readMany(['1'])
    expect(readItem).toEqual([['1', item3]])

    storage.clear()

    const emptyKeys = storage.getAllKeys()
    expect(emptyKeys).toEqual([])
  })
})

const options: App.MultiStorageOptions<any, false> = {
  storage: mountMMKVStorage({path: '/'}).join('multiStorage/'),
  dataFolder: 'dataFolder/',
  keyExtractor: (item: any) => item.id,
  serializer: JSON.stringify,
  deserializer: (data: any) => JSON.parse(data as string),
}

const item1 = {a: 123, b: 234}
const item2 = {c: 123, d: 234}
const item3 = {id: 1, a: 123, b: 234}
const item4 = {id: '2', c: 123, d: 234}

const snapshot = () => {
  const entries = mmkv
    .getAllKeys()
    .map((key) => [key, parseSafe(mmkv.getString(key))])
  return Object.fromEntries(entries)
}
