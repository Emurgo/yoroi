// @flow

import React from 'react'
import {View} from 'react-native'
import {compose} from 'redux'
import {Text, Button, Modal} from '../../UiKit'
import Screen from '../../Screen'

import styles from './styles/RecoveryPhraseExplanationDialog.style'
import {COLORS} from '../../../styles/config'

import type {State} from '../../../state'

import {withTranslations} from '../../../utils/renderUtils'
import type {ComponentType} from 'react'

const getTranslations = (state: State) =>
  state.trans.RecoveryPhraseExplanationDialog

type ExternalProps = {
  onConfirm: () => any,
  visible: boolean,
  onRequestClose: () => any,
}

const RecoveryPhraseExplanationDialog = ({
  onConfirm,
  translations,
  onRequestClose,
  visible,
}) => (
  <Modal onRequestClose={onRequestClose} visible={visible}>
    <Screen bgColor={COLORS.TRANSPARENT_BLACK}>
      <View style={styles.dialogBody}>
        <Text>{translations.title}</Text>
        <Text>{translations.paragraph1}</Text>
        <Text>{translations.paragraph2}</Text>

        <Button onPress={onConfirm} title={translations.nextButton} />
      </View>
    </Screen>
  </Modal>
)

export default (compose(withTranslations(getTranslations))(
  RecoveryPhraseExplanationDialog,
): ComponentType<ExternalProps>)
