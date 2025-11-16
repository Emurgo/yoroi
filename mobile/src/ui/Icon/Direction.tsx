import {ThemedPalette, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {View, ViewStyle} from 'react-native'

import {DigitalAsset} from '~/ui/Icon/DigitalAsset'
import {Governance} from '~/ui/Icon/Governance'
import {Lock} from '~/ui/Icon/Lock'
import {Received} from '~/ui/Icon/Received'
import {RewardWithdrawn} from '~/ui/Icon/RewardWithdrawn'
import {Send} from '~/ui/Icon/Send'
import {Staking} from '~/ui/Icon/Staking'
import {StakingKeyDeregistered} from '~/ui/Icon/StakingKeyDeregistered'
import {StakingKeyRegistered} from '~/ui/Icon/StakingKeyRegistered'
import {Swap} from '~/ui/Icon/Swap'
import {Transaction} from '~/ui/Icon/Transaction'

import {MultiParty} from './MultiParty'
import {IconProps} from './type'

export const Direction = ({
  transactionDirection,
  operation,
  size = defaultSize,
  containerStyle,
}: IconProps & {
  transactionDirection: 'SENT' | 'RECEIVED' | 'SELF' | 'MULTI'
  operation?: string | null
  containerStyle?: ViewStyle
}) => {
  const {palette: p} = useTheme()

  // Determine icon and styles based on operation first, then fall back to direction
  const iconKey = getIconKey(transactionDirection, operation)
  const iconStyles = styleMap(p)[iconKey]
  const IconComponent = iconMap[iconKey]

  if (!IconComponent) {
    console.warn(`Unknown transaction direction: ${transactionDirection}`)
    return null
  }

  return (
    <View
      style={[
        {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 40,
          width: 40,
          borderRadius: 20,
        },
        {backgroundColor: iconStyles?.background},
        containerStyle,
      ]}
    >
      <IconComponent
        color={iconStyles?.icon ?? '#000'}
        size={iconStyles?.size ?? size}
      />
    </View>
  )
}

/**
 * Determine icon key based on operation type or fall back to transaction direction
 */
const getIconKey = (
  direction: 'SENT' | 'RECEIVED' | 'SELF' | 'MULTI',
  operation: string | null | undefined,
):
  | 'SENT'
  | 'RECEIVED'
  | 'SELF'
  | 'MULTI'
  | 'WITHDRAWAL'
  | 'SWAP'
  | 'SMART_CONTRACT'
  | 'STAKE_REGISTRATION'
  | 'STAKE_DEREGISTRATION'
  | 'STAKE_DELEGATION'
  | 'STAKE_UNDELEGATION'
  | 'VOTE_DELEGATION'
  | 'COLLATERAL_CREATION' => {
  if (!operation) {
    return direction
  }

  const opLower = operation.toLowerCase()

  // Map operation strings to icon keys
  if (opLower.includes('collateral creation')) {
    return 'COLLATERAL_CREATION'
  }
  if (opLower.includes('withdrawal')) {
    return 'WITHDRAWAL'
  }
  if (
    opLower.includes('swap') ||
    opLower.includes('swap created') ||
    opLower.includes('swap resolved') ||
    opLower.includes('swap cancel')
  ) {
    return 'SWAP'
  }
  if (opLower.includes('smart contract')) {
    return 'SMART_CONTRACT'
  }
  if (opLower.includes('stake undelegation')) {
    return 'STAKE_UNDELEGATION'
  }
  if (opLower.includes('staking delegated')) {
    return 'STAKE_DELEGATION'
  }
  if (opLower.includes('stake deregistration')) {
    return 'STAKE_DEREGISTRATION'
  }
  if (opLower.includes('stake delegation')) {
    return 'STAKE_DELEGATION'
  }
  if (opLower.includes('stake registration')) {
    return 'STAKE_REGISTRATION'
  }
  if (opLower.includes('vote delegation')) {
    return 'VOTE_DELEGATION'
  }

  // Fall back to direction if no operation match
  return direction
}

const defaultSize = 36

const iconMap: Record<
  | 'SENT'
  | 'RECEIVED'
  | 'SELF'
  | 'MULTI'
  | 'WITHDRAWAL'
  | 'SWAP'
  | 'SMART_CONTRACT'
  | 'STAKE_REGISTRATION'
  | 'STAKE_DEREGISTRATION'
  | 'STAKE_DELEGATION'
  | 'STAKE_UNDELEGATION'
  | 'VOTE_DELEGATION'
  | 'COLLATERAL_CREATION',
  ({size, color}: {size: number; color: string}) => React.ReactNode
> = {
  SENT: Send,
  RECEIVED: Received,
  SELF: Transaction,
  MULTI: MultiParty,
  WITHDRAWAL: RewardWithdrawn,
  SWAP: Swap,
  SMART_CONTRACT: DigitalAsset,
  STAKE_REGISTRATION: StakingKeyRegistered,
  STAKE_DEREGISTRATION: StakingKeyDeregistered,
  STAKE_DELEGATION: Staking,
  STAKE_UNDELEGATION: StakingKeyDeregistered,
  VOTE_DELEGATION: Governance,
  COLLATERAL_CREATION: Lock,
}

export const styleMap: (
  color: ThemedPalette,
) => Record<
  ThemeStatus,
  {background: string; icon: string; text: string; size?: number}
> = (color) => ({
  SELF: {
    text: color.gray_900,
    background: color.gray_100,
    icon: color.gray_900,
  },
  COLLATERAL_CREATION: {
    text: color.gray_900,
    background: color.gray_100,
    icon: color.gray_900,
  },
  SENT: {
    text: color.el_primary_medium,
    background: color.primary_100,
    icon: color.el_primary_medium,
  },
  RECEIVED: {
    text: color.secondary_600,
    background: color.secondary_100,
    icon: color.secondary_600,
  },
  MULTI: {
    text: color.gray_900,
    background: color.gray_100,
    icon: color.gray_900,
    size: 50,
  },
  WITHDRAWAL: {
    text: color.secondary_600,
    background: color.secondary_100,
    icon: color.secondary_600,
  },
  SWAP: {
    text: color.el_primary_medium,
    background: color.primary_100,
    icon: color.el_primary_medium,
  },
  SMART_CONTRACT: {
    text: color.el_primary_medium,
    background: color.primary_100,
    icon: color.el_primary_medium,
  },
  STAKE_REGISTRATION: {
    text: color.secondary_600,
    background: color.secondary_100,
    icon: color.secondary_600,
  },
  STAKE_DEREGISTRATION: {
    text: color.gray_900,
    background: color.gray_100,
    icon: color.gray_900,
  },
  STAKE_DELEGATION: {
    text: color.secondary_600,
    background: color.secondary_100,
    icon: color.secondary_600,
  },
  STAKE_UNDELEGATION: {
    text: color.gray_900,
    background: color.gray_100,
    icon: color.gray_900,
  },
  VOTE_DELEGATION: {
    text: color.el_primary_medium,
    background: color.primary_100,
    icon: color.el_primary_medium,
  },
})

type ThemeStatus =
  | 'SENT'
  | 'RECEIVED'
  | 'SELF'
  | 'MULTI'
  | 'WITHDRAWAL'
  | 'SWAP'
  | 'SMART_CONTRACT'
  | 'STAKE_REGISTRATION'
  | 'STAKE_DEREGISTRATION'
  | 'STAKE_DELEGATION'
  | 'STAKE_UNDELEGATION'
  | 'VOTE_DELEGATION'
  | 'COLLATERAL_CREATION'
