import { RootKey } from "../../src/auth"

export const mockRootKey = (overrides?: Partial<ReturnType<RootKey>>): RootKey => (_id: string) =>
  ({
    reveal: async (password) => {
      if (password !== 'password') throw new Error('Invalid Password')

      return 'rootKey'
    },
    keep: async () => undefined,
    discard: async () => undefined,
    ...(overrides as any),
  })
