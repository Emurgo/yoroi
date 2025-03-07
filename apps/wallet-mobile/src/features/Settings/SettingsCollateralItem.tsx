import {amountFormatter} from '@yoroi/portfolio'
import React from 'react'

import {useCollateralInfo} from '../../yoroi-wallets/cardano/utxoManager/useCollateralInfo'
import {useSelectedWallet} from '../WalletManager/common/hooks/useSelectedWallet'
import {NavigatedSettingsItem, NavigatedSettingsItemProps} from './SettingsItems'
import {usePrivacyMode} from './useCases/changeAppSettings/PrivacyMode/PrivacyMode'

export const SettingsCollateralItem = ({label, onNavigate, icon, disabled}: NavigatedSettingsItemProps) => {
  const {wallet} = useSelectedWallet()
  const {amount} = useCollateralInfo(wallet)
  const {isPrivacyActive, privacyPlaceholder} = usePrivacyMode()

  const formattedCollateral = React.useMemo(() => {
    const amountCollateral = {
      info: wallet.portfolioPrimaryTokenInfo,
      quantity: BigInt(amount.quantity),
    }

    return !isPrivacyActive
      ? amountFormatter({template: '{{value}} {{ticker}}'})(amountCollateral)
      : amountFormatter({template: `${privacyPlaceholder} {{ticker}}`})(amountCollateral)
  }, [amount.quantity, isPrivacyActive, privacyPlaceholder, wallet.portfolioPrimaryTokenInfo])

  return (
    <NavigatedSettingsItem
      onNavigate={onNavigate}
      disabled={disabled}
      icon={icon}
      label={label}
      selected={formattedCollateral}
    />
  )
}
