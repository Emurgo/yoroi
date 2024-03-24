import {
  decodeExchangeShowCreateResult,
  decodeTransferRequestAda,
  decodeTransferRequestAdaWithLink,
  encodeExchangeShowCreateResult,
  encodeTransferRequestAda,
  encodeTransferRequestAdaWithLink,
} from './transformers'
import {mocks} from './transformers.mocks'

describe('transformers', () => {
  describe('encodeExchangeShowCreateResult', () => {
    it('should encode redirectTo if it is a safe URL', () => {
      const result = encodeExchangeShowCreateResult.parse({
        ...mocks.exchangeShowCreateResult.params,
        redirectTo: 'https://example.com',
      })

      expect(result).toEqual({
        ...mocks.exchangeShowCreateResult.result,
        redirectTo: encodeURIComponent('https://example.com'),
      })
    })

    it('should throw if redirectTo is not a safe URL', () => {
      expect(() =>
        encodeExchangeShowCreateResult.parse({
          ...mocks.exchangeShowCreateResult.params,
          redirectTo:
            "http://example.com/welcome?message=<script>alert('Malicious Script Executed')</script>",
        }),
      ).toThrow()
    })

    it('should not encode redirectTo when not present', () => {
      const result = encodeExchangeShowCreateResult.parse(
        mocks.exchangeShowCreateResult.params,
      )

      expect(result).toEqual(mocks.exchangeShowCreateResult.result)
    })
  })

  describe('decodeExchangeShowCreateResult', () => {
    it('should decode redirectTo if it is a safe URL', () => {
      const result = decodeExchangeShowCreateResult.parse({
        ...mocks.exchangeShowCreateResult.result,
        redirectTo: encodeURIComponent('https://example.com'),
      })

      expect(result).toEqual({
        ...mocks.exchangeShowCreateResult.params,
        redirectTo: 'https://example.com',
      })
    })

    it('should throw if redirectTo is not a safe URL', () => {
      expect(() =>
        decodeExchangeShowCreateResult.parse({
          ...mocks.exchangeShowCreateResult.result,
          redirectTo:
            'http://example.com/welcome?message=<script>alert("Malicious Script Executed")</script>',
        }),
      ).toThrow()
    })

    it('should not decode redirectTo when not present', () => {
      const params = decodeExchangeShowCreateResult.parse(
        mocks.exchangeShowCreateResult.result,
      )

      expect(params).toEqual(mocks.exchangeShowCreateResult.params)
    })
  })

  describe('encodeTransferRequestAdaWithLink', () => {
    it('should encode link', () => {
      const result = encodeTransferRequestAdaWithLink.parse(
        mocks.transferRequestAdaWithLink.params,
      )

      expect(result).toEqual(mocks.transferRequestAdaWithLink.result)
    })

    it('should encode redirectTo and link', () => {
      const result = encodeTransferRequestAdaWithLink.parse({
        ...mocks.transferRequestAdaWithLink.params,
        redirectTo: 'https://example.com',
      })

      expect(result).toEqual({
        ...mocks.transferRequestAdaWithLink.result,
        redirectTo: encodeURIComponent('https://example.com'),
      })
    })

    it('should throw if redirectTo is not a safe URL', () => {
      expect(() =>
        encodeTransferRequestAdaWithLink.parse({
          ...mocks.transferRequestAdaWithLink.params,
          redirectTo:
            "http://example.com/welcome?message=<script>alert('Malicious Script Executed')</script>",
        }),
      ).toThrow()
    })

    it('should throw if link is not a valid cardano link', () => {
      expect(() =>
        encodeTransferRequestAdaWithLink.parse({
          ...mocks.transferRequestAdaWithLink.params,
          link: 'invalid',
        }),
      ).toThrow()
    })
  })

  describe('decodeTransferRequestAdaWithLink', () => {
    it('should decode link', () => {
      const result = decodeTransferRequestAdaWithLink.parse(
        mocks.transferRequestAdaWithLink.result,
      )

      expect(result).toEqual(mocks.transferRequestAdaWithLink.params)
    })

    it('should decode redirectTo and link', () => {
      const result = decodeTransferRequestAdaWithLink.parse({
        ...mocks.transferRequestAdaWithLink.result,
        redirectTo: encodeURIComponent('https://example.com'),
      })

      expect(result).toEqual({
        ...mocks.transferRequestAdaWithLink.params,
        redirectTo: 'https://example.com',
      })
    })

    it('should throw if redirectTo is not a safe URL', () => {
      expect(() =>
        decodeTransferRequestAdaWithLink.parse({
          ...mocks.transferRequestAdaWithLink.result,
          redirectTo: encodeURIComponent(
            'http://example.com/welcome?message=<script>alert("Malicious Script Executed")</script>',
          ),
        }),
      ).toThrow()
    })

    it('should throw if link is not a valid cardano link', () => {
      expect(() =>
        decodeTransferRequestAdaWithLink.parse({
          ...mocks.transferRequestAdaWithLink.result,
          link: 'invalid',
        }),
      ).toThrow()
    })
  })

  describe('encodeTransferRequestAda', () => {
    it('should encode', () => {
      const result = encodeTransferRequestAda.parse(
        mocks.transferRequestAda.params,
      )

      expect(result).toEqual(mocks.transferRequestAda.result)
    })

    it('should throw if redirectTo is not a safe URL', () => {
      expect(() =>
        encodeTransferRequestAda.parse({
          ...mocks.transferRequestAda.params,
          redirectTo:
            "http://example.com/welcome?message=<script>alert('Malicious Script Executed')</script>",
        }),
      ).toThrow()
    })

    it('should encode with redirectTo', () => {
      const result = encodeTransferRequestAda.parse({
        ...mocks.transferRequestAda.params,
        redirectTo: 'https://example.com',
      })

      expect(result).toEqual({
        ...mocks.transferRequestAda.result,
        redirectTo: encodeURIComponent('https://example.com'),
      })
    })
  })

  describe('decodeTransferRequestAda', () => {
    it('should decode', () => {
      const result = decodeTransferRequestAda.parse(
        mocks.transferRequestAda.result,
      )

      expect(result).toEqual(mocks.transferRequestAda.params)
    })

    it('should throw if redirectTo is not a safe URL', () => {
      expect(() =>
        decodeTransferRequestAda.parse({
          ...mocks.transferRequestAda.result,
          redirectTo: encodeURIComponent(
            'http://example.com/welcome?message=<script>alert("Malicious Script Executed")</script>',
          ),
        }),
      ).toThrow()
    })

    it('should decode with redirectTo', () => {
      const result = decodeTransferRequestAda.parse({
        ...mocks.transferRequestAda.result,
        redirectTo: encodeURIComponent('https://example.com'),
      })

      expect(result).toEqual({
        ...mocks.transferRequestAda.params,
        redirectTo: 'https://example.com',
      })
    })
  })
})
