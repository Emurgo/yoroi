import {canAuthWithOS} from '../auth/auth'

describe('authOsEnabled', () => {
  describe('android', () => {
    describe('with fingerprint', () => {
      it('can auth', () => {
        const osAuth = canAuthWithOS({
          platform: 'android',
          supportedBiometryType: 'Fingerprint',
        })
        expect(osAuth).toBe(true)
      })
    })
    describe('with iris', () => {
      it('can auth', () => {
        const osAuth = canAuthWithOS({
          platform: 'android',
          supportedBiometryType: 'Iris',
        })
        expect(osAuth).toBe(true)
      })
    })
    describe('with face', () => {
      it('can auth', () => {
        const osAuth = canAuthWithOS({
          platform: 'android',
          supportedBiometryType: 'Face',
        })
        expect(osAuth).toBe(true)
      })
    })
    describe('with no os auth', () => {
      it('cant auth', () => {
        const osAuth = canAuthWithOS({
          platform: 'android',
          supportedBiometryType: null,
        })
        expect(osAuth).toBe(false)
      })
    })
  })

  describe('ios', () => {
    describe('with faceid', () => {
      it('can auth', () => {
        const osAuth = canAuthWithOS({
          platform: 'ios',
          supportedBiometryType: 'FaceID',
          canImplyAuthentication: true,
        })
        expect(osAuth).toBe(true)
      })
    })

    describe('with touchid', () => {
      it('can auth', () => {
        const osAuth = canAuthWithOS({
          platform: 'ios',
          supportedBiometryType: 'TouchID',
          canImplyAuthentication: true,
        })
        expect(osAuth).toBe(true)
      })
    })

    describe('cant imply auth', () => {
      it('cant auth with faceid', () => {
        const osAuth = canAuthWithOS({
          platform: 'ios',
          supportedBiometryType: 'FaceID',
          canImplyAuthentication: false,
        })
        expect(osAuth).toBe(false)
      })

      it('cant auth with touchid', () => {
        const osAuth = canAuthWithOS({
          platform: 'ios',
          supportedBiometryType: 'TouchID',
          canImplyAuthentication: false,
        })
        expect(osAuth).toBe(false)
      })
    })
  })
})
