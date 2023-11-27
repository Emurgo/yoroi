import {Links} from '@yoroi/types'
import {
  configCardanoClaimV1,
  configCardanoLegacyTransfer,
  linksCardanoModuleMaker,
} from './module'

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
          ).toContain('must be a cardano address')
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
  })
})
