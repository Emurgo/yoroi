import {useTheme} from '@yoroi/theme'
import {Notifications} from '@yoroi/types'
import * as React from 'react'
import {StyleSheet, View} from 'react-native'

import {Icon} from '../../../../components/Icon'
import {useMetrics} from '../../../../kernel/metrics/metricsManager'
import {useWalletNavigation} from '../../../../kernel/navigation'
import {NotificationItem} from './NotificationPopupItem'
import {SwipeOutWrapper} from './SwipeOutWrapper'
import {TransactionReceivedNotificationPopup} from './TransactionReceivedNotificationPopup'
import {useStrings} from './useStrings'

type Props = {
  event: Notifications.Event
  onPress: () => void
  onCancel: () => void
  onExpired: () => void
}

export const NotificationPopup = ({event, onPress, onCancel, onExpired}: Props) => {
  const navigation = useWalletNavigation()
  const strings = useStrings()

  const {track} = useMetrics()

  React.useEffect(() => {
    track.inAppNotificationViewed()
  }, [track])

  const handleOnSwipeOut = () => {
    onCancel()

    if (event.trigger === Notifications.Trigger.TransactionReceived) {
      track.inAppNotificationClosed({type: 'tx_received'})
    }

    if (event.trigger === Notifications.Trigger.RewardsUpdated) {
      track.inAppNotificationClosed({type: 'staking_rewards'})
    }
  }

  const handleOnPress = () => {
    onPress()

    if (event.trigger === Notifications.Trigger.TransactionReceived) {
      track.inAppNotificationOpened({type: 'tx_received'})
      navigation.navigateToTxHistory()
    }

    if (event.trigger === Notifications.Trigger.RewardsUpdated) {
      track.inAppNotificationOpened({type: 'staking_rewards'})
      navigation.navigateToStakingDashboard()
    }
  }

  if (event.trigger === Notifications.Trigger.TransactionReceived) {
    return (
      <TransactionReceivedNotificationPopup
        event={event}
        onPress={handleOnPress}
        onSwipeOut={handleOnSwipeOut}
        onExpired={onExpired}
      />
    )
  }

  if (event.trigger === Notifications.Trigger.RewardsUpdated) {
    return (
      <SwipeOutWrapper onSwipeOut={handleOnSwipeOut} onExpired={onExpired} onPress={handleOnPress}>
        <NotificationItem
          onPress={handleOnPress}
          icon={<RewardsUpdatedIcon />}
          title={strings.stakingRewardsReceived}
          description={strings.tapToView}
        />
      </SwipeOutWrapper>
    )
  }

  return null
}

const RewardsUpdatedIcon = () => {
  const {styles, colors} = useStyles()
  return (
    <View style={[styles.icon, {backgroundColor: colors.iconBackground}]}>
      <Icon.Staking color={colors.iconColor} />
    </View>
  )
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    icon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      ...atoms.align_center,
      ...atoms.justify_center,
    },
  })

  return {styles, colors: {iconColor: color.secondary_600, iconBackground: color.secondary_100}}
}
