import * as React from 'react'
import {useEffect} from 'react'
import {Text, View} from 'react-native'
import {Notification, Notifications} from 'react-native-notifications'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button} from '../../../components'

export const NotificationsDevScreen = () => {
  useEffect(() => {
    Notifications.registerRemoteNotifications()

    const s = Notifications.events().registerNotificationReceivedForeground(
      (notification: Notification, completion) => {
        console.log(`Notification received in foreground: ${notification.title} : ${notification.body}`)
        completion({alert: true, sound: true, badge: true})
      },
    )

    return () => {
      s.remove()
    }
  }, [])

  const handleOnPress = () => {
    // const notification = new Notification({
    //   title: 'Test',
    //   body: 'Test',
    //   sound: 'default',
    // })
    // Notifications.postLocalNotification(notification.payload)

    let localNotification = Notifications.postLocalNotification({
      body: 'Local notification!',
      title: 'Local Notification Title',
      sound: 'chime.aiff',
      silent: false,
      category: 'SOME_CATEGORY',
      userInfo: {},
      fireDate: new Date(),
    } as any)

    console.log('Notification posted')
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
