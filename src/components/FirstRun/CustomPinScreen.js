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

const handleValidPinEnter = ({navigation, encryptAndStoreCustomPin}) => async (
  pin,
) => {
  await encryptAndStoreCustomPin(pin)
  navigation.navigate(WALLET_INIT_ROUTES.MAIN)
}

type Props = {
  handleValidPinEnter: (string) => void,
}

const CustomPinScreen = ({handleValidPinEnter}: Props) => (
  <View style={styles.container}>
    <PinRegistrationForm onValidPinEnter={handleValidPinEnter} />
  </View>
)

export default compose(
  connect(
    // $FlowFixMe
    null,
    {
      encryptAndStoreCustomPin,
    },
  ),
  withHandlers({
    handleValidPinEnter,
  }),
)(CustomPinScreen)
