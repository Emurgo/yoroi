// @flow

import React, {memo} from 'react'
import {View} from 'react-native'

import ReceivedIcon from '../../assets/ReceivedIcon'
import SentIcon from '../../assets/SentIcon'
// TODO: check with @vicente
// import StakingKeyRegisteredIcon from '../../assets/StakingKeyRegisteredIcon'
// import StakingKeyDeregisteredIcon from '../../assets/StakingKeyDeregisteredIcon'
// import DelegatedIcon from '../../assets/DelegatedIcon'
// import RewardWithdrawnIcon from '../../assets/RewardWithdrawnIcon'
import RewardManuallyPayoutIcon from '../../assets/RewardManuallyPayoutIcon'

import useStyles from './styles/TxIcon.style'

import type {TransactionInfo} from '../../types/HistoryTransaction'

const ICON: $ReadOnly<Dict<any>> = Object.freeze({
  SENT: SentIcon,
  RECEIVED: ReceivedIcon,
  SELF: RewardManuallyPayoutIcon,
  MULTI: RewardManuallyPayoutIcon,
})

const SIZE = 36
const COLORS: $ReadOnly<Dict<any>> = Object.freeze({
  PENDING: {
    background: '#F0F3F5',
    icon: '#6B7384',
  },
  NORMAL: {
    background: '#EAEDF2',
    icon: '#6B7384',
  },
  DIRECT_CREDIT: {
    background: 'rgba(23, 209, 170, 0.1)',
    icon: '#17D1AA',
  },
})
type Status = $Keys<typeof COLORS>

type Props = {|
  transaction: $ReadOnly<TransactionInfo>,
|}

const TxIcon = ({transaction}: Props) => {
  const {direction, assurance, status} = transaction
  const IconComponent = ICON[direction]
  const isPending = assurance === 'PENDING' || status === 'PENDING'
  const isReceived = direction === 'RECEIVED'
  const isDirectCredit = isReceived
  const theme: Status = isPending
    ? 'PENDING'
    : isDirectCredit
      ? 'DIRECT_CREDIT'
      : 'NORMAL'
  const color = COLORS[theme]
  const styles = useStyles({size: SIZE, color: color.background})
  return (
    <View style={styles.container}>
      <IconComponent color={color.icon} width={SIZE} height={SIZE} />
    </View>
  )
}

export default memo<Props>(TxIcon)
