import {Portfolio, Wallet} from '@yoroi/types'
import {HWDeviceInfo, HWDeviceObj, HWFeatures} from '@yoroi/types/src/hw/hw'
import {
  PortfolioTokenNature,
  PortfolioTokenType,
} from '@yoroi/types/src/portfolio/token'
import {
  WalletAddressMode,
  WalletImplementation,
} from '@yoroi/types/src/wallet/wallet'
import {YoroiWallet} from '../../wallets/cardano/types'

export const mockUseCollateralInfo = (wallet: YoroiWallet) => ({
  utxo: {
    amount: '1000',
    receiver: 'ad_frfrrerere',
    tx_hash: 'tx_vreerr',
    tx_index: '100',
    utxo_id: '1',
  },
  amount: {
    quantity: 201023131313313311331n,
  } as Portfolio.Token.Amount,
  collateralId: '1211',
  isConfirmed: false,
})

export const mockUseSelectedWallet = (): {
  wallet: YoroiWallet
  meta: Wallet.Meta
} => {
  return {
    wallet: {
      portfolioPrimaryTokenInfo: {
        id: '.',
        nature: PortfolioTokenNature.Primary,
        type: PortfolioTokenType.FT,
      } as Portfolio.Token.Info,
    } as YoroiWallet,
    meta: {
      version: 1,
      id: '1234',
      plate: 'plate',
      name: 'name',
      avatar: 'avatar',

      // operation
      implementation: 'cardano-cip1852' as WalletImplementation,
      addressMode: 'single' as WalletAddressMode,
      isReadOnly: true,
      hwDeviceInfo: {
        bip44AccountPublic: 'bip44AccountPublic',
        hwFeatures: {
          vendor: 'vendor',
          model: 'model',
          deviceId: 'deviceId',
          deviceObj: {
            vendorId: 123456,
            productId: 10,
          } as HWDeviceObj,
          serialHex: 'serialHex',
        } as HWFeatures,
      } as HWDeviceInfo,

      isHW: true,
      isEasyConfirmationEnabled: true,
    } as Wallet.Meta,
  }
}

export const mockSettingsCollateralItemAmount = {
  isMockPortfolio: true,
  mockFormattedCollateral: '1000 ADA',
}
