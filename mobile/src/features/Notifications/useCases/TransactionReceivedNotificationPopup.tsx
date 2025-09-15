import {Notifications} from '@yoroi/types'

import * as React from 'react'

import {SwipeOutWrapper} from '~/ui/SwipeOutWrapper/SwipeOutWrapper'

import {TransactionReceivedNotification} from '../common/TransactionReceivedNotification'

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
