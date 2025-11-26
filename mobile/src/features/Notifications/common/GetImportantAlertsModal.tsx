import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {AppState, View, useWindowDimensions} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Button, ButtonType} from '~/ui/Button/Button'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'
import {PhoneBell} from '~/ui/PhoneBellIllustration/PhoneBellIllustration'
import {Space} from '~/ui/Space/Space'
import {Text} from '~/ui/Text/Text'

import {uiStorage} from './storage'
import {triggerNotificationsPermissionModal} from './tools'

const timeToShowModalInMs = 1000
const modalStorageKey = 'hasShownGetImportantAlertsModal'

export const useGetImportantAlertsModal = ({enabled}: {enabled: boolean}) => {
  const {openModal, closeModal} = useModal()
  const {height: windowHeight} = useWindowDimensions()
  const strings = useStrings()

  React.useEffect(() => {
    if (!enabled) return

    const timeout = setTimeout(async () => {
      const hasShownModal = (await uiStorage.getItem(modalStorageKey)) === true
      if (hasShownModal) return

      openModal({
        title: strings.notifications.getImportantAlerts,
        content: <GetImportantAlertsModal onClose={closeModal} />,
        height: Math.min(windowHeight * 0.9, 520),
      })
      await uiStorage.setItem(modalStorageKey, true)
    }, timeToShowModalInMs)

    return () => clearTimeout(timeout)
  }, [openModal, strings, windowHeight, enabled, closeModal])
}

type GetImportantAlertsModalProps = {
  onClose: () => void
}

export const GetImportantAlertsModal = ({
  onClose,
}: GetImportantAlertsModalProps) => {
  const strings = useStrings()
  const {palette: p} = useTheme()
  const appStateRef = React.useRef(AppState.currentState)
  const hasClosedRef = React.useRef(false)

  // Listen for app state changes to detect when user returns from OS permission dialog
  React.useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      // When app comes back to foreground after permission dialog
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        !hasClosedRef.current
      ) {
        // Close modal after a short delay to ensure OS dialog has fully closed
        setTimeout(() => {
          if (!hasClosedRef.current) {
            hasClosedRef.current = true
            onClose()
          }
        }, 300)
      }
      appStateRef.current = nextAppState
    })

    return () => {
      subscription.remove()
    }
  }, [onClose])

  const handleTurnOnPress = async () => {
    const initialAppState = AppState.currentState
    appStateRef.current = initialAppState

    await triggerNotificationsPermissionModal()

    // Check if app state changed (OS dialog was shown)
    const currentAppState = AppState.currentState
    const osDialogWasShown = initialAppState !== currentAppState

    if (!osDialogWasShown) {
      // No OS dialog was shown (permission already granted or denied)
      // Close modal immediately
      hasClosedRef.current = true
      onClose()
    }
    // If OS dialog was shown, the app state listener will handle closing
  }

  return (
    <Modal.Content style={[a.align_center]}>
      <View style={[a.self_stretch, a.align_center, a.py_lg]}>
        <PhoneBell />
      </View>

      <Text
        style={[
          a.body_1_lg_regular,
          a.pt_lg,
          a.pb_sm,
          a.text_center,
          {color: p.text_gray_medium},
        ]}
      >
        {strings.notifications.turnOnAlerts}
      </Text>

      <Space.Height._2xs fill />

      <Button
        size="M"
        title={strings.notifications.skip}
        onPress={onClose}
        type={ButtonType.Text}
        style={[a.flex_1, a.self_stretch, {flexGrow: 0}]}
      />

      <Button
        size="M"
        title={strings.notifications.turnOnNotifications}
        onPress={handleTurnOnPress}
        style={[a.flex_1, a.self_stretch, {flexGrow: 0}]}
      />
    </Modal.Content>
  )
}
