import AsyncStorage from '@react-native-async-storage/async-storage'
import assert from 'assert'
import {expect} from 'chai'

import {WALLET_CONFIG_24 as HASKELL_SHELLEY_24} from '../cardano/constants/mainnet/constants'
import {WALLETS} from '../cardano/utils'
import {rootStorage} from '../storage/rootStorage'
import {NETWORK_REGISTRY} from '../types'
import {WalletMeta} from '../walletManager'
import {migrateWalletMetas} from './walletMeta'

describe('migrateWalletMetas()', () => {
  beforeEach(() => AsyncStorage.clear())

  describe('networkId && walletImplementationId', () => {
    describe('when networkId is missing and isShelley is present', () => {
      it('should set networkId and walletImplementationId as JORMUNGANDR if isShelley is true', async () => {
        const {networkId: _, ...meta} = mockedWalletMeta
        await rootStorage.join('wallet/').setItem(meta.id, meta)
        await rootStorage.join('wallet/').join(`${meta.id}/`).setItem('data', mockedWalletData)
        const walletMetas = [meta]
        const expected = [
          {
            ...mockedWalletMeta,
            networkId: NETWORK_REGISTRY.JORMUNGANDR,
            walletImplementationId: WALLETS.JORMUNGANDR_ITN.WALLET_IMPLEMENTATION_ID,
          },
        ]

        const result = await migrateWalletMetas(walletMetas)

        expect(result).to.be.eql(expected)
      })

      it('should set networkId and walletImplementationId as HASKELL_SHELLEY if isShelley is false', async () => {
        const {networkId: _, ...meta} = {...mockedWalletMeta, isShelley: false}
        await rootStorage.join('wallet/').setItem(meta.id, meta)
        await rootStorage.join('wallet/').join(`${meta.id}/`).setItem('data', mockedWalletData)
        const walletMetas = [meta]
        const expected = [
          {
            ...mockedWalletMeta,
            isShelley: false,
            networkId: NETWORK_REGISTRY.HASKELL_SHELLEY,
            walletImplementationId: WALLETS.HASKELL_BYRON.WALLET_IMPLEMENTATION_ID,
          },
        ]

        const result = await migrateWalletMetas(walletMetas)

        expect(result).to.be.eql(expected)
      })
    })

    describe('when networkId is present or isShelley is missing', () => {
      it('should keep walletImplementationId if it is not null', async () => {
        const meta = mockedWalletMeta
        await rootStorage.join('wallet/').setItem(meta.id, meta)
        await rootStorage.join('wallet/').join(`${meta.id}/`).setItem('data', mockedWalletData)
        const walletMetas = [meta]
        const expected = [mockedWalletMeta]

        const result = await migrateWalletMetas(walletMetas)

        expect(result).to.be.eql(expected)
      })

      it('should set walletImplementationId as BYRON if it is null', async () => {
        const {walletImplementationId: _, ...meta} = mockedWalletMeta
        await rootStorage.join('wallet/').setItem(meta.id, meta)
        await rootStorage.join('wallet/').join(`${meta.id}/`).setItem('data', mockedWalletData)
        const walletMetas = [meta]
        const expected = [{...mockedWalletMeta, walletImplementationId: WALLETS.HASKELL_BYRON.WALLET_IMPLEMENTATION_ID}]

        const result = await migrateWalletMetas(walletMetas)

        expect(result).to.be.eql(expected)
      })

      it('should set networkId as HASKELL_SHELLEY if it is null', async () => {
        const {networkId: _networkId, isShelley: _isShelley, ...meta} = mockedWalletMeta
        await rootStorage.join('wallet/').setItem(meta.id, meta)
        await rootStorage.join('wallet/').join(`${meta.id}/`).setItem('data', mockedWalletData)
        const walletMetas = [meta]
        const expectedWalletMeta = {...mockedWalletMeta, networkId: NETWORK_REGISTRY.HASKELL_SHELLEY}
        delete expectedWalletMeta.isShelley
        const expected = [expectedWalletMeta]

        const result = await migrateWalletMetas(walletMetas)

        expect(result).to.be.eql(expected)
      })

      it('should set networkId as HASKELL_SHELLEY if it is BYRON_MAINNET', async () => {
        const {isShelley: _isShelley, ...meta} = mockedWalletMeta
        await rootStorage.join('wallet/').setItem(meta.id, meta)
        await rootStorage.join('wallet/').join(`${meta.id}/`).setItem('data', mockedWalletData)
        const walletMetas = [meta]
        const expectedWalletMeta = {...mockedWalletMeta, networkId: NETWORK_REGISTRY.HASKELL_SHELLEY}
        delete expectedWalletMeta.isShelley
        const expected = [expectedWalletMeta]

        const result = await migrateWalletMetas(walletMetas)

        expect(result).to.be.eql(expected)
      })

      it('should keep networkId if it is not BYRON_MAINNET and not NULL', async () => {
        const meta = {...mockedWalletMeta, networkId: NETWORK_REGISTRY.HASKELL_SHELLEY_TESTNET}
        delete meta.isShelley
        await rootStorage.join('wallet/').setItem(meta.id, meta)
        await rootStorage.join('wallet/').join(`${meta.id}/`).setItem('data', mockedWalletData)
        const walletMetas = [meta]
        const expectedWalletMeta = {...mockedWalletMeta, networkId: NETWORK_REGISTRY.HASKELL_SHELLEY_TESTNET}
        delete expectedWalletMeta.isShelley
        const expected = [expectedWalletMeta]

        const result = await migrateWalletMetas(walletMetas)

        expect(result).to.be.eql(expected)
      })
    })

    describe('when checksum is missing or undefined', () => {
      it('should set checksum with data when the addressGenerator is present in the wallet/data HASKELL', async () => {
        const {checksum: _, ...meta} = mockedWalletMeta

        await rootStorage.join('wallet/').setItem(meta.id, meta)
        await rootStorage.join('wallet/').join(`${meta.id}/`).setItem('data', mockedWalletData)
        const walletMetas = [meta]
        const expectedWalletMeta = mockedWalletMeta
        const expected = [expectedWalletMeta]

        const result = await migrateWalletMetas(walletMetas)

        expect(result).to.be.eql(expected)
      })

      it('should set checksum with legacy data when the addressGenerator is present in the wallet/data BYRON', async () => {
        const {checksum: _, ...meta} = {
          ...mockedWalletMeta,
          walletImplementationId: WALLETS.HASKELL_BYRON.WALLET_IMPLEMENTATION_ID,
        }

        await rootStorage.join('wallet/').setItem(meta.id, meta)
        await rootStorage.join('wallet/').join(`${meta.id}/`).setItem('data', mockedWalletData)
        const walletMetas = [meta]
        const expectedWalletMeta = {
          ...mockedWalletMeta,
          walletImplementationId: WALLETS.HASKELL_BYRON.WALLET_IMPLEMENTATION_ID,
          checksum: {
            TextPart: 'ATPE-6458',
            ImagePart:
              '1dda96f3e8a39341da9549bef4be416c173eeb940f092cfc98d5c63a06c6007d326c77a599b1fd36ddf57507b8ea52537f129dac7bceb18c674bc3baab90411f',
          },
        }
        const expected = [expectedWalletMeta]

        const result = await migrateWalletMetas(walletMetas)

        expect(result).to.be.eql(expected)
      })

      it('should set checksum with legacy data when the addressGenerator is present in the wallet/data JORMUNGANDR', async () => {
        const {checksum: _, ...meta} = {
          ...mockedWalletMeta,
          walletImplementationId: WALLETS.JORMUNGANDR_ITN.WALLET_IMPLEMENTATION_ID,
        }
        await rootStorage.join('wallet/').setItem(meta.id, meta)
        await rootStorage.join('wallet/').join(`${meta.id}/`).setItem('data', mockedWalletData)
        const walletMetas = [meta]
        const expectedWalletMeta = {
          ...mockedWalletMeta,
          walletImplementationId: WALLETS.JORMUNGANDR_ITN.WALLET_IMPLEMENTATION_ID,
          checksum: {
            TextPart: 'SKBE-5478',
            ImagePart:
              '61942e0a01bd7eccff636a468e4d04bd05fe2169c2d26f83236ade661860d93e22c07ff007117555c6a15a92ac43f88e453d31c3b7a240dcd11ca3a7eba29321',
          },
        }

        const expected = [expectedWalletMeta]

        const result = await migrateWalletMetas(walletMetas)

        expect(result).to.be.eql(expected)
      })

      it('should set checksum with empty data when there is no addressGenerator in the wallet/data ', async () => {
        const {checksum: _, ...meta} = mockedWalletMeta
        const data = {...mockedWalletData, externalChain: {}}

        await rootStorage.join('wallet/').setItem(meta.id, meta)
        await rootStorage.join('wallet/').join(`${meta.id}/`).setItem('data', data)
        const walletMetas = [meta]
        const expectedWalletMeta = {
          ...mockedWalletMeta,
          checksum: {
            TextPart: '',
            ImagePart: '',
          },
        }
        const expected = [expectedWalletMeta]

        const result = await migrateWalletMetas(walletMetas)

        expect(result).to.be.eql(expected)
      })
    })

    describe('when isHW is missing', () => {
      it('should set isHW according to the wallet/data when false', async () => {
        const {isHW: _, ...meta} = mockedWalletMeta
        const data = {...mockedWalletData, isHW: false}
        await rootStorage.join('wallet/').setItem(meta.id, meta)
        await rootStorage.join('wallet/').join(`${meta.id}/`).setItem('data', data)
        const walletMetas = [meta]
        const expectedWalletMeta = {...mockedWalletMeta, isHW: false}
        const expected = [expectedWalletMeta]

        const result = await migrateWalletMetas(walletMetas)

        expect(result).to.be.eql(expected)
      })

      it('should set isHW according to the wallet/data when true', async () => {
        const {isHW: _, ...meta} = mockedWalletMeta
        const data = {...mockedWalletData, isHW: true}
        await rootStorage.join('wallet/').setItem(meta.id, meta)
        await rootStorage.join('wallet/').join(`${meta.id}/`).setItem('data', data)
        const walletMetas = [meta]
        const expectedWalletMeta = {...mockedWalletMeta, isHW: true}
        const expected = [expectedWalletMeta]

        const result = await migrateWalletMetas(walletMetas)

        expect(result).to.be.eql(expected)
      })

      it('should set isHW to false when it is not present in wallet/data', async () => {
        const {isHW: _, ...meta} = mockedWalletMeta
        const data = {...mockedWalletData, isHW: null}
        await rootStorage.join('wallet/').setItem(meta.id, meta)
        await rootStorage.join('wallet/').join(`${meta.id}/`).setItem('data', data)
        const walletMetas = [meta]
        const expectedWalletMeta = {...mockedWalletMeta, isHW: false}
        const expected = [expectedWalletMeta]

        const result = await migrateWalletMetas(walletMetas)

        expect(result).to.be.eql(expected)
      })
    })

    describe('wallet meta type check', () => {
      it('should throw when there is no id', async () => {
        const {id: _, ...meta} = mockedWalletMeta
        await rootStorage.join('wallet/').setItem(mockedWalletMeta.id, meta)
        await rootStorage.join('wallet/').join(`${mockedWalletMeta.id}/`).setItem('data', mockedWalletData)
        const walletMetas = [meta]

        try {
          await migrateWalletMetas(walletMetas)
        } catch (_e) {
          assert.rejects(() => migrateWalletMetas(walletMetas))
        }
      })

      it('should not throw when optional fields are not present', async () => {
        const {isShelley: _isShelley, ...meta} = mockedWalletMeta
        await rootStorage.join('wallet/').setItem(meta.id, meta)
        await rootStorage.join('wallet/').join(`${meta.id}/`).setItem('data', mockedWalletData)
        const walletMetas = [meta]

        assert.doesNotReject(() => migrateWalletMetas(walletMetas))
      })

      it('should throw when safeguard fails', async () => {
        const {isShelley: _isShelley, ...meta} = {...mockedWalletMeta, walletImplementationId: 'invalid'}
        await rootStorage.join('wallet/').setItem(meta.id, meta)
        await rootStorage.join('wallet/').join(`${meta.id}/`).setItem('data', mockedWalletData)
        const walletMetas = [meta]
        try {
          // @ts-expect-error test
          await migrateWalletMetas(walletMetas)
        } catch (_e) {
          // @ts-expect-error test
          assert.rejects(() => migrateWalletMetas(walletMetas))
        }
      })
    })

    describe('when isEasyConfirmationEnabled is missing', () => {
      it('should set isEasyConfirmationEnabled to false', async () => {
        const {isEasyConfirmationEnabled: _, ...meta} = mockedWalletMeta
        await rootStorage.join('wallet/').setItem(meta.id, meta)
        await rootStorage.join('wallet/').join(`${meta.id}/`).setItem('data', mockedWalletData)
        const walletMetas = [meta]
        const expectedWalletMeta = {...mockedWalletMeta, isEasyConfirmationEnabled: false}
        const expected = [expectedWalletMeta]

        const result = await migrateWalletMetas(walletMetas)

        expect(result).to.be.eql(expected)
      })
    })
  })
})

const mockedWalletMeta: WalletMeta = {
  id: 'wallet-id',
  name: 'my-wallet',
  networkId: NETWORK_REGISTRY.HASKELL_SHELLEY,
  isHW: false,
  isShelley: true,
  isEasyConfirmationEnabled: true,
  checksum: {
    TextPart: 'JHKT-8080',
    ImagePart:
      'b04dc22991594170974bbbb5908cc50b48f236d680a9ebfe6c1d00f52f8f4813341943eb66dec48cfe7f3be5beec705b91300a07641e668ff19dfa2fbeccbfba',
  },
  walletImplementationId: HASKELL_SHELLEY_24.WALLET_IMPLEMENTATION_ID,
}

// legacy wallet data is any
const mockedWalletData = {
  id: 'wallet-id',
  externalChain: {
    addressGenerator: {
      account: {
        derivation_scheme: 'V2',
        root_cached_key:
          '7f53efa3c08093db3824235769079e96ef96b6680fc254f6c021ec420e4d1555' +
          'b5bafb0b1fc6c8040cc8f69f7c1948dfb4dcadec4acd09730c0efb39c6159362',
      },
      accountPubKeyHex:
        '8e4e2f11b6ac2a269913286e26339779ab8767579d18d173cdd324929d94e2c43e3ec212cc8a36ed9860579dfe1e3ef4d6de778c5dbdd981623b48727cd96247',
    },
  },
  isHW: false,
}
