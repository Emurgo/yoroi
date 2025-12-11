import {ThemedPalette, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {View, ViewStyle} from 'react-native'

import {logger} from '~/kernel/logger/logger'
import {Airdrop} from '~/ui/Icon/Airdrop'
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
  const iconStyles = styleMap(p, transactionDirection)[iconKey]
  const IconComponent = iconMap[iconKey]

  if (!IconComponent) {
    logger.warn(`Unknown transaction direction: ${transactionDirection}`)
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
 * Determine icon key based on operation type key (fixed, non-localized) or fall back to transaction direction
 * Operation type keys come from getOperationTypeKey() and are camelCase (e.g., 'nightRedemption', 'smartContract')
 */
const getIconKey = (
  direction: 'SENT' | 'RECEIVED' | 'SELF' | 'MULTI',
  operationTypeKey: string | null | undefined,
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
  | 'COLLATERAL_CREATION'
  | 'MINT'
  | 'BURN'
  | 'NIGHT_REDEMPTION' => {
  if (!operationTypeKey) {
    return direction
  }

  // Map operation type keys (fixed, non-localized camelCase) to icon keys
  switch (operationTypeKey) {
    case 'nightRedemption':
      return 'NIGHT_REDEMPTION'
    case 'withdrawal':
      return 'WITHDRAWAL'
    case 'burn':
      return 'BURN'
    case 'mint':
      return 'MINT'
    case 'swap':
    case 'swapCreated':
    case 'swapResolved':
    case 'swapCancel':
      return 'SWAP'
    case 'smartContract':
      return 'SMART_CONTRACT'
    case 'stakeUndelegation':
      return 'STAKE_UNDELEGATION'
    case 'stakingDelegated':
    case 'stakeDelegation':
      return 'STAKE_DELEGATION'
    case 'stakeDeregistration':
      return 'STAKE_DEREGISTRATION'
    case 'stakeRegistration':
      return 'STAKE_REGISTRATION'
    case 'voteDelegation':
      return 'VOTE_DELEGATION'
    case 'collateralCreation':
      return 'COLLATERAL_CREATION'
    default:
      // Fall back to direction if operation type key is unknown
      return direction
  }
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
  | 'COLLATERAL_CREATION'
  | 'MINT'
  | 'BURN'
  | 'NIGHT_REDEMPTION',
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
  MINT: DigitalAsset,
  BURN: Send,
  NIGHT_REDEMPTION: Airdrop,
}

/**
 * Get direction-based colors for operation types
 * Primary blue for SENT (spending), success green for RECEIVED (receiving)
 */
const getDirectionColors = (
  color: ThemedPalette,
  direction: 'SENT' | 'RECEIVED' | 'SELF' | 'MULTI',
): {text: string; background: string; icon: string} => {
  switch (direction) {
    case 'SENT':
      return {
        text: color.el_primary_medium,
        background: color.primary_100,
        icon: color.el_primary_medium,
      }
    case 'RECEIVED':
      return {
        text: color.secondary_600,
        background: color.secondary_100,
        icon: color.secondary_600,
      }
    case 'SELF':
    case 'MULTI':
    default:
      return {
        text: color.gray_900,
        background: color.gray_100,
        icon: color.gray_900,
      }
  }
}

export const styleMap: (
  color: ThemedPalette,
  direction: 'SENT' | 'RECEIVED' | 'SELF' | 'MULTI',
) => Record<
  ThemeStatus,
  {background: string; icon: string; text: string; size?: number}
> = (color, direction) => {
  // Get direction-based colors for operation types
  const directionColors = getDirectionColors(color, direction)

  return {
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
    SENT: directionColors,
    RECEIVED: directionColors,
    MULTI: {
      text: color.gray_900,
      background: color.gray_100,
      icon: color.gray_900,
      size: 50,
    },
    // All operation types now use direction-based colors
    WITHDRAWAL: directionColors,
    SWAP: directionColors,
    SMART_CONTRACT: directionColors,
    STAKE_REGISTRATION: directionColors,
    STAKE_DEREGISTRATION: directionColors,
    STAKE_DELEGATION: directionColors,
    STAKE_UNDELEGATION: directionColors,
    VOTE_DELEGATION: directionColors,
    MINT: directionColors,
    BURN: directionColors,
    NIGHT_REDEMPTION: directionColors,
  }
}

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
  | 'MINT'
  | 'BURN'
  | 'NIGHT_REDEMPTION'
