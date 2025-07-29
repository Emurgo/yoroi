import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {InteractionManager, useWindowDimensions, View} from 'react-native'

import {Button, ButtonType} from '~/ui/Button/Button'
import {useModal} from '~/ui/Modal/ModalContext'
import {PhoneBell} from '~/ui/PhoneBellIllustration/PhoneBellIllustration'
import {Space} from '~/ui/Space/Space'
import {Text} from '~/ui/Text/Text'
import {uiStorage} from './storage'
import {triggerNotificationsPermissionModal} from './tools'
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
        height: 520,
      })
      await uiStorage.setItem(modalStorageKey, true)
    }, timeToShowModalInMs)

    return () => clearTimeout(timeout)
  }, [openModal, strings, windowHeight, enabled])
}

export const GetImportantAlertsModal = () => {
  const strings = useStrings()
  const {closeModal} = useModal()
  const {palette: p} = useTheme()

  const handleTurnOnPress = async () => {
    await triggerNotificationsPermissionModal()

    InteractionManager.runAfterInteractions(() => closeModal())
  }

  return (
    <View style={[a.px_lg, a.flex_1, a.align_center]}>
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
        {strings.turnOnAlerts}
      </Text>

      <Space.Height._2xs fill />

      <Button
        size="M"
        title={strings.skip}
        onPress={closeModal}
        type={ButtonType.Text}
        style={[a.flex_1, a.self_stretch, {flexGrow: 0}]}
      />

      <Button
        size="M"
        title={strings.turnOnNotifications}
        onPress={handleTurnOnPress}
        style={[a.flex_1, a.self_stretch, {flexGrow: 0}]}
      />
    </View>
  )
}
