import React from 'react'

import {amountFormatter} from '@yoroi/portfolio'
import {
  mockSettingsCollateralItemAmount,
  mockUseCollateralInfo,
  mockUseSelectedWallet,
} from './SettingsCollateralItemMock'
import {
  NavigatedSettingsItem,
  NavigatedSettingsItemProps,
} from './SettingsItems'
import {usePrivacyMode} from './useCases/changeAppSettings/PrivacyMode/PrivacyMode'

export const SettingsCollateralItem = ({
  label,
  onNavigate,
  icon,
  disabled,
}: NavigatedSettingsItemProps) => {
  const {isMockPortfolio, mockFormattedCollateral} =
    mockSettingsCollateralItemAmount
  const {wallet} = mockUseSelectedWallet()
  const {amount} = mockUseCollateralInfo(wallet)

  const {isPrivacyActive, privacyPlaceholder} = usePrivacyMode()

  const formattedCollateral = React.useMemo(() => {
    const amountCollateral = {
      info: wallet.portfolioPrimaryTokenInfo,
      quantity: BigInt(amount.quantity),
    }

    return isMockPortfolio
      ? mockFormattedCollateral
      : !isPrivacyActive
        ? amountFormatter({template: '{{value}} {{ticker}}'})(amountCollateral)
        : amountFormatter({template: `${privacyPlaceholder} {{ticker}}`})(
            amountCollateral,
          )
  }, [
    amount.quantity,
    isPrivacyActive,
    privacyPlaceholder,
    wallet?.portfolioPrimaryTokenInfo,
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
