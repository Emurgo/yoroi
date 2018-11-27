// @flow

import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {View} from 'react-native'
import _ from 'lodash'

import Screen from '../../components/Screen'
import {Text, Button, OfflineBanner} from '../UiKit'
import AddressDetail from './AddressDetail'
import AddressesList from './AddressesList'
import {
  generateNewReceiveAddress,
  generateNewReceiveAddressIfNeeded,
} from '../../actions'
import {
  receiveAddressesSelector,
  canGenerateNewReceiveAddressSelector,
  isUsedAddressIndexSelector,
} from '../../selectors'
import {
  onDidMount,
  onDidUpdate,
  withNavigationTitle,
} from '../../utils/renderUtils'

import styles from './styles/ReceiveScreen.style'

import type {ComponentType} from 'react'
import type {Navigation} from '../../types/navigation'

const getTranslations = (state) => state.trans.ReceiveScreen

const NO_ADDRESS = 'IT IS A BUG TO SEE THIS TEXT'

const ReceiveScreen = ({
  receiveAddresses,
  generateNewReceiveAddress,
  translations,
  addressLimitReached,
}) => {
  const currentAddress = _.last(receiveAddresses) || NO_ADDRESS

  return (
    <View style={styles.root}>
      <OfflineBanner />
      <Screen scroll>
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>{translations.infoText}</Text>
        </View>
        <AddressDetail address={currentAddress} />
        <View>
          <Button
            onPress={generateNewReceiveAddress}
            disabled={addressLimitReached}
            title={
              !addressLimitReached
                ? translations.generateButton
                : translations.cannotGenerate
            }
          />
        </View>
        <View>
          <Text>l10n Fresh addresses</Text>
        </View>
        <AddressesList showFresh addresses={receiveAddresses} />
        <View>
          <Text>l10n Used addresses</Text>
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
      // This is here just so that we can properly monitor changes and fire
      // generateNewReceiveAddressIfNeeded()
      isUsedAddressIndex: isUsedAddressIndexSelector(state),
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
)(ReceiveScreen): ComponentType<{navigation: Navigation}>)
