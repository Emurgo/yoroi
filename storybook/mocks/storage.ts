import {RootKey} from '../../src/auth'
import storage from '../../src/legacy/storage'

export const mockRootKey =
  (overrides?: Partial<ReturnType<RootKey>>): RootKey =>
  (_id: string) => ({
    reveal: async (password) => {
      if (password !== 'password') throw new Error('Invalid Password')

      return 'rootKey'
    },
    keep: async () => undefined,
    discard: async () => undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(overrides as any),
  })

export const mockStorage: typeof storage = {
  ...storage,
}
