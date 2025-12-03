import {useLinks} from '@yoroi/links'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Links} from '@yoroi/types'

import * as React from 'react'
import {Text, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Button, ButtonType} from '~/ui/Button/Button'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'
import {isEmptyString} from '@yoroi/cardano-wallet/utils/string'

import {ShowDisclaimer} from '../shared/ShowDisclaimer/ShowDisclaimer'

const RequestedBrowserLaunchDappUrlModalContent = ({
  params,
  isTrusted,
}: {
  params: Links.BrowserLaunchDappUrlParams
  isTrusted?: boolean
}) => {
  const strings = useStrings()
  const {atoms: ta} = useTheme()

  const description = isTrusted
    ? strings.links.trustedBrowserLaunchDappUrlDescription
    : strings.links.untrustedBrowserLaunchDappUrlDescription

  return (
    <Modal.Content style={[a.gap_lg]}>
      <ShowDisclaimer title={strings.global.disclaimer}>
        <Text style={[a.body_2_md_regular, ta.text_gray_max]}>
          {description}
        </Text>
      </ShowDisclaimer>

      <Message message={params.message} />
    </Modal.Content>
  )
}

const RequestedBrowserLaunchDappUrlModalFooter = ({
  onContinue,
}: {
  onContinue: () => void
}) => {
  const strings = useStrings()
  const {markActionProcessed} = useLinks()
  const {closeModal} = useModal()

  const handleOnCancel = () => {
    markActionProcessed()
    closeModal()
  }

  const handleOnContinue = () => {
    onContinue()
    // Clear action after navigation
    markActionProcessed()
  }

  return (
    <Modal.Footer>
      <Button
        size="S"
        type={ButtonType.Secondary}
        onPress={handleOnCancel}
        title={strings.global.cancel}
      />

      <Button
        size="S"
        type={ButtonType.Primary}
        onPress={handleOnContinue}
        title={strings.global.proceed}
      />
    </Modal.Footer>
  )
}

const Message = ({message}: {message?: string}) => {
  const {atoms: ta} = useTheme()

  if (isEmptyString(message)) {
    return null
  }

  return (
    <View style={[a.p_lg, a.rounded_sm, ta.bg_color_min]}>
      <Text style={[a.body_2_md_regular, ta.text_gray_max]}>{message}</Text>
    </View>
  )
}

export const RequestedBrowserLaunchDappUrlModal = {
  Content: RequestedBrowserLaunchDappUrlModalContent,
  Footer: RequestedBrowserLaunchDappUrlModalFooter,
}
