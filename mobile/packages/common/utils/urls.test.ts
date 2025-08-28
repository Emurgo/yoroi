import {getBasePath} from './urls'

describe('getBasePath', () => {
  it.each`
    fullURL                                  | expected
    ${'https://example.com/path'}            | ${'https://example.com/path'}
    ${'https://example.com/path?query=123'}  | ${'https://example.com/path'}
    ${'https://example.com/path#hash'}       | ${'https://example.com/path'}
    ${'https://example.com/path?q=1#h'}      | ${'https://example.com/path'}
    ${'https://example.com/path/2/1?q=1#h'}  | ${'https://example.com/path/2/1'}
    ${'http://localhost:3000/api'}           | ${'http://localhost:3000/api'}
    ${'http://localhost:3000/api?test=true'} | ${'http://localhost:3000/api'}
  `('should return $expected for URL $fullURL', ({fullURL, expected}) => {
    expect(getBasePath(fullURL)).toBe(expected)
  })
})
