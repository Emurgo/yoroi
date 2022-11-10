import _ from 'lodash'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ActivityIndicator, ScrollView, StyleSheet, View} from 'react-native'

import {Button, OfflineBanner, Spacer, StatusBar} from '../components'
import {useSelectedWallet} from '../SelectedWallet'
import {COLORS} from '../theme'
import {AddressDetail} from './AddressDetail'
import {UnusedAddresses, UsedAddresses} from './Addresses'

export const ReceiveScreen = () => {
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const [receiveAddresses, setReceiveAddresses] = React.useState(wallet.receiveAddresses)
  const addressLimitReached = wallet.canGenerateNewReceiveAddress() == false

  const currentAddress = _.last(receiveAddresses)

  const onGenerateNewAddresses = () => {
    wallet.generateNewReceiveAddress()
    setReceiveAddresses(wallet.receiveAddresses)
  }

  React.useEffect(() => {
    wallet.generateNewReceiveAddressIfNeeded()
    setReceiveAddresses(wallet.receiveAddresses)
  }, [wallet])

  return (
    <View style={styles.root}>
      <StatusBar type="light" />
      <OfflineBanner />

      <ScrollView>
        <Spacer height={24} />

        <Content>
          <View style={styles.address}>
            {currentAddress != null ? (
              <AddressDetail address={currentAddress} />
            ) : (
              <ActivityIndicator size="large" color="black" />
            )}
          </View>

          <Spacer height={24} />

          <Button
            outlineOnLight
            onPress={onGenerateNewAddresses}
            disabled={addressLimitReached}
            title={!addressLimitReached ? strings.generateButton : strings.cannotGenerate}
            testID="generateNewReceiveAddressButton"
          />

          <Spacer height={24} />

          <UnusedAddresses />
          <Spacer height={24} />
          <UsedAddresses />
        </Content>
      </ScrollView>
    </View>
  )
}

const Content = (props) => <View {...props} style={styles.content} />

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
})

const useStrings = () => {
  const intl = useIntl()

  return {
    infoText: intl.formatMessage(messages.infoText),
    generateButton: intl.formatMessage(messages.generateButton),
    cannotGenerate: intl.formatMessage(messages.cannotGenerate),
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  content: {
    paddingHorizontal: 16,
  },
  address: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
  },
})
