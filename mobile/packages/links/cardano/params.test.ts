import {Address, Links} from '@yoroi/types'

import {
  configCardanoBlockV1,
  configCardanoBrowseV1,
  configCardanoClaimV1,
  configCardanoConnectV1,
  configCardanoPayV1,
  configCardanoStakeV1,
  configCardanoTransactionV1,
  configCardanoWalletV1,
} from './constants'
import {getParamValidator, preapareParams} from './params'

describe('params', () => {
  describe('preapareParams', () => {
    describe('forbidden params', () => {
      it('should throw when forbidden param is provided', () => {
        expect(() =>
          preapareParams({
            config: configCardanoClaimV1,
            params: {
              code: '123',
              faucet_url: 'https://faucet.com',
              address: 'addr1test' as Address,
            },
          }),
        ).toThrow(Links.Errors.ForbiddenParamsProvided)
      })
    })

    describe('required params', () => {
      it('should throw when required param is missing', () => {
        expect(() =>
          preapareParams({
            config: configCardanoClaimV1,
            params: {code: '123'},
          }),
        ).toThrow(Links.Errors.RequiredParamsMissing)

        expect(() =>
          preapareParams({
            config: configCardanoClaimV1,
            params: {faucet_url: 'https://faucet.com'},
          }),
        ).toThrow(Links.Errors.RequiredParamsMissing)
      })

      it('should validate required params', () => {
        expect(() =>
          preapareParams({
            config: configCardanoClaimV1,
            params: {code: 123, faucet_url: 'https://faucet.com'},
          }),
        ).toThrow(Links.Errors.ParamsValidationFailed)
      })
    })

    describe('optional params', () => {
      it('should validate optional params when provided', () => {
        expect(() =>
          preapareParams({
            config: configCardanoPayV1,
            params: {
              address: 'addr1qtest' as Address,
              amount: 'invalid',
            },
          }),
        ).toThrow(Links.Errors.ParamsValidationFailed)
      })

      it('should not validate optional params when not provided', () => {
        const result = preapareParams({
          config: configCardanoPayV1,
          params: {
            address:
              'addr_test1qrgpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqzp57km' as Address,
          },
        })
        expect(result).toBeDefined()
      })
    })

    describe('extra params', () => {
      it('should drop extra params when extraParams is "drop"', () => {
        const result = preapareParams({
          config: configCardanoPayV1,
          params: {
            address:
              'addr_test1qrgpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqzp57km' as Address,
            extraParam: 'value',
          },
        })
        expect(result).not.toHaveProperty('extraParam')
      })

      it('should include extra params when extraParams is "include"', () => {
        const result = preapareParams({
          config: configCardanoClaimV1,
          params: {
            code: '123',
            faucet_url: 'https://faucet.com',
            extraParam: 'value',
          },
        })
        expect(result).toHaveProperty('extraParam')
      })
    })

    describe('wallet authority special cases', () => {
      it('should require mnemonic or rootKey for type=full', () => {
        expect(() =>
          preapareParams({
            config: configCardanoWalletV1,
            params: {type: 'full'},
          }),
        ).toThrow(Links.Errors.RequiredParamsMissing)

        const resultWithMnemonic = preapareParams({
          config: configCardanoWalletV1,
          params: {
            type: 'full',
            mnemonic:
              'word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12',
          },
        })
        expect(resultWithMnemonic).toBeDefined()

        const resultWithRootKey = preapareParams({
          config: configCardanoWalletV1,
          params: {
            type: 'full',
            rootKey: 'abcd1234',
          },
        })
        expect(resultWithRootKey).toBeDefined()
      })

      it('should throw when both mnemonic and rootKey are provided for type=full', () => {
        expect(() =>
          preapareParams({
            config: configCardanoWalletV1,
            params: {
              type: 'full',
              mnemonic:
                'word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12',
              rootKey: 'abcd1234',
            },
          }),
        ).toThrow(Links.Errors.ParamsValidationFailed)
      })

      it('should require accountPubKey for type=readonly', () => {
        expect(() =>
          preapareParams({
            config: configCardanoWalletV1,
            params: {type: 'readonly'},
          }),
        ).toThrow(Links.Errors.RequiredParamsMissing)

        const result = preapareParams({
          config: configCardanoWalletV1,
          params: {
            type: 'readonly',
            accountPubKey: 'abcd1234',
          },
        })
        expect(result).toBeDefined()
      })
    })
  })

  describe('getParamValidator', () => {
    const config = configCardanoPayV1

    describe('amount validation', () => {
      it('should accept valid numeric strings', () => {
        const validator = getParamValidator(config)
        expect(() => validator({key: 'amount', value: '123'})).not.toThrow()
        expect(() => validator({key: 'amount', value: '123.45'})).not.toThrow()
        expect(() => validator({key: 'amount', value: '0.1'})).not.toThrow()
      })

      it('should reject invalid amount formats', () => {
        const validator = getParamValidator(config)
        expect(() => validator({key: 'amount', value: '123,45'})).toThrow()
        expect(() => validator({key: 'amount', value: 'abc'})).toThrow()
        expect(() => validator({key: 'amount', value: '12.34.56'})).toThrow()
      })
    })

    describe('address validation', () => {
      it('should accept valid Cardano addresses', () => {
        const validator = getParamValidator(config)
        expect(() =>
          validator({
            key: 'address',
            value:
              'addr_test1qrgpjmyy8zk9nuza24a0f4e7mgp9gd6h3uayp0rqnjnkl54v4dlyj0kwfs0x4e38a7047lymzp37tx0y42glslcdtzhqzp57km',
          }),
        ).not.toThrow()
      })

      it('should reject invalid addresses', () => {
        const validator = getParamValidator(config)
        expect(() => validator({key: 'address', value: 'invalid'})).toThrow()
        expect(() => validator({key: 'address', value: 123 as any})).toThrow()
      })
    })

    describe('code validation', () => {
      it('should accept string values', () => {
        const validator = getParamValidator(configCardanoClaimV1)
        expect(() => validator({key: 'code', value: '123'})).not.toThrow()
        expect(() => validator({key: 'code', value: 'abc'})).not.toThrow()
      })

      it('should reject non-string values', () => {
        const validator = getParamValidator(configCardanoClaimV1)
        expect(() => validator({key: 'code', value: 123 as any})).toThrow()
      })
    })

    describe('dappPeer validation', () => {
      it('should accept non-empty strings', () => {
        const validator = getParamValidator(configCardanoConnectV1)
        expect(() =>
          validator({key: 'dappPeer', value: 'peer123'}),
        ).not.toThrow()
      })

      it('should reject empty strings', () => {
        const validator = getParamValidator(configCardanoConnectV1)
        expect(() => validator({key: 'dappPeer', value: ''})).toThrow()
      })
    })

    describe('host validation', () => {
      it('should accept valid host strings', () => {
        const validator = getParamValidator(configCardanoConnectV1)
        expect(() =>
          validator({key: 'host', value: 'example.com'}),
        ).not.toThrow()
      })

      it('should reject empty host strings', () => {
        const validator = getParamValidator(configCardanoConnectV1)
        expect(() => validator({key: 'host', value: ''})).toThrow()
      })
    })

    describe('scheme validation', () => {
      it('should accept valid URI schemes', () => {
        const validator = getParamValidator(configCardanoBrowseV1)
        expect(() => validator({key: 'scheme', value: 'https'})).not.toThrow()
        expect(() =>
          validator({key: 'scheme', value: 'my-scheme'}),
        ).not.toThrow()
      })

      it('should reject invalid schemes', () => {
        const validator = getParamValidator(configCardanoBrowseV1)
        expect(() => validator({key: 'scheme', value: '1scheme'})).toThrow()
        expect(() => validator({key: 'scheme', value: 'my scheme'})).toThrow()
      })
    })

    describe('namespaced_domain validation', () => {
      it('should accept domains with dots', () => {
        const validator = getParamValidator(configCardanoBrowseV1)
        expect(() =>
          validator({key: 'namespaced_domain', value: 'example.com'}),
        ).not.toThrow()
      })

      it('should reject domains without dots', () => {
        const validator = getParamValidator(configCardanoBrowseV1)
        expect(() =>
          validator({key: 'namespaced_domain', value: 'example'}),
        ).toThrow()
      })
    })

    describe('hash validation', () => {
      it('should accept "self" for transaction authority', () => {
        const validator = getParamValidator(configCardanoTransactionV1)
        expect(() => validator({key: 'hash', value: 'self'})).not.toThrow()
      })

      it('should accept valid 64-char hex for transaction authority', () => {
        const validator = getParamValidator(configCardanoTransactionV1)
        expect(() =>
          validator({
            key: 'hash',
            value:
              '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
          }),
        ).not.toThrow()
      })

      it('should accept valid 64-char hex for block authority', () => {
        const validator = getParamValidator(configCardanoBlockV1)
        expect(() =>
          validator({
            key: 'hash',
            value:
              '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
          }),
        ).not.toThrow()
      })

      it('should reject "self" for block authority', () => {
        const validator = getParamValidator(configCardanoBlockV1)
        expect(() => validator({key: 'hash', value: 'self'})).toThrow()
      })
    })

    describe('height validation', () => {
      it('should accept valid block heights', () => {
        const validator = getParamValidator(configCardanoBlockV1)
        expect(() => validator({key: 'height', value: '0'})).not.toThrow()
        expect(() => validator({key: 'height', value: '100'})).not.toThrow()
      })

      it('should reject invalid heights', () => {
        const validator = getParamValidator(configCardanoBlockV1)
        expect(() => validator({key: 'height', value: '-1'})).toThrow()
        expect(() => validator({key: 'height', value: 'abc'})).toThrow()
      })
    })

    describe('pool validation', () => {
      it('should accept non-empty strings', () => {
        const validator = getParamValidator(configCardanoStakeV1)
        expect(() => validator({key: 'pool', value: 'pool123'})).not.toThrow()
      })

      it('should reject empty strings', () => {
        const validator = getParamValidator(configCardanoStakeV1)
        expect(() => validator({key: 'pool', value: ''})).toThrow()
      })
    })

    describe('memo validation', () => {
      it('should accept strings up to 255 chars', () => {
        const validator = getParamValidator(configCardanoPayV1)
        const shortMemo = 'a'.repeat(255)
        expect(() => validator({key: 'memo', value: shortMemo})).not.toThrow()
      })

      it('should reject strings longer than 255 chars', () => {
        const validator = getParamValidator(configCardanoPayV1)
        const longMemo = 'a'.repeat(256)
        expect(() => validator({key: 'memo', value: longMemo})).toThrow()
      })
    })

    describe('message validation', () => {
      it('should accept strings up to 64 chars', () => {
        const validator = getParamValidator(configCardanoPayV1)
        const shortMessage = 'a'.repeat(64)
        expect(() =>
          validator({key: 'message', value: shortMessage}),
        ).not.toThrow()
      })

      it('should accept arrays of strings up to 64 chars each', () => {
        const validator = getParamValidator(configCardanoPayV1)
        expect(() =>
          validator({
            key: 'message',
            value: ['msg1', 'msg2', 'a'.repeat(64)] as any,
          }),
        ).not.toThrow()
      })

      it('should reject strings longer than 64 chars', () => {
        const validator = getParamValidator(configCardanoPayV1)
        const longMessage = 'a'.repeat(65)
        expect(() => validator({key: 'message', value: longMessage})).toThrow()
      })

      it('should reject arrays with strings longer than 64 chars', () => {
        const validator = getParamValidator(configCardanoPayV1)
        expect(() =>
          validator({
            key: 'message',
            value: ['msg1', 'a'.repeat(65)] as any,
          }),
        ).toThrow()
      })
    })

    describe('wallet authority parameters', () => {
      describe('type validation', () => {
        it('should accept "full" and "readonly"', () => {
          const validator = getParamValidator(configCardanoWalletV1)
          expect(() => validator({key: 'type', value: 'full'})).not.toThrow()
          expect(() =>
            validator({key: 'type', value: 'readonly'}),
          ).not.toThrow()
        })

        it('should reject other values', () => {
          const validator = getParamValidator(configCardanoWalletV1)
          expect(() => validator({key: 'type', value: 'invalid'})).toThrow()
        })
      })

      describe('mnemonic validation', () => {
        it('should accept valid mnemonics', () => {
          const validator = getParamValidator(configCardanoWalletV1)
          const mnemonic12 =
            'word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12'
          expect(() =>
            validator({key: 'mnemonic', value: mnemonic12}),
          ).not.toThrow()
        })

        it('should reject invalid mnemonics', () => {
          const validator = getParamValidator(configCardanoWalletV1)
          expect(() =>
            validator({key: 'mnemonic', value: 'too short'}),
          ).toThrow()
        })
      })

      describe('rootKey validation', () => {
        it('should accept valid hex keys', () => {
          const validator = getParamValidator(configCardanoWalletV1)
          expect(() =>
            validator({key: 'rootKey', value: 'abcd1234'}),
          ).not.toThrow()
        })

        it('should reject invalid hex', () => {
          const validator = getParamValidator(configCardanoWalletV1)
          expect(() => validator({key: 'rootKey', value: 'invalid'})).toThrow()
        })
      })

      describe('accountPubKey validation', () => {
        it('should accept valid hex keys', () => {
          const validator = getParamValidator(configCardanoWalletV1)
          expect(() =>
            validator({key: 'accountPubKey', value: 'abcd1234'}),
          ).not.toThrow()
        })

        it('should reject invalid hex', () => {
          const validator = getParamValidator(configCardanoWalletV1)
          expect(() =>
            validator({key: 'accountPubKey', value: 'invalid'}),
          ).toThrow()
        })
      })

      describe('encryption validation', () => {
        it('should accept non-empty strings', () => {
          const validator = getParamValidator(configCardanoWalletV1)
          expect(() =>
            validator({key: 'encryption', value: 'aes256'}),
          ).not.toThrow()
        })

        it('should reject empty strings', () => {
          const validator = getParamValidator(configCardanoWalletV1)
          expect(() => validator({key: 'encryption', value: ''})).toThrow()
        })
      })

      describe('name validation', () => {
        it('should accept non-empty strings', () => {
          const validator = getParamValidator(configCardanoWalletV1)
          expect(() =>
            validator({key: 'name', value: 'My Wallet'}),
          ).not.toThrow()
        })

        it('should reject empty strings', () => {
          const validator = getParamValidator(configCardanoWalletV1)
          expect(() => validator({key: 'name', value: ''})).toThrow()
        })
      })

      describe('implementation validation', () => {
        it('should accept valid implementations', () => {
          const validator = getParamValidator(configCardanoWalletV1)
          expect(() =>
            validator({key: 'implementation', value: 'cardano-cip1852'}),
          ).not.toThrow()
          expect(() =>
            validator({key: 'implementation', value: 'cardano-bip44'}),
          ).not.toThrow()
        })

        it('should reject invalid implementations', () => {
          const validator = getParamValidator(configCardanoWalletV1)
          expect(() =>
            validator({key: 'implementation', value: 'invalid'}),
          ).toThrow()
        })
      })

      describe('addressMode validation', () => {
        it('should accept "single" and "multiple"', () => {
          const validator = getParamValidator(configCardanoWalletV1)
          expect(() =>
            validator({key: 'addressMode', value: 'single'}),
          ).not.toThrow()
          expect(() =>
            validator({key: 'addressMode', value: 'multiple'}),
          ).not.toThrow()
        })

        it('should reject other values', () => {
          const validator = getParamValidator(configCardanoWalletV1)
          expect(() =>
            validator({key: 'addressMode', value: 'invalid'}),
          ).toThrow()
        })
      })

      describe('accountVisual validation', () => {
        it('should accept non-negative integers', () => {
          const validator = getParamValidator(configCardanoWalletV1)
          expect(() =>
            validator({key: 'accountVisual', value: '0'}),
          ).not.toThrow()
          expect(() =>
            validator({key: 'accountVisual', value: '5'}),
          ).not.toThrow()
        })

        it('should reject negative numbers', () => {
          const validator = getParamValidator(configCardanoWalletV1)
          expect(() => validator({key: 'accountVisual', value: '-1'})).toThrow()
        })

        it('should reject non-integers', () => {
          const validator = getParamValidator(configCardanoWalletV1)
          expect(() =>
            validator({key: 'accountVisual', value: '5.5'}),
          ).toThrow()
        })

        it('should reject non-numeric strings', () => {
          const validator = getParamValidator(configCardanoWalletV1)
          expect(() =>
            validator({key: 'accountVisual', value: 'abc'}),
          ).toThrow()
        })
      })
    })
  })
})
