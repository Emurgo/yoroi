import {isString} from '@yoroi/common'
import {useNotificationManager} from '@yoroi/notifications'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Notifications} from '@yoroi/types'
import * as React from 'react'
import {View} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'
import {SafeAreaView} from 'react-native-safe-area-context'
import Svg, {ClipPath, Defs, G, Path, Rect} from 'react-native-svg'

import {triggerNotificationAction} from '~/features/Notifications/common/tools'
import {
  getTransactionReceivedNotificationIcon,
  getTransactionReceivedNotificationTitle,
} from '~/features/Notifications/common/TransactionReceivedNotification'
import {useWalletNotifications} from '~/features/Notifications/common/useWalletNotifications'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useLanguage} from '~/kernel/i18n'
import {useWalletNavigation} from '~/kernel/navigation'
import {Button, ButtonType} from '~/ui/Button/Button'
import {ScrollView} from '~/ui/ScrollView/ScrollView'
import {Text} from '~/ui/Text/Text'
import {useTransactionInfos} from '~/wallets/hooks'
import {useStrings} from '~/kernel/i18n/useStrings'
import {EmptyNotificationsIllustration} from '../illustrations/EmptyNotifications'

export const ViewNotificationHistoryScreen = () => {
  const {palette: p} = useTheme()
  const strings = useStrings()
  const {data: walletNotifications, refetch} = useWalletNotifications()
  const manager = useNotificationManager()
  const walletNavigation = useWalletNavigation()

  const handleMarkAllAsRead = async () => {
    await manager.events.markAllAsRead()
    refetch()
  }

  const handlePressNotification = async (id: number) => {
    await triggerNotificationAction({
      manager,
      id,
      walletNavigation,
      source: 'app',
    })
    refetch()
  }

  if (walletNotifications.length === 0) {
    return (
      <View
        style={[
          a.flex,
          a.justify_center,
          a.align_center,
          a.gap_sm,
          a.flex_grow,
        ]}
      >
        <EmptyNotificationsIllustration />

        <Text style={[a.heading_3_medium]}>{strings.noNotifications}</Text>
      </View>
    )
  }

  return (
    <SafeAreaView
      style={[a.px_lg, a.flex, {flex: 1, position: 'relative'}]}
      edges={['right', 'left', 'bottom']}
    >
      <ScrollView contentContainerStyle={{paddingBottom: 60}}>
        <View style={[a.gap_lg, a.flex]}>
          {walletNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              event={notification}
              onPress={() => handlePressNotification(notification.id)}
            />
          ))}
        </View>
      </ScrollView>

      <View
        style={[
          a.absolute,
          {bottom: 0, left: 0, right: 0, height: 60},
          a.align_center,
          a.justify_center,
          {zIndex: 10, backgroundColor: p.bg_color_max},
        ]}
      >
        <Button
          style={[a.flex, a.justify_center, a.align_center]}
          title={strings.markAllAsRead}
          onPress={handleMarkAllAsRead}
          type={ButtonType.Text}
        />
      </View>
    </SafeAreaView>
  )
}

const NotificationItem = React.memo(
  ({event, onPress}: {event: Notifications.Event; onPress?: () => void}) => {
    const {palette: p} = useTheme()
    const {languageCode} = useLanguage()
    const {wallet} = useSelectedWallet()
    const strings = useStrings()
    const transactionInfos = useTransactionInfos({wallet})

    const isUnread = !event.isRead

    const description =
      event.trigger === Notifications.Trigger.Push ||
      event.trigger === Notifications.Trigger.Banner
        ? event.metadata.body
        : null
    const time = React.useMemo(
      () => formatDate(event.date, languageCode),
      [event.date, languageCode],
    )

    const title =
      event.trigger === Notifications.Trigger.TransactionReceived
        ? getTransactionReceivedNotificationTitle(
            event,
            strings,
            transactionInfos,
            wallet,
          )
        : event.trigger === Notifications.Trigger.Push ||
            event.trigger === Notifications.Trigger.Banner
          ? event.metadata.title
          : event.id

    const icon =
      event.trigger === Notifications.Trigger.TransactionReceived ? (
        getTransactionReceivedNotificationIcon(event, transactionInfos)
      ) : (
        <IconPlaceholder />
      )

    return (
      <TouchableOpacity style={[a.gap_sm, a.flex_row]} onPress={onPress}>
        <View style={[a.gap_sm, a.flex_row, {flexGrow: 1}]}>
          <View style={[{width: 40, height: 40}, a.rounded_full]}>{icon}</View>

          <View style={[a.flex_col, a.flex_grow]}>
            <View
              style={[
                a.flex_1,
                a.flex_row,
                a.justify_between,
                a.align_center,
                a.gap_sm,
              ]}
            >
              <Text
                style={[
                  a.body_2_md_medium,
                  a.flex_1,
                  {color: p.text_gray_medium},
                ]}
              >
                {title}
              </Text>

              <View
                style={[
                  {width: 8, height: 8},
                  a.flex_row,
                  a.justify_center,
                  a.align_center,
                ]}
              >
                {isUnread && (
                  <View
                    style={[
                      {backgroundColor: p.red_static},
                      a.rounded_full,
                      {width: 8, height: 8},
                    ]}
                  />
                )}
              </View>
            </View>

            {isString(description) && (
              <View style={[a.flex_1, a.flex_row]}>
                <Text
                  style={[
                    a.body_3_sm_regular,
                    a.flex_1,
                    {color: p.text_gray_medium},
                  ]}
                >
                  {description}
                </Text>
              </View>
            )}

            <View style={[a.flex_1, a.flex_row]}>
              <Text
                style={[
                  a.body_3_sm_regular,
                  a.flex_1,
                  {color: p.text_gray_low},
                ]}
              >
                {time}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    )
  },
)

const formatDate = (date: string, languageCode: string) => {
  return new Date(date).toLocaleString(languageCode, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const IconPlaceholder = () => {
  return (
    <Svg width={40} height={40} viewBox="0 0 40 40" fill="none">
      <G clipPath="url(#clip0_1107_1973)">
        <Path
          d="M0 8a8 8 0 018-8h24a8 8 0 018 8v24a8 8 0 01-8 8H8a8 8 0 01-8-8V8z"
          fill="#E4E8F7"
        />

        <Path
          d="M22.195 14.347c-.354.255-.708.506-1.062.756-.354.25-.708.5-1.062.756-.098.065-.16.074-.257 0-.867-.63-1.743-1.261-2.62-1.892-.91-.677-1.822-1.354-2.743-2.021l-1.3-.946H10l.248.182.195.143c.411.296.822.595 1.234.894.412.3.823.598 1.235.895l2.442 1.78a1056.127 1056.127 0 012.292 1.679l.843.609c.448.323.897.646 1.343.976.08.056.133.056.212 0 .334-.244.671-.482 1.01-.72.253-.18.506-.358.76-.54 1.451-1.049 2.903-2.096 4.354-3.135 1.053-.76 2.115-1.52 3.168-2.272.142-.1.28-.2.42-.304L30 11.01h-3.16c-.821.586-1.64 1.177-2.462 1.769-.725.523-1.453 1.047-2.183 1.57zM12.069 15.32v2.262c0 .019 0 .038.009.047 2.312 1.698 4.615 3.395 6.918 5.093l.002.001c1.535 1.133 3.071 2.265 4.61 3.397l1.564-1.155A8984.44 8984.44 0 0112.07 15.32zM12.075 21.11a.217.217 0 00.012-.03c3.21 2.252 6.41 4.495 9.637 6.757L20.097 29h-.01a6473.75 6473.75 0 00-3.067-2.152c-1.65-1.157-3.296-2.312-4.942-3.47 0-.009-.002-.016-.005-.023a.069.069 0 01-.004-.023v-2.206c0-.004.002-.01.006-.016zM27.233 15.32c-1.127.805-2.245 1.606-3.361 2.406l-2.148 1.539a.562.562 0 00.059.07l.698.508.698.508c.009.009.034.009.05.009l1.482-1.058c.836-.598 1.673-1.197 2.514-1.792.004-.005.006-.011.008-.018a.043.043 0 01.008-.017V15.32h-.008zM26.5 20.933l.741-.573v2.52l-.462.36c-.53-.423-1.059-.847-1.607-1.281.444-.341.885-.682 1.328-1.026z"
          fill="#3154CB"
        />
      </G>

      <Defs>
        <ClipPath id="clip0_1107_1973">
          <Rect width={40} height={40} rx={20} fill="#fff" />
        </ClipPath>
      </Defs>
    </Svg>
  )
}
