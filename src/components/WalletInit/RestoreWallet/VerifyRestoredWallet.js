/* eslint-disable react-native/no-inline-styles */
// @flow

import React, {useState, useEffect} from 'react'
import {View, ScrollView} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {injectIntl, defineMessages, type IntlShape} from 'react-intl'

import {Text, Button, StatusBar, BulletPointItem} from '../../UiKit'

import {generateByronPlateFromMnemonics} from '../../../crypto/byron/plate'
import {generateShelleyPlateFromMnemonics} from '../../../crypto/shelley/plate'
import {WALLET_INIT_ROUTES} from '../../../RoutesList'
import WalletAddress from './WalletAddress'
import WalletAccountIcon from '../../Common/WalletAccountIcon'
import {WALLET_IMPLEMENTATION_REGISTRY} from '../../../config/types'

import styles from './styles/VerifyRestoredWallet.style'

import type {WalletImplementationId, NetworkId} from '../../../config/types'

const messages = defineMessages({
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
    defaultMessage: '!!!Make sure your wallet account checksum and icon match what you remember.',
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
    defaultMessage: '!!!Continue',
  },
})

const usePlateFromMnemonic = ({
  mnemonic,
  networkId,
  walletImplementationId,
}: {
  mnemonic: string,
  networkId: number,
  walletImplementationId: string,
}) => {
  const [addresses, setAddresses] = useState()
  const [plate, setPlate] = useState()

  useEffect(() => {
    const getPlate = async (
      walletImplId: WalletImplementationId,
      networkId: NetworkId,
      mnemonic: string,
      count: number,
    ) => {
      switch (walletImplId) {
        case WALLET_IMPLEMENTATION_REGISTRY.HASKELL_SHELLEY:
        case WALLET_IMPLEMENTATION_REGISTRY.HASKELL_SHELLEY_24:
          return await generateShelleyPlateFromMnemonics(mnemonic, count, networkId)
        case WALLET_IMPLEMENTATION_REGISTRY.HASKELL_BYRON:
          return generateByronPlateFromMnemonics(mnemonic, count)
        default:
          throw new Error('wallet implementation id is not valid')
      }
    }

    const generatePlates = async () => {
      const {addresses, accountPlate} = await getPlate(walletImplementationId, networkId, mnemonic, 1)
      setAddresses(addresses)
      setPlate(accountPlate)
    }

    generatePlates()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return [plate, addresses]
}

const VerifyWalletScreen = ({navigation, intl, route}: {intl: IntlShape} & Object /* TODO: type */) => {
  const {formatMessage} = intl
  const {phrase, networkId, walletImplementationId} = route.params
  const [plate, addresses] = usePlateFromMnemonic({mnemonic: phrase, networkId, walletImplementationId})

  const navigateToWalletCredentials = () => {
    navigation.navigate(WALLET_INIT_ROUTES.WALLET_CREDENTIALS, {
      phrase: route.params.phrase,
      networkId: route.params.networkId,
      walletImplementationId: route.params.walletImplementationId,
    })
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
      <StatusBar type="dark" />

      <ScrollView bounces={false} style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.checksumLabel}>{formatMessage(messages.checksumLabel)}</Text>
        <View style={styles.plateContainer}>{plate && <Plate icon={plate.ImagePart} checksum={plate.TextPart} />}</View>

        <Text style={styles.instructionsLabel}>{formatMessage(messages.instructionLabel)}</Text>
        <BulletPointItem textRow={formatMessage(messages.instructions1)} style={styles.bulletPoint} />
        <Spacer height={8} />
        <BulletPointItem textRow={formatMessage(messages.instructions2)} style={styles.bulletPoint} />
        <Spacer height={8} />
        <BulletPointItem textRow={formatMessage(messages.instructions3)} style={styles.bulletPoint} />

        <Spacer height={32} />

        <View style={styles.addresses}>
          <Text style={styles.addressesLabel}>{formatMessage(messages.walletAddressLabel)}</Text>
          {addresses && <WalletAddress addressHash={addresses[0]} networkId={networkId} />}
        </View>
      </ScrollView>

      <View style={styles.action}>
        <Button onPress={navigateToWalletCredentials} title={formatMessage(messages.buttonText)} />
      </View>
    </SafeAreaView>
  )
}

export default injectIntl(VerifyWalletScreen)

const Plate = ({icon, checksum}: {icon: string, checksum: string}) => (
  <View style={styles.plate}>
    <WalletAccountIcon iconSeed={icon} />

    <Spacer />

    <Text style={styles.checksum}>{checksum}</Text>
  </View>
)

const Spacer = ({height = 16}: {height?: number}) => <View style={{height, width: 16}} />
