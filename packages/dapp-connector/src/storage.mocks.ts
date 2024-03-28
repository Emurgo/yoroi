import {App} from '@yoroi/types'

const memoryStorage = new Map<string, unknown>()

export const storageMock: App.Storage<true> = {
  clear: async () => {
    memoryStorage.clear()
  },
  multiSet: jest.fn().mockResolvedValue(undefined),
  setItem: async (key: string, value: unknown) => {
    memoryStorage.set(key, value)
  },
  multiRemove: jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
  getAllKeys: jest.fn().mockResolvedValue([]),
  join: jest.fn().mockResolvedValue(undefined),
  getItem: async <T>(key: string) => {
    return memoryStorage.get(key) as T
  },
  multiGet: jest.fn().mockResolvedValue(undefined),
  removeFolder: jest.fn().mockResolvedValue(undefined),
}
