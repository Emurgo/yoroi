import MK, {CredentialsNotFound} from './MasterKey'

describe('MasterKey()', () => {
  const password = '1234567890'
  const data = '65656565494949'
  const key = 'walletId'
  it('should remove inexistent key', async () => {
    const sut = MK(key)

    await expect(sut.discard()).resolves
  })
  it('should throw CredentialsNotFound if reading an empty key', async () => {
    const sut = MK(key)

    await expect(sut.reveal(password)).rejects.toBeInstanceOf(CredentialsNotFound)
  })
  it('should encrypt decrypt', async () => {
    const sut = MK(key)
    await sut.keep(password, data)

    const decrypted = await sut.reveal(password)

    expect(decrypted).toBe(data)
    // (nodejs -> CardanoError, mobile -> WrongPassword) both extend Error
    await expect(sut.reveal('wrong-password')).rejects.toBeInstanceOf(Error)
  })
  it('should update and remove', async () => {
    const newData = '494949'
    const sut = MK(key)
    await sut.keep(password, data)

    const decrypted = await sut.reveal(password)
    expect(decrypted).toBe(data)
    await sut.keep(password, newData)
    const decryptedNewData = await sut.reveal(password)
    expect(decryptedNewData).toBe(newData)

    await expect(sut.discard()).resolves
    await expect(sut.reveal(password)).rejects.toBeInstanceOf(CredentialsNotFound)
  })
})
