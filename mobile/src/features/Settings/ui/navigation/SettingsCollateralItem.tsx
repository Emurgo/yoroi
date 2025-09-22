import {amountFormatter} from '@yoroi/portfolio'

import * as React from 'react'

import {useWalletManager} from '~/features/WalletManager/context/WalletManagerProvider'
import {useCollateralInfo} from '~/wallets/cardano/utxoManager/useCollateralInfo'

import {usePrivacyMode} from '../../hooks/usePrivacyMode'
import {
  NavigatedSettingsItem,
  NavigatedSettingsItemProps,
} from '../shared/SettingsItems'

export const SettingsCollateralItem = ({
  label,
  onNavigate,
  icon,
  disabled,
}: NavigatedSettingsItemProps) => {
  const {selected} = useWalletManager()
  const {amount} = useCollateralInfo(selected.wallet!)

  const {isPrivacyModeEnabled, privacyPlaceholder} = usePrivacyMode()

  const formattedCollateral = React.useMemo(() => {
    const amountCollateral = {
      info: selected.wallet!.portfolioPrimaryTokenInfo,
      quantity: BigInt(amount.quantity),
    }

    return !isPrivacyModeEnabled
      ? amountFormatter({template: '{{value}} {{ticker}}'})(amountCollateral)
      : amountFormatter({template: `${privacyPlaceholder} {{ticker}}`})(
          amountCollateral,
        )
  }, [
    amount.quantity,
    isPrivacyModeEnabled,
    privacyPlaceholder,
    selected.wallet,
  ])

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
