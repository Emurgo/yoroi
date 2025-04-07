import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {InteractionManager, PermissionsAndroid, Platform, StyleSheet, useWindowDimensions, View} from 'react-native'
import {Notifications} from 'react-native-notifications'

import {Button, ButtonType} from '../../../components/Button/Button'
import {useModal} from '../../../components/Modal/ModalContext'
import {Text} from '../../../components/Text'
import {PhoneBell} from '../illustrations/PhoneBell'
import {uiStorage} from './storage'
import {useStrings} from './useStrings'

const timeToShowModalInMs = 1000
const modalStorageKey = 'hasShownGetImportantAlertsModal'

export const useGetImportantAlertsModal = ({enabled}: {enabled: boolean}) => {
  const {openModal} = useModal()
  const {height: windowHeight} = useWindowDimensions()
  const strings = useStrings()

  React.useEffect(() => {
    if (!enabled) return

    const timeout = setTimeout(async () => {
      const hasShownModal = (await uiStorage.getItem(modalStorageKey)) === true
      if (hasShownModal) return

      openModal({
        title: strings.getImportantAlerts,
        content: <GetImportantAlertsModal />,
        height: windowHeight * 0.6,
      })
      await uiStorage.setItem(modalStorageKey, true)
    }, timeToShowModalInMs)

    return () => clearTimeout(timeout)
  }, [openModal, strings, windowHeight, enabled])
}

export const GetImportantAlertsModal = () => {
  const {styles} = useStyles()
  const strings = useStrings()
  const {closeModal} = useModal()

  const handleTurnOnPress = async () => {
    await triggerNotificationsPermissionModal()

    InteractionManager.runAfterInteractions(() => closeModal())
  }

  return (
    <View style={styles.root}>
      <PhoneBell />

      <Text style={styles.text}>{strings.turnOnAlerts}</Text>

      <Button size="M" title={strings.skip} onPress={closeModal} type={ButtonType.Text} />

      <Button size="M" title={strings.turnOnNotifications} onPress={handleTurnOnPress} style={styles.button} />
    </View>
  )
}

const triggerNotificationsPermissionModal = async () => {
  // Triggers iOS permission request
  Notifications.registerRemoteNotifications({})

  // Android requires manual permission request
  if (Platform.OS === 'android') {
    await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS)
  }
}

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      ...atoms.align_center,
      ...atoms.px_lg,
    },
    button: {
      ...atoms.flex_1,
      ...atoms.self_stretch,
    },
    text: {
      ...atoms.body_1_lg_regular,
      color: color.text_gray_medium,
      ...atoms.pt_lg,
      ...atoms.pb_sm,
    },
  })
  return {styles}
}
