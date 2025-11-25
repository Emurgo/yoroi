import {useLinks} from '@yoroi/links'
import {atoms as a, useTheme} from '@yoroi/theme'

import * as React from 'react'
import {Text} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Button, ButtonType} from '~/ui/Button/Button'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'

const AskToOpenWalletModalContent = () => {
  const strings = useStrings()
  const {atoms: ta} = useTheme()

  return (
    <Modal.Content style={[a.gap_lg]}>
      <Text style={[a.body_2_md_regular, ta.text_gray_max]}>
        {strings.links.askToOpenAWalletDescription}
      </Text>
    </Modal.Content>
  )
}

const AskToOpenWalletModalFooter = () => {
  const strings = useStrings()
  const {closeModal} = useModal()
  const {markActionProcessed} = useLinks()

  const handleOnCancel = () => {
    markActionProcessed()
    closeModal()
  }

  return (
    <Modal.Footer>
      <Button
        size="S"
        type={ButtonType.Secondary}
        onPress={handleOnCancel}
        title={strings.global.cancel}
      />

      <Button size="S" onPress={closeModal} title={strings.global.ok} />
    </Modal.Footer>
  )
}

export const AskToOpenWalletModal = {
  Content: AskToOpenWalletModalContent,
  Footer: AskToOpenWalletModalFooter,
}
