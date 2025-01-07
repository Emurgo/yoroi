import {useTheme} from '@yoroi/theme'
import {Notifications} from '@yoroi/types'
import * as React from 'react'
import {StyleSheet, TouchableOpacity, View} from 'react-native'

import {Icon} from '../../../../components/Icon'
import {Text} from '../../../../components/Text'
import {useWalletNavigation} from '../../../../kernel/navigation'
import {SwipeOutWrapper} from './SwipeOutWrapper'
import {useStrings} from './useStrings'

type Props = {
  event: Notifications.Event
  onPress: () => void
  onCancel: () => void
}

export const NotificationPopup = ({event, onPress, onCancel}: Props) => {
  const navigation = useWalletNavigation()
  const strings = useStrings()

  if (event.trigger === Notifications.Trigger.TransactionReceived) {
    return (
      <SwipeOutWrapper onSwipeOut={onCancel}>
        <NotificationItem
          onPress={() => {
            onPress()
            navigation.navigateToTxHistory()
          }}
          icon={<TransactionReceivedIcon />}
          title={strings.assetsReceived}
          description={strings.tapToView}
        />
      </SwipeOutWrapper>
    )
  }

  if (event.trigger === Notifications.Trigger.RewardsUpdated) {
    return (
      <SwipeOutWrapper onSwipeOut={onCancel}>
        <NotificationItem
          onPress={() => {
            onPress()
            navigation.navigateToStakingDashboard()
          }}
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
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      height: 76,
      borderRadius: 6,
      ...atoms.p_lg,
      ...atoms.gap_lg,
      ...atoms.flex_row,
      backgroundColor: color.bg_color_max,
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
      ...atoms.body_2_md_regular,
      ...atoms.font_semibold,
    },
    description: {
      ...atoms.link_2_md,
      color: color.gray_600,
    },
  })

  return {styles, colors: {iconColor: color.secondary_600, iconBackground: color.secondary_100}}
}
