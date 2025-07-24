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
import * as React from 'react'
import {Alert} from 'react-native'
import {YoroiWallet} from '../../../../wallets/cardano/types'

export const mockUseAuthSetting = () => 'pin'

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

export const useAddressModeMock = () => {
  const {
    meta: {id, addressMode},
  } = mockUseSelectedWallet()

  return React.useMemo(() => {
    const enableMultipleMode = () => {
      Alert.alert(
        `walletManager.changeWalletAddressMode changed to multiple: ${id}`,
      )
    }
    const enableSingleMode = () => {
      Alert.alert(
        `walletManager.changeWalletAddressMode changed to single: ${id}`,
      )
    }

    const toggle = () => {
      if (addressMode === 'single') {
        enableMultipleMode()
      } else {
        enableSingleMode()
      }
    }

    const isSingle = addressMode === 'single'
    const isMultiple = addressMode === 'multiple'

    return {
      isMultiple,
      isSingle,
      addressMode,
      toggle,
      enableSingleMode,
      enableMultipleMode,
    }
  }, [addressMode, id])
}
