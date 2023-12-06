import {getCnsCryptoAddress} from './cns' // Adjust the path accordingly

describe('getCnsCryptoAddress', () => {
  it('should reject with an error', async () => {
    const domain = 'anotherdomain.blockchain'

    await expect(getCnsCryptoAddress(domain)).rejects.toThrow('not-implemented')
  })
})
