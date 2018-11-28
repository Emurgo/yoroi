// @flow

import React from 'react'
import {View} from 'react-native'
import {compose} from 'redux'
import {Button, Modal} from '../../UiKit'
import Screen from '../../Screen'

import styles from './styles/MnemonicExplanationModal.style'
import {COLORS} from '../../../styles/config'
import {renderFormattedText} from '../../../utils/textRendering'

import type {State} from '../../../state'

import {withTranslations} from '../../../utils/renderUtils'
import type {ComponentType} from 'react'

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
  <Modal onRequestClose={onRequestClose} visible={visible}>
    <Screen bgColor={COLORS.TRANSPARENT_BLACK}>
      <View style={styles.dialogBody}>
        {renderFormattedText(translations.paragraph1)}
        {renderFormattedText(translations.paragraph2)}

        <Button onPress={onConfirm} title={translations.nextButton} />
      </View>
    </Screen>
  </Modal>
)

export default (compose(withTranslations(getTranslations))(
  MnemonicExplanationModal,
): ComponentType<ExternalProps>)
