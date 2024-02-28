import {App} from '@yoroi/types'

import {storageVersionMaker} from './storageVersion'

describe('storageVersion', () => {
  let storage: App.Storage

  beforeEach(() => {
    storage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
    } as never
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should save storage version', async () => {
    const version = 1
    const {save} = storageVersionMaker(storage)
    await save(version)
    expect(storage.setItem).toHaveBeenCalledWith('storageVersion', version)
  })

  it('should read storage version', async () => {
    const version = 1
    jest.spyOn(storage, 'getItem').mockResolvedValueOnce(version)
    const {read} = storageVersionMaker(storage)
    const result = await read()
    expect(storage.getItem).toHaveBeenCalledWith('storageVersion')
    expect(result).toBe(version)
  })

  it('should return 0 if storage version is not a number', async () => {
    const version = 'invalid'
    jest.spyOn(storage, 'getItem').mockResolvedValueOnce(version)
    const {read} = storageVersionMaker(storage)
    const result = await read()
    expect(storage.getItem).toHaveBeenCalledWith('storageVersion')
    expect(result).toBe(0)
  })

  it('should throw an error if saving storage version constant is lt provided version', async () => {
    const version = Infinity
    jest.spyOn(storage, 'setItem')
    const {save} = storageVersionMaker(storage)
    await expect(save(version)).rejects.toThrow()
    expect(storage.setItem).not.toHaveBeenCalled()
  })

  it('should save a new installation with currentStorageVersion', async () => {
    jest.spyOn(storage, 'setItem')
    const {newInstallation} = storageVersionMaker(storage)
    await newInstallation()
    expect(storage.setItem).toHaveBeenCalled()
  })
})
