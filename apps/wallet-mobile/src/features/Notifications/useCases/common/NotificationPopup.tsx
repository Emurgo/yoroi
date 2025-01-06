import {useTheme} from '@yoroi/theme'
import {Notifications} from '@yoroi/types'
import * as React from 'react'
import {useRef} from 'react'
import {Animated, Dimensions, PanResponder, StyleSheet, TouchableOpacity, View} from 'react-native'

import {Icon} from '../../../../components/Icon'
import {Text} from '../../../../components/Text'
import {useWalletNavigation} from '../../../../kernel/navigation'
import {useStrings} from './useStrings'

type Props = {
  event: Notifications.Event
  onPress: () => void
  onCancel: () => void
}

export const NotificationPopup = ({event, onPress, onCancel}: Props) => {
  const navigation = useWalletNavigation()
  const strings = useStrings()

  const {pan, panResponder} = usePanAnimation({onRelease: onCancel})

  if (event.trigger === Notifications.Trigger.TransactionReceived) {
    return (
      <NotificationItem
        onPress={() => {
          onPress()
          navigation.navigateToTxHistory()
        }}
        icon={<TransactionReceivedIcon />}
        title={strings.assetsReceived}
        description={strings.tapToView}
      />
    )
  }

  if (event.trigger === Notifications.Trigger.RewardsUpdated) {
    return (
      <Animated.View
        style={{
          transform: [{translateX: pan.x}],
        }}
        {...panResponder.panHandlers}
      >
        <NotificationItem
          onPress={() => {
            onPress()
            navigation.navigateToStakingDashboard()
          }}
          icon={<RewardsUpdatedIcon />}
          title={strings.stakingRewardsReceived}
          description={strings.tapToView}
        />
      </Animated.View>
    )
  }

  return null
}

const usePanAnimation = ({onRelease}: {onRelease: () => void}) => {
  const pan = useRef(new Animated.ValueXY()).current
  const screenWidth = Dimensions.get('window').width
  const screenLimitInPercentAfterWhichShouldRelease = 0.3

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        if (gestureState.dx > 0) {
          Animated.event([null, {dx: pan.x, dy: pan.y}], {useNativeDriver: false})(e, gestureState)
        }
      },
      onPanResponderRelease: (e, gestureState) => {
        if (gestureState.dx > screenWidth * screenLimitInPercentAfterWhichShouldRelease) {
          Animated.spring(pan, {
            toValue: {x: screenWidth, y: 0},
            useNativeDriver: false,
          }).start(() => onRelease())
        } else {
          Animated.spring(pan, {
            toValue: {x: 0, y: 0},
            useNativeDriver: false,
          }).start()
        }
      },
    }),
  ).current

  return {pan, panResponder}
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
