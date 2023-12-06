import {getCnsCryptoAddress} from './cns' // Adjust the path accordingly

describe('getCnsCryptoAddress', () => {
  it('should resolve the correct address for javibueno.blockchain', async () => {
    const domain = 'javibueno.blockchain'
    const expectedAddress =
      'addr1qyqfm55lklr3lfyay8vqven832mkkatc0v92che77gumghwnqchnr3xqmw9500vq2d9v5v28lau829nknmrj39paed9sc3x34h'

    await expect(getCnsCryptoAddress(domain)).resolves.toBe(expectedAddress)
  })

  it('should reject with an error for any other domain', async () => {
    const domain = 'anotherdomain.blockchain'

    await expect(getCnsCryptoAddress(domain)).rejects.toThrow('fake-error')
  })
})
