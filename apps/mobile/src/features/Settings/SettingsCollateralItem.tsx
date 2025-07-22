import React from 'react'

import {Portfolio} from '@yoroi/types'
import {
  PortfolioTokenNature,
  PortfolioTokenType,
} from '@yoroi/types/src/portfolio/token'
import {YoroiWallet} from '../../wallets/cardano/types'
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
  const {wallet} = {
    wallet: {
      portfolioPrimaryTokenInfo: {
        id: '.',
        nature: PortfolioTokenNature.Primary,
        type: PortfolioTokenType.FT,
      } as Portfolio.Token.Info,
    } as YoroiWallet,
  }
  const {amount} = {
    amount: {
      quantity: 201023131313313311331,
    },
  }
  const {isPrivacyActive, privacyPlaceholder} = usePrivacyMode()

  return (
    <NavigatedSettingsItem
      onNavigate={onNavigate}
      disabled={disabled}
      icon={icon}
      label={label}
      selected={'0.0000 ADA'}
    />
  )
}
