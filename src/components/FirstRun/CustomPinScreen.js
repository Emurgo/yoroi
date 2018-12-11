// @flow
import React from 'react'
import {View} from 'react-native'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {withHandlers, withProps} from 'recompose'

import PinRegistrationForm from '../Common/PinRegistrationForm'
import {encryptAndStoreCustomPin} from '../../actions'
import {withNavigationTitle, withTranslations} from '../../utils/renderUtils'
import {StatusBar} from '../UiKit'

import styles from './styles/CustomPinScreen.style'

import type {State} from '../../state'
import type {ComponentType} from 'react'
import type {Navigation} from '../../types/navigation'

const getTranslations = (state: State) => state.trans.ChoosePinScreen

const CustomPinScreen = ({handlePinEntered, translations}) => (
  <View style={styles.container}>
    <StatusBar type="dark" />

    <PinRegistrationForm
      onPinEntered={handlePinEntered}
      labels={translations.PinRegistrationForm}
    />
  </View>
)

type ExternalProps = {|
  navigation: Navigation,
|}

export default (compose(
  withTranslations(getTranslations),
  withNavigationTitle(({translations}) => translations.title),
  connect(
    () => ({}),
    {
      encryptAndStoreCustomPin,
    },
  ),
  withProps(({navigation}) => ({
    onSuccess: navigation.getParam('onSuccess'),
  })),
  withHandlers({
    handlePinEntered: ({onSuccess, encryptAndStoreCustomPin}) => async (
      pin,
    ) => {
      await encryptAndStoreCustomPin(pin)
      onSuccess()
    },
  }),
)(CustomPinScreen): ComponentType<ExternalProps>)
