import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {Image, StyleSheet, View} from 'react-native'
import Markdown from 'react-native-easy-markdown'

import image from '../../assets/img/mnemonic_explanation.png'
import {Button, Modal} from '../../components'
import {spacing} from '../../theme'

type Props = {
  onConfirm: () => void
  visible: boolean
  onRequestClose: () => void
}

export const MnemonicExplanationModal = ({onConfirm, onRequestClose, visible}: Props) => {
  const strings = useStrings()

  return (
    <Modal onRequestClose={onRequestClose} visible={visible} showCloseIcon>
      <View style={styles.imageContainer}>
        <Image source={image} />
      </View>

      <View style={styles.paragraph}>
        <Markdown>{strings.paragraph1}</Markdown>
      </View>

      <View style={styles.paragraph}>
        <Markdown>{strings.paragraph2}</Markdown>
      </View>

      <Button onPress={onConfirm} title={strings.nextButton} testID="mnemonicExplanationModal" />
    </Modal>
  )
}

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

const useStrings = () => {
  const intl = useIntl()

  return {
    paragraph1: intl.formatMessage(messages.paragraph1),
    paragraph2: intl.formatMessage(messages.paragraph2),
    nextButton: intl.formatMessage(messages.nextButton),
  }
}

const styles = StyleSheet.create({
  paragraph: {
    marginBottom: spacing.paragraphBottomMargin,
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.paragraphBottomMargin,
  },
})
