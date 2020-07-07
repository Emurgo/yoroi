/* eslint-disable react-native/no-inline-styles */
// @flow
import React, {useState, useEffect} from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {View, FlatList} from 'react-native'
import {withHandlers} from 'recompose'
import {SafeAreaView, withNavigation} from 'react-navigation'
import {injectIntl, defineMessages, intlShape} from 'react-intl'

import {Text, Button, StatusBar, BulletPointItem} from '../../UiKit'
import {getAddressesFromMnemonics} from '../../../crypto/byron/util'

import {legacyWalletChecksum} from '../../../utils/generatePlates'
import {WALLET_INIT_ROUTES} from '../../../RoutesList'
import {withNavigationTitle} from '../../../utils/renderUtils'
import WalletAddress from './WalletAddress'
import Blokies from '../../Common/Blockie'

import styles from './styles/VerifyRestoredWallet.style'

import type {AddressType} from '../../../crypto/commonUtils'
import type {ComponentType} from 'react'
import type {Navigation} from '../../../types/navigation'

const displayAddrType: AddressType = 'External'

const messages = defineMessages({
  title: {
    id: 'components.walletinit.verifyrestoredwallet.title',
    defaultMessage: '!!!Verify restored wallet',
    description: 'some desc',
  },
  checksumLabel: {
    id: 'components.walletinit.verifyrestoredwallet.checksumLabel',
    defaultMessage: '!!!Chacksum label',
    description: 'some desc',
  },
  instructionLabel: {
    id: 'components.walletinit.verifyrestoredwallet.instructionLabel',
    defaultMessage: '!!!Be careful about wallet restoration:',
    description: 'some desc',
  },
  instructions1: {
    id: 'components.walletinit.verifyrestoredwallet.instructionLabel-1',
    defaultMessage: '!!!Wallet Instruction',
    description: 'some desc',
  },
  instructions2: {
    id: 'components.walletinit.verifyrestoredwallet.instructionLabel-2',
    defaultMessage: '!!!Wallet Instruction',
    description: 'some desc',
  },
  instructions3: {
    id: 'components.walletinit.verifyrestoredwallet.instructionLabel-3',
    defaultMessage: '!!!Wallet Instruction',
    description: 'some desc',
  },
  walletAddressLabel: {
    id: 'components.walletinit.verifyrestoredwallet.walletAddressLabel',
    defaultMessage: '!!!Wallet Instruction',
    description: 'some desc',
  },
  buttonText: {
    id: 'components.walletinit.verifyrestoredwallet.buttonText',
    defaultMessage: '!!!Wallet Instruction',
    description: 'some desc',
  },
})

const walletRestaurationIntruction = (formatMessage) => [
  formatMessage(messages.instructions1),
  formatMessage(messages.instructions2),
  formatMessage(messages.instructions3),
]

// const walletAddresses = [
//   'DdfFfGgXxCcXcV … hHhJKKHgfdaa',
//   'AaAaSdDD4534 … kdDDdDdfFfGgXx',
// ]

const RestoreWalletScreen = ({
  navigateToWalletCredentials,
  intl,
  navigation,
}) => {
  const [plate, setPlate] = useState({ImagePart: '', TextPart: ''})
  const [walletAddress, setWalletAdress] = useState([])

  const {formatMessage} = intl
  const phrase = navigation.getParam('phrase')

  const generatePlates = () => {
    const plateData = legacyWalletChecksum(phrase)
    setPlate(plateData)
  }

  const generateAdresses = async () => {
    try {
      // get first external byron address
      const byronAddr = await getAddressesFromMnemonics(
        phrase,
        displayAddrType,
        [0],
      )
      setWalletAdress(byronAddr)
    } catch (error) {
      // console.warn(error)
    }
  }

  useEffect(() => {
    generatePlates()
    generateAdresses()
  }, [])

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <StatusBar type="dark" />
      <View>
        <Text style={styles.textStyles}>
          {formatMessage(messages.checksumLabel)}
        </Text>
        <CheckSumView icon={plate.ImagePart} checksum={plate.TextPart} />
        <Text style={styles.titleStyles}>
          {formatMessage(messages.instructionLabel)}
        </Text>
        <FlatList
          data={walletRestaurationIntruction(formatMessage)}
          keyExtractor={(item) => item}
          renderItem={({item}) => (
            <BulletPointItem textRow={item} style={styles.instructionStyles} />
          )}
        />
        <View style={styles.addressesStyles}>
          <Text style={styles.titleStyles}>
            {formatMessage(messages.walletAddressLabel)}
          </Text>
          <FlatList
            data={walletAddress}
            keyExtractor={(item) => item}
            renderItem={({item}) => <WalletAddress addressHash={item} />}
          />
        </View>
      </View>
      <Button
        onPress={navigateToWalletCredentials}
        title={formatMessage(messages.buttonText)}
      />
    </SafeAreaView>
  )
}

export default injectIntl(
  (compose(
    connect((state) => ({})),
    withNavigation,
    withNavigationTitle(({intl}) => intl.formatMessage(messages.title)),
    withHandlers({
      navigateToWalletCredentials: ({navigation, walletNumber}) => (event) => {
        navigation.navigate(WALLET_INIT_ROUTES.WALLET_CREDENTIALS, {
          walletNumber,
          phrase: navigation.getParam('phrase'),
          networkId: navigation.getParam('networkId'),
          walletImplementationId: navigation.getParam('walletImplementationId'),
        })
      },
    }),
  )(RestoreWalletScreen): ComponentType<{
    navigation: Navigation,
    intl: intlShape,
  }>),
)

const CheckSumView = ({icon, checksum}) => (
  <View style={styles.checkSumView}>
    <Blokies blockies={icon} size={2} style={{width: 35, height: 35}} />

    <Text style={styles.checksumText}>{checksum}</Text>
  </View>
)
