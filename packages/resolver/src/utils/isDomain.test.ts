import {isDomain} from './isDomain'

describe('isDomain', () => {
  it('should return true for valid domain formats', () => {
    expect(isDomain('example.com')).toBeTruthy()
    expect(isDomain('subdomain.example.co.uk')).toBeTruthy()
  })

  it('should return false for invalid domain formats', () => {
    expect(isDomain('just-a-string')).toBeFalsy()
    expect(isDomain('example')).toBeFalsy()
    expect(isDomain('1234567890')).toBeFalsy()
  })

  it('should return true for ADA handle domains when isAdaHandleDomain returns true', () => {
    expect(isDomain('$ADAHandle')).toBeTruthy()
  })
})
