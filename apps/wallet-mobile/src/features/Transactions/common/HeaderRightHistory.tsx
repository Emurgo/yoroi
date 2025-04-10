import {useNavigation} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import React from 'react'
import {StyleSheet, TouchableOpacity, View} from 'react-native'

import {Icon} from '../../../components/Icon'
import {TxHistoryRouteNavigation} from '../../../kernel/navigation'
import {useWalletNotifications} from '../../Notifications/common/useWalletNotifications'

export const HeaderRightHistory = React.memo(() => {
  const navigation = useNavigation<TxHistoryRouteNavigation>()
  const {color} = useTheme()
  const {styles} = useStyles()
  const {data: walletNotifications} = useWalletNotifications()

  const isBellActive = React.useMemo(() => walletNotifications.some((n) => !n.isRead), [walletNotifications])

  return (
    <View style={styles.root}>
      <TouchableOpacity style={styles.bellIcon} onPress={() => navigation.navigate('notification-center-history')}>
        <Icon.Bell color={color.gray_max} size={24} />

        {isBellActive && <View style={styles.bellDot} />}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('scan-start', {insideFeature: 'scan'})}>
        <Icon.Qr color={color.gray_max} size={24} />
      </TouchableOpacity>
    </View>
  )
})

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.pr_sm,
      ...atoms.gap_md,
      ...atoms.flex_row,
    },
    bellIcon: {
      ...atoms.relative,
    },
    bellDot: {
      ...atoms.absolute,
      backgroundColor: color.red_static,
      ...atoms.rounded_full,
      top: 2,
      right: 4,
      width: 6,
      height: 6,
    },
  })
  return {styles}
}
