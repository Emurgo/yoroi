import {WalletChecksum} from '@emurgo/cip4-js'
import {useNavigation, useRoute} from '@react-navigation/native'
import React, {useEffect, useState} from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ActivityIndicator, ScrollView, StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {BulletPointItem, Button, Spacer, StatusBar, Text} from '../../../legacy/components/UiKit'
import type {NetworkId, WalletImplementationId} from '../../../legacy/config/types'
import {WALLET_IMPLEMENTATION_REGISTRY} from '../../../legacy/config/types'
import {generateByronPlateFromMnemonics} from '../../../legacy/crypto/byron/plate'
import {generateShelleyPlateFromMnemonics} from '../../../legacy/crypto/shelley/plate'
import {WALLET_INIT_ROUTES} from '../../../legacy/RoutesList'
import {COLORS} from '../../../legacy/styles/config'
import {Icon} from '../../components'
import {WalletAddress} from '../WalletAddress'

export const VerifyRestoredWalletScreen = () => {
  const strings = useStrings()
  const navigation = useNavigation()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const route: any = useRoute()
  const {phrase, networkId, walletImplementationId} = route.params
  const [plate, addresses] = usePlateFromMnemonic({mnemonic: phrase, networkId, walletImplementationId})

  const navigateToWalletCredentials = () => {
    navigation.navigate(WALLET_INIT_ROUTES.WALLET_CREDENTIALS, {
      phrase: route.params.phrase,
      networkId: route.params.networkId,
      walletImplementationId: route.params.walletImplementationId,
      provider: route.params.provider,
    })
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
      <StatusBar type="dark" />

      <ScrollView bounces={false} contentContainerStyle={styles.contentContainer}>
        <WalletInfo>
          <Text style={styles.checksumLabel}>{strings.checksumLabel}</Text>
        </WalletInfo>

        <Spacer height={24} />

        <Plate>
          {plate ? (
            <>
              <Icon.WalletAccount iconSeed={plate.ImagePart} />
              <Spacer />
              <Text style={styles.checksum}>{plate.TextPart}</Text>
            </>
          ) : (
            <ActivityIndicator style={{flex: 1}} size={'large'} color={'black'} />
          )}
        </Plate>

        <Spacer height={40} />

        <Instructions>
          <Text style={styles.instructionsLabel}>{strings.instructionLabel}</Text>
          <BulletPointItem textRow={strings.instructions1} style={styles.bulletPoint} />
          <Spacer height={8} />
          <BulletPointItem textRow={strings.instructions2} style={styles.bulletPoint} />
          <Spacer height={8} />
          <BulletPointItem textRow={strings.instructions3} style={styles.bulletPoint} />
        </Instructions>

        <Spacer height={32} />

        <Addresses>
          <Text style={styles.addressesLabel}>{strings.walletAddressLabel}</Text>
          {addresses ? (
            <WalletAddress addressHash={addresses[0]} networkId={networkId} />
          ) : (
            <ActivityIndicator size={'small'} color={'black'} />
          )}
        </Addresses>
      </ScrollView>

      <Actions>
        <Button onPress={navigateToWalletCredentials} title={strings.buttonText} />
      </Actions>
    </SafeAreaView>
  )
}

const WalletInfo = (props) => <View {...props} />
const Plate = (props) => <View {...props} style={styles.plate} />
const Instructions = (props) => <View {...props} />
const Addresses = (props) => <View {...props} />
const Actions = (props) => <View {...props} style={styles.actions} />

const messages = defineMessages({
  checksumLabel: {
    id: 'components.walletinit.verifyrestoredwallet.checksumLabel',
    defaultMessage: '!!!Checksum label',
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

const useStrings = () => {
  const intl = useIntl()

  return {
    checksumLabel: intl.formatMessage(messages.checksumLabel),
    instructionLabel: intl.formatMessage(messages.instructionLabel),
    instructions1: intl.formatMessage(messages.instructions1),
    instructions2: intl.formatMessage(messages.instructions2),
    instructions3: intl.formatMessage(messages.instructions3),
    walletAddressLabel: intl.formatMessage(messages.walletAddressLabel),
    buttonText: intl.formatMessage(messages.buttonText),
  }
}

const usePlateFromMnemonic = ({
  mnemonic,
  networkId,
  walletImplementationId,
}: {
  mnemonic: string
  networkId: number
  walletImplementationId: string
}) => {
  const [addresses, setAddresses] = useState()
  const [plate, setPlate] = useState<undefined | WalletChecksum>(undefined)

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

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: COLORS.WHITE,
  },
  contentContainer: {
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  checksumLabel: {
    fontSize: 14,
    color: COLORS.DARK_TEXT,
  },
  instructionsLabel: {
    lineHeight: 32,
    color: COLORS.DARK_TEXT,
  },
  bulletPoint: {
    lineHeight: 24,
    color: COLORS.DARK_TEXT,
  },
  addressesLabel: {
    color: COLORS.DARK_TEXT,
  },
  checksum: {
    fontWeight: 'bold',
  },

  plate: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actions: {
    padding: 16,
  },
})
