// @flow

import React from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {View} from 'react-native'
import {withHandlers} from 'recompose'

import {Text, Button} from '../UiKit'
import {authenticate} from '../../helpers/bioAuthHelper'

import styles from './styles/ConfirmScreen.style'

import type {SubTranslation} from '../../l10n/typeHelpers'

const getTranslations = (state) => state.trans.ConfirmSendScreen

type Props = {
  onConfirm: () => mixed,
  translations: SubTranslation<typeof getTranslations>,
}

const ConfirmScreen = ({onConfirm, translations}: Props) => (
  <View style={styles.container}>
    <Text style={styles.welcome}>i18nConfirm your transaction</Text>

    <Button
      onPress={onConfirm}
      title={translations.confirm}
    />
  </View>
)

export default compose(
  connect((state) => ({
    translations: getTranslations(state),
  })),
  withHandlers({
    // TODO(ppershing): this should validate only on confirm
    onConfirm: ({navigation}) => (event) =>
      authenticate().then((success) => (success ? navigation.popToTop() : null)),
  })
)(ConfirmScreen)
