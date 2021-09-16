// @flow

import React from 'react'
import {View, Image} from 'react-native'
import {useIntl, defineMessages} from 'react-intl'
import Markdown from 'react-native-easy-markdown'

import {Button, Modal} from '../../UiKit'

import styles from './styles/MnemonicExplanationModal.style'

import image from '../../../assets/img/mnemonic_explanation.png'

const messages = defineMessages({
  paragraph1: {
    id: 'components.walletinit.createwallet.mnemonicexplanationmodal.paragraph1',
    defaultMessage:
      '!!!On the following screen, you will see a set of 15 random words. ' +
      'This is your **wallet recovery phrase**. It can be entered in any version ' +
      'of Yoroi in order to back up or restore your wallet`s funds and private key.',
  },
  paragraph2: {
    id: 'components.walletinit.createwallet.mnemonicexplanationmodal.paragraph2',
    defaultMessage: '!!!Make sure **nobody looks into your screen** unless you want them to have access to your funds.',
  },
  nextButton: {
    id: 'components.walletinit.createwallet.mnemonicexplanationmodal.nextButton',
    defaultMessage: '!!!I understand',
  },
})

type Props = {
  onConfirm: () => any,
  visible: boolean,
  onRequestClose: () => any,
}

const MnemonicExplanationModal = ({onConfirm, onRequestClose, visible}: Props) => {
  const intl = useIntl()

  return (
    <Modal onRequestClose={onRequestClose} visible={visible} showCloseIcon>
      <View style={styles.imageContainer}>
        <Image source={image} />
      </View>

      <View style={styles.paragraph}>
        <Markdown>{intl.formatMessage(messages.paragraph1)}</Markdown>
      </View>

      <View style={styles.paragraph}>
        <Markdown>{intl.formatMessage(messages.paragraph2)}</Markdown>
      </View>

      <Button onPress={onConfirm} title={intl.formatMessage(messages.nextButton)} testID="mnemonicExplanationModal" />
    </Modal>
  )
}

export default MnemonicExplanationModal
