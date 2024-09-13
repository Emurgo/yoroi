import {Text, View} from 'react-native'
import * as React from 'react'
import {SafeAreaView} from 'react-native-safe-area-context'
import {Button} from '../../../components'
import {useEffect} from 'react'
import {Notifications, Notification} from 'react-native-notifications'

export const NotificationsDevScreen = () => {
  useEffect(() => {
    Notifications.registerRemoteNotifications()

    const s = Notifications.events().registerNotificationReceivedForeground(
      (notification: Notification, completion) => {
        console.log(`Notification received in foreground: ${notification.title} : ${notification.body}`)
        completion({alert: true, sound: false, badge: false})
      },
    )

    return () => {
      s.remove()
    }
  }, [])

  const handleOnPress = () => {
    const notification = new Notification({
      title: 'Test',
      body: 'Test',
      sound: 'default',
    })
    Notifications.postLocalNotification(notification.payload)
  }

  return (
    <SafeAreaView edges={['bottom', 'top', 'left', 'right']}>
      <View style={{padding: 16}}>
        <Text style={{fontSize: 24}}>Notifications Playground</Text>
        <Button title="Show random notification" shelleyTheme onPress={handleOnPress} />
      </View>
    </SafeAreaView>
  )
}
