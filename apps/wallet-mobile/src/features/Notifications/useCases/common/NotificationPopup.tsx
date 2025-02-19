import {useTheme} from '@yoroi/theme'
import {Notifications} from '@yoroi/types'
import * as React from 'react'
import {StyleSheet, TouchableOpacity, View} from 'react-native'

import {Icon} from '../../../../components/Icon'
import {Text} from '../../../../components/Text'
import {useMetrics} from '../../../../kernel/metrics/metricsManager'
import {useWalletNavigation} from '../../../../kernel/navigation'
import {SwipeOutWrapper} from './SwipeOutWrapper'
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
      <SwipeOutWrapper onSwipeOut={handleOnSwipeOut} onExpired={onExpired} onPress={handleOnPress}>
        <NotificationItem
          onPress={handleOnPress}
          icon={<TransactionReceivedIcon />}
          title={strings.assetsReceived}
          description={strings.tapToView}
        />
      </SwipeOutWrapper>
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

const NotificationItem = ({
  onPress,
  icon,
  title,
  description,
}: {
  onPress: () => void
  icon: React.ReactNode
  title: string
  description: string
}) => {
  const {styles} = useStyles()
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {icon}

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>

        <Text style={styles.description}>{description}</Text>
      </View>
    </TouchableOpacity>
  )
}

const TransactionReceivedIcon = () => {
  const {styles, colors} = useStyles()
  return (
    <View style={[styles.icon, {backgroundColor: colors.iconBackground}]}>
      <Icon.Received color={colors.iconColor} />
    </View>
  )
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
  const {atoms, color, isLight} = useTheme()
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      height: 76,
      borderRadius: 6,
      ...atoms.p_lg,
      ...atoms.gap_lg,
      ...atoms.flex_row,
      ...atoms.border,
      backgroundColor: isLight ? color.bg_color_max : color.gray_100,
      borderColor: color.gray_50,
      shadowColor: isLight ? '#8A92A31A' : '#24283833',
      shadowOffset: {width: -1, height: 8},
      shadowOpacity: 1,
      shadowRadius: 20,
    },
    icon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      ...atoms.align_center,
      ...atoms.justify_center,
    },
    content: {
      ...atoms.flex_col,
      ...atoms.gap_xs,
    },
    title: {
      ...atoms.body_2_md_medium,
      ...atoms.font_semibold,
    },
    description: {
      ...atoms.link_2_md,
      color: color.gray_600,
    },
  })

  return {styles, colors: {iconColor: color.secondary_600, iconBackground: color.secondary_100}}
}
