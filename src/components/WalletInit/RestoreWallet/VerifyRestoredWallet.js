/* eslint-disable react-native/no-inline-styles */
// @flow
import React, {useState, useEffect} from 'react'
import {compose} from 'redux'
import {connect} from 'react-redux'
import {View, FlatList, ScrollView} from 'react-native'
import {withHandlers} from 'recompose'
import {SafeAreaView} from 'react-native-safe-area-context'
import {injectIntl, defineMessages, intlShape} from 'react-intl'

import {Text, Button, StatusBar, BulletPointItem} from '../../UiKit'

import {generateByronPlateFromMnemonics} from '../../../crypto/byron/plate'
import {generateShelleyPlateFromMnemonics} from '../../../crypto/shelley/plate'
import {WALLET_INIT_ROUTES} from '../../../RoutesList'
import {withNavigationTitle} from '../../../utils/renderUtils'
import WalletAddress from './WalletAddress'
import WalletAccountIcon from '../../Common/WalletAccountIcon'
import {WALLET_IMPLEMENTATION_REGISTRY} from '../../../config/types'

import styles from './styles/VerifyRestoredWallet.style'

import type {ComponentType} from 'react'
import type {Navigation} from '../../../types/navigation'
import type {WalletImplementationId} from '../../../config/types'

const messages = defineMessages({
  title: {
    id: 'components.walletinit.verifyrestoredwallet.title',
    defaultMessage: '!!!Verify restored wallet',
  },
  checksumLabel: {
    id: 'components.walletinit.verifyrestoredwallet.checksumLabel',
    defaultMessage: '!!!Chacksum label',
  },
  instructionLabel: {
    id: 'components.walletinit.verifyrestoredwallet.instructionLabel',
    defaultMessage: '!!!Be careful about wallet restoration:',
  },
  instructions1: {
    id: 'components.walletinit.verifyrestoredwallet.instructionLabel-1',
    defaultMessage:
      '!!!Make sure your wallet account checksum and icon ' +
      'match what you remember.',
  },
  instructions2: {
    id: 'components.walletinit.verifyrestoredwallet.instructionLabel-2',
    defaultMessage: '!!!Make sure the address(es) match what you remember',
  },
  instructions3: {
    id: 'components.walletinit.verifyrestoredwallet.instructionLabel-3',
    defaultMessage:
      '!!!If you’ve entered wrong mnemonics you will just open ' +
      'another empty wallet with wrong account checksum and wrong addresses.',
  },
  walletAddressLabel: {
    id: 'components.walletinit.verifyrestoredwallet.walletAddressLabel',
    defaultMessage: '!!!Wallet Address(es):',
  },
  buttonText: {
    id: 'components.walletinit.verifyrestoredwallet.buttonText',
    defaultMessage: '!!!Wallet Instruction',
  },
})

const _getPlate = async (
  walletImplId: WalletImplementationId,
  phrase: string,
  count: number,
) => {
  switch (walletImplId) {
    case WALLET_IMPLEMENTATION_REGISTRY.HASKELL_SHELLEY:
    case WALLET_IMPLEMENTATION_REGISTRY.HASKELL_SHELLEY_24:
      return await generateShelleyPlateFromMnemonics(phrase, count)
    case WALLET_IMPLEMENTATION_REGISTRY.HASKELL_BYRON:
      return generateByronPlateFromMnemonics(phrase, count)
    default:
      throw new Error('wallet implementation id is not valid')
  }
}

const walletRestaurationIntruction = (formatMessage) => [
  formatMessage(messages.instructions1),
  formatMessage(messages.instructions2),
  formatMessage(messages.instructions3),
]

const CheckSumView = ({icon, checksum}) => (
  <View style={styles.checkSumView}>
    <WalletAccountIcon iconSeed={icon} />
    <Text style={styles.checksumText}>{checksum}</Text>
  </View>
)

const VerifyWalletScreen = ({
  navigateToWalletCredentials,
  intl,
  navigation,
}) => {
  const [plate, setPlate] = useState({
    accountPlate: {
      ImagePart: '',
      TextPart: '',
    },
    addresses: [],
  })

  const {formatMessage} = intl
  const phrase = navigation.getParam('phrase')
  const walletImplId = navigation.getParam('walletImplementationId')
  const networkId = navigation.getParam('networkId')

  const generatePlates = async () => {
    const {addresses, accountPlate} = await _getPlate(walletImplId, phrase, 1)
    setPlate({addresses, accountPlate})
  }

  useEffect(() => {
    generatePlates()
  }, [])

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <StatusBar type="dark" />
      <ScrollView style={styles.scrollView}>
        <Text style={styles.textStyles}>
          {formatMessage(messages.checksumLabel)}
        </Text>
        {!!plate.accountPlate.ImagePart && (
          <CheckSumView
            icon={plate.accountPlate.ImagePart}
            checksum={plate.accountPlate.TextPart}
          />
        )}
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
            data={plate.addresses}
            keyExtractor={(item) => item}
            renderItem={({item}) => (
              <WalletAddress addressHash={item} networkId={networkId} />
            )}
          />
        </View>
      </ScrollView>
      <Button
        onPress={navigateToWalletCredentials}
        title={formatMessage(messages.buttonText)}
      />
    </SafeAreaView>
  )
}

export default injectIntl(
  (compose(
    connect((_state) => ({})),
    withNavigationTitle(({intl}) => intl.formatMessage(messages.title)),
    withHandlers({
      navigateToWalletCredentials: ({navigation, walletNumber}) => (_event) => {
        navigation.navigate(WALLET_INIT_ROUTES.WALLET_CREDENTIALS, {
          walletNumber,
          phrase: navigation.getParam('phrase'),
          networkId: navigation.getParam('networkId'),
          walletImplementationId: navigation.getParam('walletImplementationId'),
        })
      },
    }),
  )(VerifyWalletScreen): ComponentType<{
    navigation: Navigation,
    intl: intlShape,
  }>),
)
