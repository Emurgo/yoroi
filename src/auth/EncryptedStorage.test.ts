import {CredentialsNotFound, EncryptedStorage as ES, StorageKeys} from './EncryptedStorage'

describe('EncryptedStorage', () => {
  const password = '1234567890'
  const data = '65656565494949'
  const key = StorageKeys.rootKey('walletId')
  it('should remove inexistent key', async () => {
    await expect(ES.remove(key)).resolves
  })
  it('should throw CredentialsNotFound if reading an empty key', async () => {
    await expect(ES.read(key, password)).rejects.toBeInstanceOf(CredentialsNotFound)
  })
  it('should encrypt decrypt', async () => {
    await ES.write(key, data, password)

    const decrypted = await ES.read(key, password)

    expect(decrypted).toBe(data)
    // (nodejs -> CardanoError, mobile -> WrongPassword) both extend Error
    await expect(ES.read(key, 'wrong-password')).rejects.toBeInstanceOf(Error)
  })
  it('should update and remove', async () => {
    const newData = '494949'
    await ES.write(key, data, password)

    const decrypted = await ES.read(key, password)
    expect(decrypted).toBe(data)
    await ES.write(key, newData, password)
    const decryptedNewData = await ES.read(key, password)
    expect(decryptedNewData).toBe(newData)

    await expect(ES.remove(key)).resolves
    await expect(ES.read(key, password)).rejects.toBeInstanceOf(CredentialsNotFound)
  })
})
