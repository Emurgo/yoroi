// @flow
import React from 'react'
import {View} from 'react-native'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withHandlers} from 'recompose'

import PinRegistrationForm from '../Common/PinRegistrationForm'
import {WALLET_INIT_ROUTES} from '../../RoutesList'
import {encryptAndStoreCustomPin} from '../../actions'

import styles from './styles/CustomPinScreen.style'

import type {State} from '../../state'
import type {SubTranslation} from '../../l10n/typeHelpers'

const getTranslations = (state: State) => state.trans.ChoosePinScreen

const handleValidPinEnter = ({navigation, encryptAndStoreCustomPin}) => async (
  pin,
) => {
  await encryptAndStoreCustomPin(pin)
  navigation.navigate(WALLET_INIT_ROUTES.MAIN)
}

type Props = {
  handleValidPinEnter: (string) => void,
  translations: SubTranslation<typeof getTranslations>,
}

const CustomPinScreen = ({handleValidPinEnter, translations}: Props) => (
  <View style={styles.container}>
    <PinRegistrationForm
      onValidPinEnter={handleValidPinEnter}
      labels={translations.PinRegistrationForm}
    />
  </View>
)

export default compose(
  connect(
    (state: State) => ({
      translations: getTranslations(state),
    }),
    {
      encryptAndStoreCustomPin,
    },
  ),
  withHandlers({
    handleValidPinEnter,
  }),
)(CustomPinScreen)
