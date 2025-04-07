import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {InteractionManager, StyleSheet, useWindowDimensions, View} from 'react-native'
import {Notifications} from 'react-native-notifications'

import {Button, ButtonType} from '../../../components/Button/Button'
import {useModal} from '../../../components/Modal/ModalContext'
import {Text} from '../../../components/Text'
import {PhoneBell} from '../illustrations/PhoneBell'
import {uiStorage} from './storage'
import {useStrings} from './useStrings'

export const useGetImportantAlertsModal = () => {
  const {openModal} = useModal()
  const {height: windowHeight} = useWindowDimensions()
  const strings = useStrings()

  React.useEffect(() => {
    const timeout = setTimeout(async () => {
      const hasShownModal = (await uiStorage.getItem('hasShownGetImportantAlertsModal')) === true
      if (hasShownModal) return

      openModal({
        title: strings.getImportantAlerts,
        content: <GetImportantAlertsModal />,
        height: windowHeight * 0.6,
      })
      await uiStorage.setItem('hasShownGetImportantAlertsModal', true)
    }, 1000)
    return () => {
      clearTimeout(timeout)
    }
  }, [openModal, strings, windowHeight])
}

export const GetImportantAlertsModal = () => {
  const {styles} = useStyles()
  const strings = useStrings()
  const {closeModal} = useModal()

  const handleTurnOnPress = () => {
    Notifications.registerRemoteNotifications({})
    InteractionManager.runAfterInteractions(() => closeModal())
  }

  const handleCancelPress = () => {
    closeModal()
  }

  return (
    <View style={styles.root}>
      <PhoneBell />

      <Text style={styles.text}>{strings.turnOnAlerts}</Text>

      <Button size="M" title={strings.skip} onPress={handleCancelPress} type={ButtonType.Text} />

      <Button size="M" title={strings.turnOnNotifications} onPress={handleTurnOnPress} style={styles.button} />
    </View>
  )
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
