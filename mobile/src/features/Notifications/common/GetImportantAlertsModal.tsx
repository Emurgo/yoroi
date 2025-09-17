import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {InteractionManager, View, useWindowDimensions} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Button, ButtonType} from '~/ui/Button/Button'
import {useModal} from '~/ui/Modal/ModalContext'
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

  const handleTurnOnPress = async () => {
    await triggerNotificationsPermissionModal()

    InteractionManager.runAfterInteractions(() => onClose())
  }

  return (
    <View style={[a.flex_1, a.align_center]}>
      <View style={[a.py_lg]}>
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
    </View>
  )
}
