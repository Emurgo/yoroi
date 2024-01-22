import {useFocusEffect} from '@react-navigation/native'
import _ from 'lodash'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ActivityIndicator, ScrollView, StyleSheet, View, ViewProps} from 'react-native'

import {Button, Spacer, StatusBar} from '../components'
import {useMetrics} from '../metrics/metricsManager'
import {useSelectedWallet} from '../SelectedWallet'
import {COLORS} from '../theme'
import {useReceiveAddresses} from '../yoroi-wallets/hooks'
import {AddressDetail} from './AddressDetail'
import {UnusedAddresses, UsedAddresses} from './Addresses'

export const ReceiveScreen = () => {
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const receiveAddresses = useReceiveAddresses(wallet)
  const addressLimitReached = wallet.canGenerateNewReceiveAddress() == false

  const currentAddress = _.last(receiveAddresses)

  React.useEffect(() => {
    wallet.generateNewReceiveAddressIfNeeded()
  }, [wallet])

  const {track} = useMetrics()

  useFocusEffect(
    React.useCallback(() => {
      track.receivePageViewed()
    }, [track]),
  )

  return (
    <View style={styles.root}>
      <StatusBar type="dark" />

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
            onPress={() => wallet.generateNewReceiveAddress()}
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

const Content = (props: ViewProps) => <View {...props} style={styles.content} />

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
