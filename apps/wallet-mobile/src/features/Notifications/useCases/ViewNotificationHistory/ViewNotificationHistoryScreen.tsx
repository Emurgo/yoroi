import {StyleSheet, View} from 'react-native'
import * as React from 'react'
import {useTheme} from '@yoroi/theme'
import {useReceivedNotificationEvents} from '@yoroi/notifications'
import {Notifications} from '@yoroi/types'
import {Text} from '../../../../components/Text'
import {ScrollView} from '../../../../components/ScrollView/ScrollView'

export const ViewNotificationHistoryScreen = () => {
  const {styles} = useStyles()
  const {data: receivedNotifications = []} = useReceivedNotificationEvents()

  return (
    <ScrollView style={styles.root}>
      {receivedNotifications.map((notification) => (
        <NotificationItem key={notification.id} event={notification} />
      ))}
    </ScrollView>
  )
}

const NotificationItem = ({event}: {event: Notifications.Event}) => {
  const {styles} = useStyles()
  return (
    <View style={styles.item}>
      <View></View>
      <View>
        <Text>{event.id}</Text>
      </View>
      <View></View>
    </View>
  )
}

const useStyles = () => {
  const {atoms} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.gap_lg,
      ...atoms.flex_col,
    },
    item: {
      ...atoms.gap_sm,
      ...atoms.flex_row,
    },
  })
  return {styles}
}
