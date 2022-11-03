import KeyStore from '../../src/legacy/KeyStore'
import storage from '../../src/legacy/storage'

export const mockKeyStore = (overrides?: {
  getData?: typeof KeyStore.getData
  storeData?: typeof KeyStore.storeData
  deleteData?: typeof KeyStore.deleteData
}) =>
  ({
    getData: async (_keyId, encryptionMethod, _message, password, _intl) => {
      if (encryptionMethod === 'MASTER_PASSWORD' && password !== 'password') {
        throw new Error('Invalid Password')
      }

      return 'masterkey'
    },
    storeData: async () => undefined,
    deleteData: async () => undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(overrides as any),
  } as unknown as typeof KeyStore)

export const mockStorage: typeof storage = {
  ...storage,
}
