import {Notifications} from '@yoroi/types'
import * as React from 'react'

import {TransactionReceivedNotification} from '../../features/Notifications/common/TransactionReceivedNotification'
import {SwipeOutWrapper} from '../SwipeOutWrapper/SwipeOutWrapper'

type Props = {
  event: Notifications.Event
  onPress: () => void
  onSwipeOut: () => void
  onExpired: () => void
}

export const TransactionReceivedNotificationPopup = ({
  event,
  onPress,
  onSwipeOut,
  onExpired,
}: Props) => {
  return (
    <SwipeOutWrapper
      onSwipeOut={onSwipeOut}
      onExpired={onExpired}
      onPress={onPress}
    >
      <TransactionReceivedNotification event={event} />
    </SwipeOutWrapper>
  )
}
