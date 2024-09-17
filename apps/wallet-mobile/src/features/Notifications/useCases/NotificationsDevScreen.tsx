import {Notification, Notifications} from '@jamsinclair/react-native-notifications'
import * as React from 'react'
import {useEffect} from 'react'
import {Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button} from '../../../components'

const useRequestPermissions = () => {
  useEffect(() => {
    Notifications.registerRemoteNotifications()
  }, [])
}

const useSendNotification = () => {
  useEffect(() => {
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

  const send = (title: string, body: string) => {
    Notifications.postLocalNotification({
      body,
      title,
      silent: false,
      category: 'SOME_CATEGORY',
      userInfo: {},
      fireDate: new Date(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
    // const notification = new Notification({
    //   title,
    //   body,
    //   sound: 'default',
    // })
    // Notifications.postLocalNotification(notification.payload)
  }
  return {send}
}

export const NotificationsDevScreen = () => {
  const {send} = useSendNotification()

  useRequestPermissions()

  const handleOnPress = () => {
    send('Random notification', 'This is a random notification')
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
