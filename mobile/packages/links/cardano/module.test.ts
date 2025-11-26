import {Links} from '@yoroi/types'

import {
  configCardanoAddressV1,
  configCardanoBlockV1,
  configCardanoBrowseV1,
  configCardanoClaimV1,
  configCardanoConnectV1,
  configCardanoLegacyTransfer,
  configCardanoPayV1,
  configCardanoPaymentV1,
  configCardanoStakeV1,
  configCardanoTransactionV1,
  configCardanoWalletV1,
} from './constants'
import {linksCardanoModuleMaker} from './module'

describe('linksCardanoModuleMaker', () => {
  it('should return a Links.Module', () => {
    const module = linksCardanoModuleMaker()
    expect(module).toBeDefined()
  })

  describe('.create()', () => {
    const module = linksCardanoModuleMaker()

    describe('claim v1', () => {
      it('should throw if missing required params', () => {
        try {
          module.create({
            config: configCardanoClaimV1,
            params: {},
          })
        } catch (error) {
          expect(error).toBeInstanceOf(Links.Errors.RequiredParamsMissing)
          expect(
            (error as Links.Errors.RequiredParamsMissing).message,
          ).toContain('param code')
        }
        try {
          module.create({
            config: configCardanoClaimV1,
            params: {code: '123'},
          })
        } catch (error) {
          expect(error).toBeInstanceOf(Links.Errors.RequiredParamsMissing)
          expect(
            (error as Links.Errors.RequiredParamsMissing).message,
          ).toContain('param faucet_url')
        }
      })

      it('should throw if params are invalid', () => {
        try {
          module.create({
            config: configCardanoClaimV1,
            params: {code: 123, faucet_url: 'https://faucet.com'},
          })
        } catch (error) {
          expect(error).toBeInstanceOf(Links.Errors.ParamsValidationFailed)
          expect(
            (error as Links.Errors.ParamsValidationFailed).message,
          ).toContain('param code')
          expect(
            (error as Links.Errors.ParamsValidationFailed).message,
          ).toContain('must be a string')
        }
        try {
          module.create({
            config: configCardanoClaimV1,
            params: {code: 'https://faucet.com', faucet_url: 123},
          })
        } catch (error) {
          expect(error).toBeInstanceOf(Links.Errors.ParamsValidationFailed)
          expect(
            (error as Links.Errors.ParamsValidationFailed).message,
          ).toContain('param faucet_url')
          expect(
            (error as Links.Errors.ParamsValidationFailed).message,
          ).toContain('valid url')
        }
      })

      // param that might fail as optional will pass as extra
      it('should ignore extra params type checking and just include them', () => {
        const link = module.create({
          config: configCardanoClaimV1,
          params: {
            code: '300',
            faucet_url: 'https://faucet.com',
            memo: 1,
            message: 1,
            amount: '-,NaN',
          },
        })
        expect(link).toEqual({
          config: configCardanoClaimV1,
          params: {
            code: '300',
            faucet_url: 'https://faucet.com',
            memo: 1,
            message: 1,
            amount: '-,NaN',
          },
          link: 'web+cardano://claim/v1?code=300&faucet_url=https%3A%2F%2Ffaucet.com&memo=1&message=1&amount=-%2CNaN',
        })
      })

      it('should throw if a forbiden param was provided', () => {
        try {
          module.create({
            config: configCardanoClaimV1,
            params: {code: '123', faucet_url: 'https://faucet.com', address: 1},
          })
        } catch (error) {
          expect(error).toBeInstanceOf(Links.Errors.ForbiddenParamsProvided)
          expect(
            (error as Links.Errors.ForbiddenParamsProvided).message,
          ).toContain('param address')
        }
      })
    })

    describe('legacy transfer', () => {
      it('should work when none optional params were provided', () => {
        const link = module.create({
          config: configCardanoLegacyTransfer,
          params: {
            address:
              'addr_test1qrgpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqzp57km',
          },
        })
        expect(link).toEqual({
          config: configCardanoLegacyTransfer,
          params: {
            address:
              'addr_test1qrgpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqzp57km',
          },
          link: 'web+cardano:addr_test1qrgpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqzp57km',
        })
      })

      it('should work when optional params were provided and should drop extra params without throwing', () => {
        const link = module.create({
          config: configCardanoLegacyTransfer,
          params: {
            address:
              'addr_test1qrgpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqzp57km',
            amount: 1.23,
            memo: '%$-_/.memo',
            message: ['%$-_/.', 'message'],
            extra: 'extra',
          },
        })
        expect(link).toEqual({
          config: configCardanoLegacyTransfer,
          params: {
            address:
              'addr_test1qrgpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqzp57km',
            amount: 1.23,
            memo: '%$-_/.memo',
            message: ['%$-_/.', 'message'],
          },
          link: 'web+cardano:addr_test1qrgpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqzp57km?amount=1.23&memo=%25%24-_%2F.memo&message=%25%24-_%2F.&message=message',
        })
        const link2 = module.create({
          config: configCardanoLegacyTransfer,
          params: {
            address:
              'addr_test1qrgpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqzp57km',
            amount: 1.23,
            memo: '%$-_/.memo',
            message: '%$-_/.message',
            extra: 'extra',
          },
        })
        expect(link2).toEqual({
          config: configCardanoLegacyTransfer,
          params: {
            address:
              'addr_test1qrgpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqzp57km',
            amount: 1.23,
            memo: '%$-_/.memo',
            message: '%$-_/.message',
          },
          link: 'web+cardano:addr_test1qrgpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqzp57km?amount=1.23&memo=%25%24-_%2F.memo&message=%25%24-_%2F.message',
        })
      })

      it('should throw if optional params are invalid', () => {
        try {
          module.create({
            config: configCardanoLegacyTransfer,
            params: {
              address:
                'addr_test1qrgpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqzp57km',
              amount: '1,23',
            },
          })
        } catch (error) {
          expect(error).toBeInstanceOf(Links.Errors.ParamsValidationFailed)
          expect(
            (error as Links.Errors.ParamsValidationFailed).message,
          ).toContain('param amount')
          expect(
            (error as Links.Errors.ParamsValidationFailed).message,
          ).toContain('must be a number')
        }

        try {
          module.create({
            config: configCardanoLegacyTransfer,
            params: {
              address:
                'addr_test1qrgpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqzp57km',
              amount: 1.23,
              memo: 1,
            },
          })
        } catch (error) {
          expect(error).toBeInstanceOf(Links.Errors.ParamsValidationFailed)
          expect(
            (error as Links.Errors.ParamsValidationFailed).message,
          ).toContain('param memo')
          expect(
            (error as Links.Errors.ParamsValidationFailed).message,
          ).toContain('must be a string')
        }

        try {
          module.create({
            config: configCardanoLegacyTransfer,
            params: {
              address:
                'addr_/test1qrgpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqzp57km',
            },
          })
        } catch (error) {
          expect(error).toBeInstanceOf(Links.Errors.ParamsValidationFailed)
          expect(
            (error as Links.Errors.ParamsValidationFailed).message,
          ).toContain('param address')
          expect(
            (error as Links.Errors.ParamsValidationFailed).message,
          ).toContain('must be a valid Cardano address')
        }

        try {
          module.create({
            config: configCardanoLegacyTransfer,
            params: {
              address:
                'addr_test1qrgpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqzp57km',
              amount: 1.23,
              memo: 'memo',
              message: 1,
            },
          })
        } catch (error) {
          expect(error).toBeInstanceOf(Links.Errors.ParamsValidationFailed)
          expect(
            (error as Links.Errors.ParamsValidationFailed).message,
          ).toContain('param message')
          expect(
            (error as Links.Errors.ParamsValidationFailed).message,
          ).toContain('must be a string or array of strings')
        }

        try {
          module.create({
            config: configCardanoLegacyTransfer,
            params: {
              address:
                'addr_test1qrgpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqzp57km',
              amount: 1.23,
              memo: 'memo',
              message: [],
            },
          })
        } catch (error) {
          expect(error).toBeInstanceOf(Links.Errors.ParamsValidationFailed)
          expect(
            (error as Links.Errors.ParamsValidationFailed).message,
          ).toContain('param message')
          expect(
            (error as Links.Errors.ParamsValidationFailed).message,
          ).toContain('must be a string or array of strings')
        }

        try {
          module.create({
            config: configCardanoLegacyTransfer,
            params: {
              address:
                'addr_test1qrgpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqzp57km',
              amount: 1.23,
              memo: 'memo',
              message: [1],
            },
          })
        } catch (error) {
          expect(error).toBeInstanceOf(Links.Errors.ParamsValidationFailed)
          expect(
            (error as Links.Errors.ParamsValidationFailed).message,
          ).toContain('param message')
          expect(
            (error as Links.Errors.ParamsValidationFailed).message,
          ).toContain('must be a string or array of strings')
        }
      })
    })
  })
  describe('.parse()', () => {
    const module = linksCardanoModuleMaker()
    // NOTE: UnsupportedScheme is not tested here since is part of the manager parser (not implemented yet)
    it('should return undefined if scheme is part of cardano parser', () => {
      const url =
        'bitcoin:1BoatSLRHtKNngkdXEeobR76b53LETtpyT?amount=0.01&label=JohnDoe&message=Payment%20for%20services'
      expect(module.parse(url)).toBeUndefined()
    })

    it('should throw ParamsValidationFailed (params)', () => {
      const url =
        'web+cardano:addr_test1qrgpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqzp57km?amount=1,23&memo=%25%24-_%2F.memo&message=%25%24-_%2F.messagei'
      expect(() => module.parse(url)).toThrow(
        Links.Errors.ParamsValidationFailed,
      )
    })

    it('should throw ParamsValidationFailed (legacy address)', () => {
      const url =
        'web+cardano:addr_/test1qrgpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqzp57km?amount=1,23&memo=%25%24-_%2F.memo&message=%25%24-_%2F.messagei'
      expect(() => module.parse(url)).toThrow(
        Links.Errors.ParamsValidationFailed,
      )
    })

    it('should throw ForbiddenParamsProvided', () => {
      const url =
        'web+cardano://claim/v1?code=300&faucet_url=https%3A%2F%2Ffaucet.com&memo=1&message=1&amount=-%2CNaN&address=1'
      expect(() => module.parse(url)).toThrow(
        Links.Errors.ForbiddenParamsProvided,
      )
    })

    it('should throw UnsupportedVersion', () => {
      const url =
        'web+cardano://claim/v2?code=300&faucet_url=https%3A%2F%2Ffaucet.com&memo=1&message=1&amount=-%2CNaN&address=1'
      expect(() => module.parse(url)).toThrow(Links.Errors.UnsupportedVersion)
    })

    it('should throw UnsupportedAuthority', () => {
      const url =
        'web+cardano://authority/v2?code=300&faucet_url=https%3A%2F%2Ffaucet.com&memo=1&message=1&amount=-%2CNaN&address=1'
      expect(() => module.parse(url)).toThrow(Links.Errors.UnsupportedAuthority)
    })

    it('should work and keep extra params when allowed', () => {
      const url =
        'web+cardano://claim/v1?code=300&faucet_url=https%3A%2F%2Ffaucet.com&memo=memo-text&message=message1&message=message2&message=message3&extra=extra'
      const link = module.parse(url)
      expect(link).toEqual({
        config: configCardanoClaimV1,
        params: {
          code: '300',
          faucet_url: 'https://faucet.com',
          memo: 'memo-text',
          message: ['message1', 'message2', 'message3'],
          extra: 'extra',
        },
        link: url,
      })
    })

    it('should work and drop extra params when set to', () => {
      const url =
        'web+cardano:addr_test1qrgpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqzp57km?extra=extra&amount=1.23&memo=memo&message=message'
      const link = module.parse(url)
      expect(link).toEqual({
        config: configCardanoLegacyTransfer,
        params: {
          address:
            'addr_test1qrgpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqzp57km',
          amount: 1.23,
          memo: 'memo',
          message: 'message',
        },
        link: 'web+cardano:addr_test1qrgpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqzp57km?amount=1.23&memo=memo&message=message',
      })
    })

    it('should work minimum legacy transfer', () => {
      const url =
        'web+cardano:addr_test1qrgpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqzp57km'
      const link = module.parse(url)
      expect(link).toEqual({
        config: configCardanoLegacyTransfer,
        params: {
          address:
            'addr_test1qrgpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqzp57km',
        },
        link: 'web+cardano:addr_test1qrgpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqzp57km',
      })
    })

    describe('browse authority', () => {
      it('should parse browse URL without app_path', () => {
        const url = 'web+cardano://browse/v1/https/com.example'
        const link = module.parse(url)
        expect(link).toEqual({
          config: configCardanoBrowseV1,
          params: {
            scheme: 'https',
            namespaced_domain: 'com.example',
            url: 'https://example.com/',
          },
          link: url,
        })
      })

      it('should parse browse URL with app_path', () => {
        const url =
          'web+cardano://browse/v1/https/com.example/path/to/resource?param=value'
        const link = module.parse(url)
        expect(link).toEqual({
          config: configCardanoBrowseV1,
          params: {
            scheme: 'https',
            namespaced_domain: 'com.example',
            app_path: 'path/to/resource',
            url: 'https://example.com/path/to/resource?param=value',
            param: 'value',
          },
          link: url,
        })
      })

      it('should throw if browse URL has insufficient path segments', () => {
        const url = 'web+cardano://browse/v1/https'
        expect(() => module.parse(url)).toThrow(
          Links.Errors.ParamsValidationFailed,
        )
      })

      it('should throw if browse URL has invalid scheme', () => {
        const url = 'web+cardano://browse/v1/invalid://com.example'
        expect(() => module.parse(url)).toThrow(
          Links.Errors.ParamsValidationFailed,
        )
      })

      it('should throw if browse URL has invalid namespaced domain', () => {
        const url = 'web+cardano://browse/v1/https/invalid-domain'
        expect(() => module.parse(url)).toThrow(
          Links.Errors.ParamsValidationFailed,
        )
      })

      it('should create browse URL without app_path', () => {
        const link = module.create({
          config: configCardanoBrowseV1,
          params: {
            scheme: 'https',
            namespaced_domain: 'com.example',
          },
        })
        expect(link.link).toBe('web+cardano://browse/v1/https/com.example')
      })

      it('should create browse URL with app_path', () => {
        const link = module.create({
          config: configCardanoBrowseV1,
          params: {
            scheme: 'https',
            namespaced_domain: 'com.example',
            app_path: 'path/to/resource',
          },
        })
        expect(link.link).toBe(
          'web+cardano://browse/v1/https/com.example/path/to/resource',
        )
      })
    })

    describe('transaction authority', () => {
      it('should parse transaction URL with hash', () => {
        const url =
          'web+cardano://transaction/v1/1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
        const link = module.parse(url)
        expect(link).toEqual({
          config: configCardanoTransactionV1,
          params: {
            hash: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          },
          link: url,
        })
      })

      // Note: output_index fragment is parsed but dropped due to extraParams: 'drop'
      it('should parse transaction URL with hash and output_index fragment', () => {
        const hash =
          '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
        const url = `web+cardano://transaction/v1/${hash}#0`
        const link = module.parse(url)
        expect(link).toBeDefined()
        if (!link) return
        expect(link.params.hash).toBe(hash)
        // Fragment is parsed but output_index is dropped due to config rules
        expect(link.config).toBe(configCardanoTransactionV1)
      })

      it('should parse transaction URL with hash and output_index fragment > 0', () => {
        const hash =
          '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
        const url = `web+cardano://transaction/v1/${hash}#5`
        const link = module.parse(url)
        expect(link).toBeDefined()
        if (!link) return
        expect(link.params.hash).toBe(hash)
        expect(link.config).toBe(configCardanoTransactionV1)
      })

      it('should ignore invalid output_index fragment', () => {
        const url =
          'web+cardano://transaction/v1/1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef#invalid'
        const link = module.parse(url)
        expect(link).toBeDefined()
        if (!link) return
        expect(link.params.output_index).toBeUndefined()
      })

      it('should throw if transaction URL has insufficient path segments', () => {
        const url = 'web+cardano://transaction/v1'
        expect(() => module.parse(url)).toThrow(Links.Errors.UnsupportedVersion)
      })

      it('should throw if transaction hash is invalid', () => {
        const url = 'web+cardano://transaction/v1/invalid-hash'
        expect(() => module.parse(url)).toThrow(
          Links.Errors.ParamsValidationFailed,
        )
      })

      it('should create transaction URL', () => {
        const link = module.create({
          config: configCardanoTransactionV1,
          params: {
            hash: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          },
        })
        expect(link.link).toBe(
          'web+cardano://transaction/v1/1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        )
      })
    })

    describe('address authority', () => {
      it('should parse address URL', () => {
        const url =
          'web+cardano://address/v1/addr_test1qrgpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqzp57km'
        const link = module.parse(url)
        expect(link).toEqual({
          config: configCardanoAddressV1,
          params: {
            address:
              'addr_test1qrgpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqzp57km',
          },
          link: url,
        })
      })

      it('should throw if address URL has insufficient path segments', () => {
        const url = 'web+cardano://address/v1'
        expect(() => module.parse(url)).toThrow(Links.Errors.UnsupportedVersion)
      })

      it('should throw if address is invalid', () => {
        const url = 'web+cardano://address/v1/invalid-address'
        expect(() => module.parse(url)).toThrow(
          Links.Errors.ParamsValidationFailed,
        )
      })

      it('should create address URL', () => {
        const link = module.create({
          config: configCardanoAddressV1,
          params: {
            address:
              'addr_test1qrgpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqzp57km',
          },
        })
        expect(link.link).toBe(
          'web+cardano://address/v1/addr_test1qrgpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqzp57km',
        )
      })
    })

    describe('block authority', () => {
      it('should parse block URL with hash', () => {
        const url =
          'web+cardano://block/v1?hash=1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
        const link = module.parse(url)
        expect(link).toEqual({
          config: configCardanoBlockV1,
          params: {
            hash: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          },
          link: url,
        })
      })

      it('should parse block URL with height', () => {
        const url = 'web+cardano://block/v1?height=12345'
        const link = module.parse(url)
        expect(link).toBeDefined()
        if (!link) return
        expect(link.config).toBe(configCardanoBlockV1)
        // Height is converted to number when parsing (in module.ts line 280)
        expect(link.params.height).toBe(12345)
      })

      it('should throw if block URL has neither hash nor height', () => {
        const url = 'web+cardano://block/v1'
        expect(() => module.parse(url)).toThrow(
          Links.Errors.ParamsValidationFailed,
        )
      })

      it('should throw if block URL has both hash and height', () => {
        const url =
          'web+cardano://block/v1?hash=1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef&height=12345'
        expect(() => module.parse(url)).toThrow(
          Links.Errors.ParamsValidationFailed,
        )
      })

      it('should throw if block hash is invalid', () => {
        const url = 'web+cardano://block/v1?hash=invalid-hash'
        expect(() => module.parse(url)).toThrow(
          Links.Errors.ParamsValidationFailed,
        )
      })

      it('should throw if block height is invalid', () => {
        const url = 'web+cardano://block/v1?height=invalid'
        expect(() => module.parse(url)).toThrow(
          Links.Errors.ParamsValidationFailed,
        )
      })

      it('should create block URL with hash', () => {
        const link = module.create({
          config: configCardanoBlockV1,
          params: {
            hash: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          },
        })
        expect(link.link).toBe(
          'web+cardano://block/v1?hash=1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        )
      })

      it('should create block URL with height', () => {
        const link = module.create({
          config: configCardanoBlockV1,
          params: {
            height: '12345',
          },
        })
        expect(link.link).toBe('web+cardano://block/v1?height=12345')
      })
    })

    describe('wallet authority', () => {
      it('should parse wallet URL', () => {
        const url = 'web+cardano://wallet/v1?type=readonly&accountPubKey=abc123'
        const link = module.parse(url)
        expect(link).toEqual({
          config: configCardanoWalletV1,
          params: {
            type: 'readonly',
            accountPubKey: 'abc123',
          },
          link: url,
        })
      })

      it('should create wallet URL', () => {
        const link = module.create({
          config: configCardanoWalletV1,
          params: {
            type: 'readonly',
            accountPubKey: 'abc123',
          },
        })
        expect(link.link).toContain('web+cardano://wallet/v1')
        expect(link.link).toContain('type=readonly')
        expect(link.link).toContain('accountPubKey=abc123')
      })
    })

    describe('pay authority', () => {
      const validAddress =
        'addr_test1qrgpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqzp57km'
      it('should parse pay URL', () => {
        const url = `web+cardano://pay/v1?address=${validAddress}&amount=100`
        const link = module.parse(url)
        expect(link).toBeDefined()
        if (!link) return
        expect(link.config).toBe(configCardanoPayV1)
        expect(link.params.address).toBe(validAddress)
        expect(link.params.amount).toBe('100')
      })

      it('should create pay URL', () => {
        const link = module.create({
          config: configCardanoPayV1,
          params: {
            address: validAddress,
            amount: '100',
          },
        })
        expect(link.link).toContain(
          `web+cardano://pay/v1?address=${validAddress}&amount=100`,
        )
      })
    })

    describe('payment authority', () => {
      const validAddress =
        'addr_test1qrgpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqzp57km'
      it('should parse payment URL', () => {
        const url = `web+cardano://payment/v1?address=${validAddress}&amount=100`
        const link = module.parse(url)
        expect(link).toBeDefined()
        if (!link) return
        expect(link.config).toBe(configCardanoPaymentV1)
        expect(link.params.address).toBe(validAddress)
        expect(link.params.amount).toBe('100')
      })

      it('should create payment URL', () => {
        const link = module.create({
          config: configCardanoPaymentV1,
          params: {
            address: validAddress,
            amount: '100',
          },
        })
        expect(link.link).toContain(
          `web+cardano://payment/v1?address=${validAddress}&amount=100`,
        )
      })
    })

    describe('stake authority', () => {
      it('should parse stake URL', () => {
        const url = 'web+cardano://stake/v1?pool=pool123'
        const link = module.parse(url)
        expect(link).toBeDefined()
        if (!link) return
        expect(link.config).toBe(configCardanoStakeV1)
        expect(link.params.pool).toBe('pool123')
      })

      it('should create stake URL', () => {
        const link = module.create({
          config: configCardanoStakeV1,
          params: {
            pool: 'pool123',
          },
        })
        expect(link.link).toBe('web+cardano://stake/v1?pool=pool123')
      })
    })

    describe('connect authority', () => {
      it('should parse connect URL', () => {
        const url = 'web+cardano://connect/v1?peerId=peer123'
        const link = module.parse(url)
        expect(link).toBeDefined()
        if (!link) return
        expect(link.config).toBe(configCardanoConnectV1)
        expect(link.params.peerId).toBe('peer123')
      })

      it('should create connect URL', () => {
        const link = module.create({
          config: configCardanoConnectV1,
          params: {
            peerId: 'peer123',
          },
        })
        expect(link.link).toBe('web+cardano://connect/v1?peerId=peer123')
      })
    })

    describe('query params with arrays', () => {
      it('should handle array params for optional params in create', () => {
        const link = module.create({
          config: configCardanoClaimV1,
          params: {
            code: '300',
            faucet_url: 'https://faucet.com',
            memo: ['memo1', 'memo2'],
          },
        })
        expect(link.link).toContain('memo=memo1&memo=memo2')
      })

      it('should handle duplicate optional params as array when parsing', () => {
        // message is optional and can be an array
        const url =
          'web+cardano://claim/v1?code=300&faucet_url=https://faucet.com&message=msg1&message=msg2'
        const link = module.parse(url)
        expect(link).toBeDefined()
        if (!link) return
        expect(link.params.message).toEqual(['msg1', 'msg2'])
        expect(link.params.code).toBe('300') // Required params should remain single value
      })
    })
  })
})
