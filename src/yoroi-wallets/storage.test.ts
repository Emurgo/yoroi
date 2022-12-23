import AsyncStorage from '@react-native-async-storage/async-storage'

import {
  createPrefixedStorage,
  debug,
  isValidFilename,
  isValidPath,
  makeRootStorage,
  toAbsolutePath,
  toFilename,
} from './storage'

describe('storage', () => {
  beforeEach(() => {
    AsyncStorage.clear()
  })

  it('prefixes', async () => {
    const storage0 = makeRootStorage()
    expect(storage0.path).toBe('/')

    const storage1 = createPrefixedStorage({storage: storage0, path: 'level1'})
    expect(storage1.path).toBe('/level1')

    const storage2 = createPrefixedStorage({storage: storage1, path: 'level2'})
    expect(storage2.path).toBe('/level1/level2')

    const storage3 = createPrefixedStorage({storage: storage2, path: 'level3'})
    expect(storage3.path).toBe('/level1/level2/level3')

    const storage4 = createPrefixedStorage({storage: storage3, path: 'level4'})
    expect(storage4.path).toBe('/level1/level2/level3/level4')
  })

  describe('create, setItem, getItem, getAllKeys', () => {
    it('works', async () => {
      // storage0
      const storage0 = createPrefixedStorage()
      expect(await storage0.getAllKeys()).toEqual([])
      // add item
      const item0 = 'item0'
      await storage0.setItem('item0', item0)
      expect(await storage0.getItem('item0')).toEqual(item0)
      // add item
      const item00 = 'item00'
      await storage0.setItem('item00', item00)
      expect(await storage0.getItem('item00')).toEqual(item00)
      expect(await storage0.getAllKeys()).toEqual(['item0', 'item00'])
      expect(await debug()).toMatchInlineSnapshot(`
      Object {
        "/item0": "item0",
        "/item00": "item00",
      }
    `)

      // storage1
      const storage1 = createPrefixedStorage({storage: storage0, path: 'level1'})
      expect(await storage1.getAllKeys()).toEqual([])
      // add item
      const item1 = 'item1'
      await storage1.setItem('item1', item1)
      expect(await storage1.getItem('item1')).toEqual(item1)
      expect(await storage1.getAllKeys()).toEqual(['item1'])
      // add item
      const item11 = 'item11'
      await storage1.setItem('item11', item11)
      expect(await storage1.getItem('item11')).toEqual(item11)
      expect(await storage1.getAllKeys()).toEqual(['item1', 'item11'])
      expect(await debug()).toMatchInlineSnapshot(`
      Object {
        "/item0": "item0",
        "/item00": "item00",
        "/level1/item1": "item1",
        "/level1/item11": "item11",
      }
    `)

      // storage2
      const storage2 = createPrefixedStorage({storage: storage1, path: 'level2'})
      expect(await storage2.getAllKeys()).toEqual([])
      // add item
      const item2 = 'item2'
      await storage2.setItem('item2', item2)
      expect(await storage2.getItem('item2')).toEqual(item2)
      expect(await storage2.getAllKeys()).toEqual(['item2'])
      // add item
      const item22 = 'item22'
      await storage2.setItem('item22', item22)
      expect(await storage2.getItem('item22')).toEqual(item22)
      expect(await storage2.getAllKeys()).toEqual(['item2', 'item22'])
      expect(await debug()).toMatchInlineSnapshot(`
      Object {
        "/item0": "item0",
        "/item00": "item00",
        "/level1/item1": "item1",
        "/level1/item11": "item11",
        "/level1/level2/item2": "item2",
        "/level1/level2/item22": "item22",
      }
    `)

      // storage3
      const storage3 = createPrefixedStorage({storage: storage2, path: 'level3'})
      expect(await storage3.getAllKeys()).toEqual([])
      // add item
      const item3 = 'item3'
      await storage3.setItem('item3', item3)
      expect(await storage3.getItem('item3')).toEqual(item3)
      expect(await storage3.getAllKeys()).toEqual(['item3'])
      // add item
      const item33 = 'item33'
      await storage3.setItem('item33', item33)
      expect(await storage3.getItem('item33')).toEqual(item33)
      expect(await storage3.getAllKeys()).toEqual(['item3', 'item33'])
      expect(await debug()).toMatchInlineSnapshot(`
      Object {
        "/item0": "item0",
        "/item00": "item00",
        "/level1/item1": "item1",
        "/level1/item11": "item11",
        "/level1/level2/item2": "item2",
        "/level1/level2/item22": "item22",
        "/level1/level2/level3/item3": "item3",
        "/level1/level2/level3/item33": "item33",
      }
    `)

      // remove item
      await storage0.removeItem('item0')
      expect(await storage0.getItem('item0')).toEqual(null)
      expect(await storage0.getAllKeys()).toEqual(['item00'])

      // other levels unaffected
      expect(await storage1.getAllKeys()).toEqual(['item1', 'item11'])
      expect(await storage2.getAllKeys()).toEqual(['item2', 'item22'])
      expect(await storage3.getAllKeys()).toEqual(['item3', 'item33'])
      expect(await debug()).toMatchInlineSnapshot(`
      Object {
        "/item00": "item00",
        "/level1/item1": "item1",
        "/level1/item11": "item11",
        "/level1/level2/item2": "item2",
        "/level1/level2/item22": "item22",
        "/level1/level2/level3/item3": "item3",
        "/level1/level2/level3/item33": "item33",
      }
    `)

      // remove item
      await storage3.removeItem('item33')
      expect(await storage3.getItem('item33')).toEqual(null)
      expect(await storage3.getAllKeys()).toEqual(['item3'])

      // other levels unaffected
      expect(await storage0.getAllKeys()).toEqual(['item00'])
      expect(await storage1.getAllKeys()).toEqual(['item1', 'item11'])
      expect(await storage2.getAllKeys()).toEqual(['item2', 'item22'])
      expect(await debug()).toMatchInlineSnapshot(`
      Object {
        "/item00": "item00",
        "/level1/item1": "item1",
        "/level1/item11": "item11",
        "/level1/level2/item2": "item2",
        "/level1/level2/item22": "item22",
        "/level1/level2/level3/item3": "item3",
      }
    `)

      expect(await storage0.removeItem('unknown')).toEqual(null)
    })
  })

  describe('create, multiSet, multiGet, multiRemove, clear', () => {
    it('validatesFileName', () => {
      expect(() => createPrefixedStorage({path: '//'})).toThrowErrorMatchingInlineSnapshot(`"invalid path"`)
      expect(() => createPrefixedStorage({path: '/invalid/path'})).toThrowErrorMatchingInlineSnapshot(`"invalid path"`)
      // prettier-ignore
      // eslint-disable-next-line no-useless-escape
      expect(() => createPrefixedStorage({ path: '/invalid\/' })).toThrowErrorMatchingInlineSnapshot(`"invalid path"`)
    })

    it('works', async () => {
      // storage0
      const storage0 = createPrefixedStorage()
      // add items
      const item0 = 'item0'
      const item00 = 'item00'
      const item000 = 'item000'
      const item0000 = 'item0000'
      await storage0.multiSet([
        ['item0', item0],
        ['item00', item00],
        ['item000', item000],
        ['item0000', item0000],
      ])
      expect(await storage0.getItem('item0')).toEqual(item0)
      expect(await storage0.getItem('item00')).toEqual(item00)
      expect(await storage0.getItem('item000')).toEqual(item000)
      expect(await storage0.getItem('item0000')).toEqual(item0000)
      expect(await storage0.getAllKeys()).toEqual(['item0', 'item00', 'item000', 'item0000'])
      expect(await storage0.multiGet(['item0', 'item00', 'item000', 'item000'])).toMatchInlineSnapshot(`
      Array [
        Array [
          "item0",
          "item0",
        ],
        Array [
          "item00",
          "item00",
        ],
        Array [
          "item000",
          "item000",
        ],
        Array [
          "item000",
          "item000",
        ],
      ]
    `)
      expect(await debug()).toMatchInlineSnapshot(`
      Object {
        "/item0": "item0",
        "/item00": "item00",
        "/item000": "item000",
        "/item0000": "item0000",
      }
    `)
      await storage0.multiRemove(['item0', 'item000'])
      expect(await storage0.multiGet(['item0', 'item00', 'item000', 'item0000'])).toMatchInlineSnapshot(`
      Array [
        Array [
          "item0",
          null,
        ],
        Array [
          "item00",
          "item00",
        ],
        Array [
          "item000",
          null,
        ],
        Array [
          "item0000",
          "item0000",
        ],
      ]
    `)

      await storage0.clear()
      expect(await storage0.multiGet(['item0', 'item00', 'item000', 'item0000'])).toMatchInlineSnapshot(`
      Array [
        Array [
          "item0",
          null,
        ],
        Array [
          "item00",
          null,
        ],
        Array [
          "item000",
          null,
        ],
        Array [
          "item0000",
          null,
        ],
      ]
    `)
    })
  })

  it('validates filename', () => {
    expect(isValidFilename('valid')).toBe(true)

    expect(isValidFilename('(')).toBe(false)
    expect(isValidFilename(')')).toBe(false)
    expect(isValidFilename('')).toBe(false)
    expect(isValidFilename('\\')).toBe(false)
    expect(isValidFilename('/invalid')).toBe(false)
    expect(isValidFilename('invalid/filename')).toBe(false)
    expect(isValidFilename('/invalid/filename')).toBe(false)
    expect(isValidFilename('/invalid/')).toBe(false)
    expect(isValidFilename('//')).toBe(false)
    expect(isValidFilename('invalid/')).toBe(false)
  })

  it('validates path', () => {
    expect(isValidPath('/')).toBe(true)
    expect(isValidPath('valid')).toBe(true)

    expect(isValidPath('(')).toBe(false)
    expect(isValidPath(')')).toBe(false)
    expect(isValidPath('')).toBe(false)
    expect(isValidPath('\\')).toBe(false)
    expect(isValidPath('')).toBe(false)
    expect(isValidPath('/invalid')).toBe(false)
    expect(isValidPath('invalid/path')).toBe(false)
    expect(isValidPath('/invalid/path')).toBe(false)
    expect(isValidPath('/invalid/')).toBe(false)
    expect(isValidPath('//')).toBe(false)
    expect(isValidPath('invalid/')).toBe(false)
  })

  it('toAbsolutePath', () => {
    expect(toAbsolutePath('/', '/', 'filename')).toEqual('/filename')
    expect(toAbsolutePath('/', 'level1', 'filename')).toEqual('/level1/filename')
    expect(toAbsolutePath('/level1', '/', 'filename')).toEqual('/level1/filename')
    expect(toAbsolutePath('/level1', 'level2', 'filename')).toEqual('/level1/level2/filename')
  })

  it('toFilename', () => {
    expect(toFilename('/filename')).toBe('filename')
    expect(toFilename('/level1/filename')).toBe('filename')
    expect(toFilename('/level1/level2/filename')).toBe('filename')
  })
})
