import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {InteractionManager, Text, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Button, ButtonType} from '~/ui/Button/Button'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'

const NotificationsScheduledModalContent = ({
  scheduled,
  skipped,
}: {
  scheduled: number
  skipped: number
}) => {
  const strings = useStrings()
  const {atoms: ta} = useTheme()

  const message =
    scheduled > 0
      ? strings.airdrop.notificationsScheduledBody
          .replace('{scheduled}', scheduled.toString())
          .replace('{skipped}', skipped.toString())
      : strings.airdrop.allNotificationsAlreadyScheduled

  return (
    <Modal.Content>
      <View style={[a.px_lg, a.pb_lg]}>
        <Text style={[a.body_1_lg_regular, ta.text_gray_max]}>{message}</Text>
      </View>
    </Modal.Content>
  )
}

const NotificationsScheduledModalFooter = ({
  onViewNotifications,
}: {
  onViewNotifications: () => void
}) => {
  const strings = useStrings()
  const {closeModal} = useModal()

  const handleViewNotifications = React.useCallback(() => {
    closeModal()
    // Use InteractionManager to ensure navigation happens after modal closes
    InteractionManager.runAfterInteractions(() => {
      onViewNotifications()
    })
  }, [closeModal, onViewNotifications])

  return (
    <Modal.Footer>
      <View style={[a.flex_row, a.gap_md]}>
        <Button
          type={ButtonType.Secondary}
          title={strings.global.close}
          onPress={closeModal}
        />
        <Button
          type={ButtonType.Primary}
          title={strings.airdrop.viewNotifications}
          onPress={handleViewNotifications}
        />
      </View>
    </Modal.Footer>
  )
}

export const NotificationsScheduledModal = {
  Content: NotificationsScheduledModalContent,
  Footer: NotificationsScheduledModalFooter,
}
