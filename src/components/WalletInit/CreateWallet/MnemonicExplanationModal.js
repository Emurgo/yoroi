// @flow

import React from 'react'
import {compose} from 'redux'
import {View, Image} from 'react-native'

import {withTranslations} from '../../../utils/renderUtils'
import {renderFormattedText} from '../../../utils/textRendering'
import {Button, Modal} from '../../UiKit'

import styles from './styles/MnemonicExplanationModal.style'

import type {State} from '../../../state'
import type {ComponentType} from 'react'

import image from '../../../assets/img/mnemonic_explanation.png'

const getTranslations = (state: State) => state.trans.MnemonicExplanationModal

type ExternalProps = {
  onConfirm: () => any,
  visible: boolean,
  onRequestClose: () => any,
}

const MnemonicExplanationModal = ({
  onConfirm,
  translations,
  onRequestClose,
  visible,
}) => (
  <Modal onRequestClose={onRequestClose} visible={visible} showCloseIcon>
    <View style={styles.imageContainer}>
      <Image source={image} />
    </View>

    <View style={styles.paragraph}>
      {renderFormattedText(translations.paragraph1)}
    </View>

    <View style={styles.paragraph}>
      {renderFormattedText(translations.paragraph2)}
    </View>

    <Button onPress={onConfirm} title={translations.nextButton} />
  </Modal>
)

export default (compose(withTranslations(getTranslations))(
  MnemonicExplanationModal,
): ComponentType<ExternalProps>)
