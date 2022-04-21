import _ from 'lodash'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ActivityIndicator, ScrollView, StyleSheet, View} from 'react-native'
import {useDispatch, useSelector} from 'react-redux'

import {Banner, Button, OfflineBanner, Spacer, StatusBar} from '../components'
import {generateNewReceiveAddress, generateNewReceiveAddressIfNeeded} from '../legacy/actions'
import {UI_V2} from '../legacy/config'
import {
  canGenerateNewReceiveAddressSelector,
  isUsedAddressIndexSelector,
  receiveAddressesSelector,
} from '../legacy/selectors'
import {COLORS} from '../theme'
import {AddressDetail} from './AddressDetail'
import {UnusedAddresses, UsedAddresses} from './Addresses'

export const ReceiveScreen = () => {
  const strings = useStrings()
  const receiveAddresses = useSelector(receiveAddressesSelector)
  const addressLimitReached = !useSelector(canGenerateNewReceiveAddressSelector)

  const currentAddress = _.last(receiveAddresses)

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
    <View style={styles.root}>
      <StatusBar type={UI_V2 ? 'light' : 'dark'} />
      <OfflineBanner />

      <ScrollView>
        {!UI_V2 && <Banner text={strings.infoText} />}
        {UI_V2 && <Spacer height={24} />}

        <Content>
          <View style={styles.address}>
            {currentAddress ? (
              <AddressDetail address={currentAddress} />
            ) : (
              <ActivityIndicator size="large" color="black" />
            )}
          </View>

          <Spacer height={24} />

          <Button
            outlineOnLight
            onPress={() => dispatch(generateNewReceiveAddress())}
            disabled={addressLimitReached}
            title={!addressLimitReached ? strings.generateButton : strings.cannotGenerate}
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
