// @flow

import _ from 'lodash'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ActivityIndicator, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useDispatch, useSelector} from 'react-redux'

import {generateNewReceiveAddress, generateNewReceiveAddressIfNeeded} from '../../actions'
import Screen from '../../components/Screen'
import {AddressDTOCardano} from '../../crypto/shelley/Address.dto'
import {
  canGenerateNewReceiveAddressSelector,
  isUsedAddressIndexSelector,
  receiveAddressesSelector,
} from '../../selectors'
import {Banner, Button, OfflineBanner, Spacer, StatusBar, Text} from '../UiKit'
import AddressDetail from './AddressDetail'
import AddressesList from './AddressesList'
import styles from './styles/ReceiveScreen.style'

const ReceiveScreen = () => {
  const strings = useStrings()
  const receiveAddresses = useSelector(receiveAddressesSelector)
  const addressLimitReached = !useSelector(canGenerateNewReceiveAddressSelector)

  const currentAddress = _.last(receiveAddresses)

  const addressesInfo: Map<string, AddressDTOCardano> = new Map(
    receiveAddresses.map((addr) => [addr, new AddressDTOCardano(addr)]),
  )

  const dispatch = useDispatch()
  React.useEffect(() => {
    dispatch(generateNewReceiveAddressIfNeeded())
  }, [dispatch])

  // This is here just so that we can properly monitor changes and fire
  // generateNewReceiveAddressIfNeeded()
  const isUsedAddressIndex = useSelector(isUsedAddressIndexSelector)
  React.useEffect(() => {
    dispatch(generateNewReceiveAddressIfNeeded())
  }, [dispatch, isUsedAddressIndex])

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.safeAreaView}>
      <StatusBar type="dark" />

      <OfflineBanner />
      <Banner text={strings.infoText} />

      <Spacer height={24} />

      <Content>
        <View style={styles.address}>
          {currentAddress ? (
            <AddressDetail address={currentAddress} />
          ) : (
            <ActivityIndicator size={'large'} color={'black'} />
          )}
        </View>

        <Spacer height={24} />

        <Button
          outlineOnLight
          onPress={() => dispatch(generateNewReceiveAddress())}
          disabled={addressLimitReached}
          title={!addressLimitReached ? strings.generateButton : strings.cannotGenerate}
        />
      </Content>

      <Spacer height={24} />

      <Lists>
        <Screen scroll>
          <ListHeader>
            <Text style={styles.heading}>{strings.unusedAddresses}</Text>
            <Text style={styles.heading}>{strings.verifyAddress}</Text>
          </ListHeader>
          <UnusedAddressesList addresses={addressesInfo} />

          <ListHeader>
            <Text style={styles.heading}>{strings.usedAddresses}</Text>
          </ListHeader>
          <UsedAddressesList addresses={addressesInfo} />
        </Screen>
      </Lists>
    </SafeAreaView>
  )
}

export default ReceiveScreen

const Content = (props) => <View {...props} style={styles.content} />
const Lists = (props) => <View {...props} style={styles.lists} />
const ListHeader = (props) => <View {...props} style={styles.addressListHeader} />
const UsedAddressesList = (props) => <AddressesList {...props} />
const UnusedAddressesList = (props) => <AddressesList {...props} showFresh />

const messages = defineMessages({
  infoText: {
    id: 'components.receive.receivescreen.infoText',
    defaultMessage:
      '!!!Share this address to receive payments. ' +
      'To protect your privacy, new addresses are ' +
      'generated automatically once you use them.',
  },
  generateButton: {
    id: 'components.receive.receivescreen.generateButton',
    defaultMessage: '!!!Generate another address',
  },
  cannotGenerate: {
    id: 'components.receive.receivescreen.cannotGenerate',
    defaultMessage: '!!!You have to use some of your addresses',
  },
  unusedAddresses: {
    id: 'components.receive.receivescreen.unusedAddresses',
    defaultMessage: '!!!Unused addresses',
  },
  usedAddresses: {
    id: 'components.receive.receivescreen.usedAddresses',
    defaultMessage: '!!!Used addresses',
  },
  verifyAddress: {
    id: 'components.receive.receivescreen.verifyAddress',
    defaultMessage: '!!!Verify address',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    infoText: intl.formatMessage(messages.infoText),
    generateButton: intl.formatMessage(messages.generateButton),
    cannotGenerate: intl.formatMessage(messages.cannotGenerate),
    unusedAddresses: intl.formatMessage(messages.unusedAddresses),
    usedAddresses: intl.formatMessage(messages.usedAddresses),
    verifyAddress: intl.formatMessage(messages.verifyAddress),
  }
}
