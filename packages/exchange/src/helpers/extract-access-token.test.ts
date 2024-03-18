import {extractAccessTokenFromBaseUrl} from './extract-access-token'

describe('extractAccessTokenFromBaseUrl', () => {
  test('should extract access_token if present and return it in an object', () => {
    const url = 'http://example.com?access_token=12345'
    expect(extractAccessTokenFromBaseUrl(url)).toEqual({access_token: '12345'})
  })

  test('should return object with null access_token if it is not present in URL', () => {
    const url = 'http://example.com'
    expect(extractAccessTokenFromBaseUrl(url)).toEqual({access_token: null})
  })

  test('should return object with empty token access_token if access_token is present but empty', () => {
    const url = 'http://example.com?access_token='
    expect(extractAccessTokenFromBaseUrl(url)).toEqual({access_token: ''})
  })

  test('handles URLs with multiple query parameters correctly', () => {
    const url = 'http://example.com?other_param=123&access_token=abcde'
    expect(extractAccessTokenFromBaseUrl(url)).toEqual({access_token: 'abcde'})
  })

  test('should throw a TypeError for invalid URLs', () => {
    const url = 'http:::/this_is_not_a_valid_url'
    expect(() => extractAccessTokenFromBaseUrl(url)).toThrow('Invalid URL')
  })

  test('ignores hash fragments in URLs when extracting access_token', () => {
    const url = 'http://example.com#hashFragment?access_token=hidden'
    expect(extractAccessTokenFromBaseUrl(url)).toEqual({access_token: null})
  })

  test('correctly extracts access_token from complex URLs', () => {
    const url =
      'https://example.com/path/to/resource?access_token=complex&with=other&parameters=true'
    expect(extractAccessTokenFromBaseUrl(url)).toEqual({
      access_token: 'complex',
    })
  })

  test('decodes URL-encoded access_token values', () => {
    const url = 'http://example.com?access_token=special%20characters%20%21'
    expect(extractAccessTokenFromBaseUrl(url)).toEqual({
      access_token: 'special characters !',
    })
  })
})
