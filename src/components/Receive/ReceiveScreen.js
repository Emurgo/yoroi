// @flow

import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {View} from 'react-native'
import _ from 'lodash'

import Screen from '../../components/Screen'
import {Text, Button} from '../UiKit'
import AddressDetail from './AddressDetail'
import AddressesList from './AddressesList'
import {
  generateNewReceiveAddress,
  generateNewReceiveAddressIfNeeded,
} from '../../actions'
import {
  receiveAddressesSelector,
  canGenerateNewReceiveAddressSelector,
} from '../../selectors'
import {onDidMount, onDidUpdate} from '../../utils/renderUtils'
import {withNavigationTitle} from '../../utils/renderUtils'

import styles from './styles/ReceiveScreen.style'

import type {ComponentType} from 'react'

const getTranslations = (state) => state.trans.ReceiveScreen

const NO_ADDRESS = {
  address: 'IT IS A BUG TO SEE THIS TEXT',
  index: -1,
  isUsed: false,
}

const ReceiveScreen = ({
  receiveAddresses,
  generateNewReceiveAddress,
  translations,
  addressLimitReached,
}) => {
  const currentAddress = _.last(receiveAddresses) || NO_ADDRESS
  return (
    <View style={styles.root}>
      <Screen scroll>
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>{translations.infoText}</Text>
        </View>
        <AddressDetail {...currentAddress} />
        <View>
          <Button
            onPress={generateNewReceiveAddress}
            disabled={addressLimitReached}
            title={
              !addressLimitReached
                ? translations.generate
                : translations.cannotGenerate
            }
          />
        </View>
        <AddressesList addresses={receiveAddresses} />
      </Screen>
    </View>
  )
}

export default (compose(
  connect(
    (state) => ({
      translations: getTranslations(state),
      receiveAddresses: receiveAddressesSelector(state),
      addressLimitReached: !canGenerateNewReceiveAddressSelector(state),
    }),
    {
      generateNewReceiveAddress,
      generateNewReceiveAddressIfNeeded,
    },
  ),
  withNavigationTitle(({translations}) => translations.title),

  onDidMount(({generateNewReceiveAddressIfNeeded}) =>
    generateNewReceiveAddressIfNeeded(),
  ),
  onDidUpdate(({generateNewReceiveAddressIfNeeded}, prevProps) =>
    generateNewReceiveAddressIfNeeded(),
  ),
)(ReceiveScreen): ComponentType<{}>)
