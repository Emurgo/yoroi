import AsyncStorage from '@react-native-async-storage/async-storage'

import {EncryptedStorage, EncryptedStorageKeys} from './EncryptedStorage'

describe('EncryptedStorage', () => {
  const password = '1234567890'
  const data = '65656565494949'
  const key = EncryptedStorageKeys.rootKey('walletId')

  beforeEach(() => AsyncStorage.clear())

  it('should remove inexistent key', async () => {
    await expect(EncryptedStorage.remove(key)).resolves.not.toThrow()
  })

  it('should throw Error(RootKey invalid) if reading an empty key', async () => {
    await expect(EncryptedStorage.read(key, password)).rejects.toBeInstanceOf(Error)
    await expect(EncryptedStorage.read(key, password)).rejects.toThrowError('RootKey invalid')
  })

  it('should encrypt encrypt/decrypt', async () => {
    await EncryptedStorage.write(key, data, password)

    const decrypted = await EncryptedStorage.read(key, password)

    expect(decrypted).toBe(data)
    // (nodejs -> CardanoError, mobile -> WrongPassword) both extend Error
    await expect(EncryptedStorage.read(key, 'wrong-password')).rejects.toBeInstanceOf(Error)
  })

  it('should update and remove', async () => {
    const newData = '494949'
    await EncryptedStorage.write(key, data, password)

    const decrypted = await EncryptedStorage.read(key, password)
    expect(decrypted).toBe(data)
    await EncryptedStorage.write(key, newData, password)
    const decryptedNewData = await EncryptedStorage.read(key, password)
    expect(decryptedNewData).toBe(newData)

    await expect(EncryptedStorage.remove(key)).resolves.not.toThrow()
    await expect(EncryptedStorage.read(key, password)).rejects.toThrowError('RootKey invalid')
  })
})
