// @flow

import React from 'react'
import {connect} from 'react-redux'
import {compose} from 'redux'
import {View} from 'react-native'
import _ from 'lodash'
import {SafeAreaView} from 'react-native-safe-area-context'
import {injectIntl, defineMessages, type IntlShape} from 'react-intl'

import Screen from '../../components/Screen'
import {Text, Button, OfflineBanner, Banner, StatusBar} from '../UiKit'
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
import {AddressDTOCardano} from '../../crypto/Address.dto'

import styles from './styles/ReceiveScreen.style'

import type {ComponentType} from 'react'
import type {Navigation} from '../../types/navigation'

const NO_ADDRESS = 'IT IS A BUG TO SEE THIS TEXT'
const messages = defineMessages({
  title: {
    id: 'components.receive.receivescreen.title',
    defaultMessage: '!!!Receive',
    description: 'some desc',
  },
  infoText: {
    id: 'components.receive.receivescreen.infoText',
    defaultMessage:
      '!!!Share this address to receive payments. ' +
      'To protect your privacy, new addresses are ' +
      'generated automatically once you use them.',
    description: 'some desc',
  },
  generateButton: {
    id: 'components.receive.receivescreen.generateButton',
    defaultMessage: '!!!Generate another address',
    description: 'some desc',
  },
  cannotGenerate: {
    id: 'components.receive.receivescreen.cannotGenerate',
    defaultMessage: '!!!You have to use some of your addresses',
    description: 'some desc',
  },
  unusedAddresses: {
    id: 'components.receive.receivescreen.unusedAddresses',
    defaultMessage: '!!!Unused addresses',
    description: 'some desc',
  },
  usedAddresses: {
    id: 'components.receive.receivescreen.usedAddresses',
    defaultMessage: '!!!Used addresses',
    description: 'some desc',
  },
  verifyAddress: {
    id: 'components.receive.receivescreen.verifyAddress',
    defaultMessage: '!!!Verify address',
    description: 'some desc',
  },
})

const ReceiveScreen = (
  {
    receiveAddresses,
    generateNewReceiveAddress,
    intl,
    addressLimitReached,
  }: {intl: IntlShape} & Object /* TODO: type */,
) => {
  const currentAddress = _.last(receiveAddresses) || NO_ADDRESS
  const addressesInfo: Map<string, AddressDTOCardano> = new Map(
    receiveAddresses.map((addr) => [addr, new AddressDTOCardano(addr)]),
  )

  return (
    <View style={styles.container}>
      <StatusBar type="dark" />

      <OfflineBanner />
      <Banner text={intl.formatMessage(messages.infoText)} />
      <View style={styles.content}>
        <View style={styles.address}>
          <AddressDetail address={currentAddress} />
        </View>
        <Button
          style={styles.button}
          onPress={generateNewReceiveAddress}
          disabled={addressLimitReached}
          title={
            !addressLimitReached
              ? intl.formatMessage(messages.generateButton)
              : intl.formatMessage(messages.cannotGenerate)
          }
        />
      </View>
      <SafeAreaView style={styles.safeAreaView}>
        <Screen scroll>
          <View style={styles.addressListHeader}>
            <Text style={styles.heading}>
              {intl.formatMessage(messages.unusedAddresses)}
            </Text>
            <Text style={styles.heading}>
              {intl.formatMessage(messages.verifyAddress)}
            </Text>
          </View>
          <AddressesList showFresh addresses={addressesInfo} />
          <View style={styles.addressListHeader}>
            <Text style={styles.heading}>
              {intl.formatMessage(messages.usedAddresses)}
            </Text>
            <Text style={styles.heading}>
              {intl.formatMessage(messages.verifyAddress)}
            </Text>
          </View>
          <AddressesList addresses={addressesInfo} />
        </Screen>
      </SafeAreaView>
    </View>
  )
}

export default injectIntl(
  (compose(
    connect(
      (state) => ({
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
    withNavigationTitle(({intl}: {intl: IntlShape}) =>
      intl.formatMessage(messages.title),
    ),

    onDidMount(({generateNewReceiveAddressIfNeeded}) =>
      generateNewReceiveAddressIfNeeded(),
    ),
    onDidUpdate(({generateNewReceiveAddressIfNeeded}, _prevProps) =>
      generateNewReceiveAddressIfNeeded(),
    ),
  )(ReceiveScreen): ComponentType<{navigation: Navigation, intl: IntlShape}>),
)
