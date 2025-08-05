import {Alert} from 'react-native'

import {YoroiWallet} from '~/wallets/cardano/types'

export const useShowCollateralNotFoundAlert = ({
  wallet,
  collateralTxPendingTitle,
  collateralNotFoundTitle,
  collateralTxPendingText,
  collateralNotFoundText,
  collateralNotFoundActionText,
  onCollateralNotFoundPress,
  onCollateralPendingPress,
}: {
  wallet: YoroiWallet
  collateralTxPendingTitle: string
  collateralNotFoundTitle: string
  collateralTxPendingText: string
  collateralNotFoundText: string
  collateralNotFoundActionText: string
  onCollateralNotFoundPress?: () => void
  onCollateralPendingPress?: () => void
}) => {
  return () => {
    const collateral = wallet.getCollateralInfo()
    const isCollateralUtxoPending = !collateral.isConfirmed && collateral.collateralId.length > 0

    if (isCollateralUtxoPending) {
      Alert.alert(collateralTxPendingTitle, collateralTxPendingText, [{onPress: onCollateralPendingPress}])
      return
    }

    Alert.alert(
      collateralNotFoundTitle,
      collateralNotFoundText,
      [
        {
          text: collateralNotFoundActionText,
          onPress: onCollateralNotFoundPress,
        },
      ],
      {cancelable: true, onDismiss: () => true},
    )
  }
} 