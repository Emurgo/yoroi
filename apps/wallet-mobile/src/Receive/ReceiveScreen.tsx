import { useFocusEffect } from '@react-navigation/native'
import _ from 'lodash'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { ScrollView, StyleSheet, View } from 'react-native'

import { Button, Spacer, StatusBar } from '../components'
import { useCopy } from '../legacy/useCopy'
import { useMetrics } from '../metrics/metricsManager'
import { useSelectedWallet } from '../SelectedWallet'
import { COLORS,colors } from '../theme'
import { useHideBottomTabBar, useReceiveAddresses } from '../yoroi-wallets/hooks'
import { AddressDetail, SkeletonAdressDetail } from './AddressDetail'

export const ReceiveScreen = () => {
  useHideBottomTabBar()
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const receiveAddresses = useReceiveAddresses(wallet)

  const [isCopying, copy] = useCopy()

  const currentAddress = _.last(receiveAddresses)

  React.useEffect(() => {
    wallet.generateNewReceiveAddressIfNeeded()
  }, [wallet])

  const { track } = useMetrics()

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
            {currentAddress !== null ? (
              <AddressDetail address={currentAddress} title={strings.addresscardTitle} />
            ) : (
              <SkeletonAdressDetail />
            )}
          </View>

          <Spacer height={64} />

          <Button
            outline
            title='request specific amount'
            textStyles={{
              color: colors.buttonBackgroundBlue
            }}
          />

          <Spacer height={24} />

          <Button
            shelleyTheme
            onPress={() => {
              copy(currentAddress)
            }}
            disabled={currentAddress === null ? true : false}
            testID="copyReceiveAddressButton"
            title='Copy address'
            iconImage={require('../../src/assets/img/copy.png')}
            isCopying={isCopying}
          />

        </Content>
      </ScrollView>
    </View>
  )
}

const Content = (props) => <View {...props} style={styles.content} />

const messages = defineMessages({
  addresscardTitle: {
    id: 'components.receive.addresscard.title',
    defaultMessage:'!!!Wallet address',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    addresscardTitle: intl.formatMessage(messages.addresscardTitle),
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
    height: '100%',
    minHeight: 180,
    maxHeight: 458,
  },
})
