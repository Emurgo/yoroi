import {useNavigation} from '@react-navigation/native'
import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {TouchableOpacity, View} from 'react-native'

// import {TxHistoryRouteNavigation} from '~/kernel/navigation/navigation'
import {Icon} from '~/ui/Icon'
//import {useWalletNotifications} from '../Notifications/common/useWalletNotifications'

export const HeaderRightHistory = React.memo(() => {
  const navigation = useNavigation<any /* TxHistoryRouteNavigation */>()
  const {palette: p} = useTheme()
  // const {data: walletNotifications} = useWalletNotifications()

  /*  const isBellActive = React.useMemo(
    () => walletNotifications.some((n) => !n.isRead),
    [walletNotifications],
  )
 */
  return (
    <View style={[a.pr_sm, a.gap_md, a.flex_row]}>
      <TouchableOpacity
        style={a.relative}
        onPress={() => navigation.navigate('notification-center-history')}
      >
        <Icon.Bell color={p.gray_max} size={24} />

        {/* {isBellActive && (
          <View
            style={[
              a.absolute,
              {
                backgroundColor: p.red_static,
                top: 2,
                right: 4,
                width: 6,
                height: 6,
              },
              a.rounded_full,
            ]}
          />
        )} */}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() =>
          navigation.navigate('scan-start', {insideFeature: 'scan'})
        }
      >
        <Icon.Qr color={p.gray_max} size={24} />
      </TouchableOpacity>
    </View>
  )
})
