import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Text, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Button} from '~/ui/Button/Button'
import {useModal} from '~/ui/Modal/ModalContext'
import {Space} from '~/ui/Space/Space'

export const useOpenNetworkNoticeModal = () => {
  const {palette: p} = useTheme()
  const strings = useStrings()
  const {openModal, closeModal} = useModal()

  const openNetworkNoticeModal = React.useCallback(
    (onClose?: () => void) => {
      const handleClose = () => {
        closeModal()
        onClose?.()
      }

      openModal({
        title: strings.settings.changeNetwork.networkNoticeTitle,
        canDiscard: false,
        content: (
          <View style={[a.flex_1, a.px_lg]}>
            <Text style={[a.body_1_lg_regular, {color: p.gray_900}]}>
              {strings.settings.changeNetwork.networkNoticeMessage}
            </Text>

            <Space.Height.lg />

            <Text style={[a.body_1_lg_medium, {color: p.gray_900}]}>
              {strings.settings.changeNetwork.networkNoticeListTitle}
            </Text>

            <Text style={[a.body_1_lg_regular, {color: p.gray_900}]}>
              {strings.settings.changeNetwork.networkNoticeList}
            </Text>

            <Space.Height.sm fill />
          </View>
        ),
        footer: (
          <Button
            title={strings.settings.changeNetwork.networkNoticeButton}
            onPress={handleClose}
          />
        ),
        height: 450,
      })
    },
    [openModal, closeModal, strings, p.gray_900],
  )

  return openNetworkNoticeModal
}
