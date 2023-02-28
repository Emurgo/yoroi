import {CONFIG} from '../../legacy/config'
import {storage} from '../storage'
import {BackendConfig} from '../types'
import * as Byron from './byron/constants'
import {CardanoWallet} from './LegacyWallet'
import {CardanoHaskellShelleyNetwork} from './networks'
import * as Shelley from './shelley/constants'
import * as ShelleyTestnet from './shelley-testnet/constants'
import {WalletImplementation} from './types'

describe('split wallets', () => {
  test('byron mainnet', async () => {
    const networkId = Byron.NETWORK_ID // mainnet
    const implementationId = Byron.WALLET_IMPLEMENTATION_ID

    const legacyWallet = await CardanoWallet.create({
      id,
      mnemonic,
      networkId,
      implementationId,
      storage,
      password,
    })

    const internals = (legacyWallet as any).getInternals() as {
      networkConfig: CardanoHaskellShelleyNetwork
      baseNetworkConfig: Record<string, unknown>
      backendConfig: BackendConfig
      walletConfig: WalletImplementation
      config: typeof CONFIG
    }
    const {networkConfig, baseNetworkConfig, backendConfig, walletConfig, config} = internals

    const {NUMBERS} = config

    const {
      WALLET_TYPE_PURPOSE,
      COIN_TYPES,
      ACCOUNT_INDEX,
      HARD_DERIVATION_START,
      BIP44_DERIVATION_LEVELS,
    } = NUMBERS

    expect(Byron.PURPOSE).toEqual(WALLET_TYPE_PURPOSE.BIP44)
    expect(Byron.COIN_TYPE).toEqual(COIN_TYPES.CARDANO)
    expect(Byron.ACCOUNT_INDEX).toEqual(ACCOUNT_INDEX)
    expect(Byron.HARD_DERIVATION_START).toEqual(HARD_DERIVATION_START)
    expect(Byron.BIP44_DERIVATION_LEVELS).toEqual(BIP44_DERIVATION_LEVELS)
    
    expect(Byron.BACKEND).toEqual(backendConfig)
    expect(Byron.NETWORK_CONFIG).toEqual({
      ...networkConfig,
      EXPLORER_URL_FOR_ADDRESS: expect.any(Function),
      EXPLORER_URL_FOR_TOKEN: expect.any(Function),
      EXPLORER_URL_FOR_TX: expect.any(Function),
    })
    expect(Byron.BASE_CONFIG).toEqual(baseNetworkConfig)
    expect(Byron.WALLET_CONFIG).toEqual(walletConfig)
  })
  
  test('shelley mainnet', async () => {
    const networkId = Shelley.NETWORK_ID // mainnet
    const implementationId = Shelley.WALLET_IMPLEMENTATION_ID

    const legacyWallet = await CardanoWallet.create({
      id,
      mnemonic,
      networkId,
      implementationId,
      storage,
      password,
    })

    const internals = (legacyWallet as any).getInternals() as {
      networkConfig: CardanoHaskellShelleyNetwork
      baseNetworkConfig: Record<string, unknown>
      backendConfig: BackendConfig
      walletConfig: WalletImplementation
      config: typeof CONFIG
    }
    const {networkConfig, baseNetworkConfig, backendConfig, walletConfig, config} = internals

    const {NUMBERS} = config

    const {
      WALLET_TYPE_PURPOSE,
      COIN_TYPES,
      ACCOUNT_INDEX,
      HARD_DERIVATION_START,
      BIP44_DERIVATION_LEVELS,
    } = NUMBERS

    expect(Shelley.PURPOSE).toEqual(WALLET_TYPE_PURPOSE.CIP1852)
    expect(Shelley.COIN_TYPE).toEqual(COIN_TYPES.CARDANO)
    expect(Shelley.ACCOUNT_INDEX).toEqual(ACCOUNT_INDEX)
    expect(Shelley.HARD_DERIVATION_START).toEqual(HARD_DERIVATION_START)
    expect(Shelley.BIP44_DERIVATION_LEVELS).toEqual(BIP44_DERIVATION_LEVELS)
    
    expect(Shelley.BACKEND).toEqual(backendConfig)
    expect(Shelley.NETWORK_CONFIG).toEqual({
      ...networkConfig,
      EXPLORER_URL_FOR_ADDRESS: expect.any(Function),
      EXPLORER_URL_FOR_TOKEN: expect.any(Function),
      EXPLORER_URL_FOR_TX: expect.any(Function),
    })
    expect(Shelley.BASE_CONFIG).toEqual(baseNetworkConfig)
    expect(Shelley.WALLET_CONFIG).toEqual(walletConfig)
  })
  
  test('shelley testnet', async () => {
    const networkId = ShelleyTestnet.NETWORK_ID // mainnet
    const implementationId = ShelleyTestnet.WALLET_IMPLEMENTATION_ID

    const legacyWallet = await CardanoWallet.create({
      id,
      mnemonic,
      networkId,
      implementationId,
      storage,
      password,
    })

    const internals = (legacyWallet as any).getInternals() as {
      networkConfig: CardanoHaskellShelleyNetwork
      baseNetworkConfig: Record<string, unknown>
      backendConfig: BackendConfig
      walletConfig: WalletImplementation
      config: typeof CONFIG
    }
    const {networkConfig, baseNetworkConfig, backendConfig, walletConfig, config} = internals

    const {NUMBERS} = config

    const {
      WALLET_TYPE_PURPOSE,
      COIN_TYPES,
      ACCOUNT_INDEX,
      HARD_DERIVATION_START,
      BIP44_DERIVATION_LEVELS,
    } = NUMBERS

    expect(ShelleyTestnet.PURPOSE).toEqual(WALLET_TYPE_PURPOSE.CIP1852)
    expect(ShelleyTestnet.COIN_TYPE).toEqual(COIN_TYPES.CARDANO)
    expect(ShelleyTestnet.ACCOUNT_INDEX).toEqual(ACCOUNT_INDEX)
    expect(ShelleyTestnet.HARD_DERIVATION_START).toEqual(HARD_DERIVATION_START)
    expect(ShelleyTestnet.BIP44_DERIVATION_LEVELS).toEqual(BIP44_DERIVATION_LEVELS)
    
    expect(ShelleyTestnet.BACKEND).toEqual(backendConfig)
    expect(ShelleyTestnet.NETWORK_CONFIG).toEqual({
      ...networkConfig,
      EXPLORER_URL_FOR_ADDRESS: expect.any(Function),
      EXPLORER_URL_FOR_TOKEN: expect.any(Function),
      EXPLORER_URL_FOR_TX: expect.any(Function),
    })
    expect(ShelleyTestnet.BASE_CONFIG).toEqual(baseNetworkConfig)
    expect(ShelleyTestnet.WALLET_CONFIG).toEqual(walletConfig)
  })
})

const id = '1234567890'
const mnemonic =
  'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon share'
const password = '1234567890'
