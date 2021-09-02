// @flow

import React, {useState, useEffect} from 'react'
// TODO: in the future, prefer SafeAreaView from react-native-safe-area-context,
// current version however doesn't work well on iOS
import {View, SafeAreaView, FlatList, ScrollView} from 'react-native'
import {injectIntl, type IntlShape, defineMessages} from 'react-intl'
import {useDispatch} from 'react-redux'
import {useNavigation, useRoute} from '@react-navigation/native'

import {Text, StatusBar, Line} from '../../UiKit'
import WalletNameForm from '../WalletNameForm'
import {createWalletWithBip44Account, handleGeneralError} from '../../../actions'
import {generateShelleyPlateFromKey} from '../../../crypto/shelley/plate'
import {ROOT_ROUTES, WALLET_ROOT_ROUTES} from '../../../RoutesList'
import {CONFIG} from '../../../config/config'
import assert from '../../../utils/assert'
import WalletAddress from './WalletAddress'
import WalletAccountIcon from '../../Common/WalletAccountIcon'
import {Logger} from '../../../utils/logging'
import {ignoreConcurrentAsyncHandler} from '../../../utils/utils'

import styles from './styles/SaveReadOnlyWalletScreen.style'

import type {NetworkId} from '../../../config/types'

const messages = defineMessages({
  defaultWalletName: {
    id: 'components.walletinit.savereadonlywalletscreen.defaultWalletName',
    defaultMessage: '!!!My read-only wallet',
  },
  checksumLabel: {
    id: 'components.walletinit.verifyrestoredwallet.checksumLabel',
    defaultMessage: '!!!Chacksum label',
  },
  walletAddressLabel: {
    id: 'components.walletinit.verifyrestoredwallet.walletAddressLabel',
    defaultMessage: '!!!Wallet Address(es):',
  },
  key: {
    id: 'components.walletinit.savereadonlywalletscreen.key',
    defaultMessage: '!!!Key:',
  },
  derivationPath: {
    id: 'components.walletinit.savereadonlywalletscreen.derivationPath',
    defaultMessage: '!!!Derivation path:',
  },
})

const CheckSumView = ({icon, checksum}: {icon: string, checksum: string}) => (
  <View style={styles.checksumView}>
    <WalletAccountIcon iconSeed={icon} />
    <Text style={styles.checksumText}>{checksum}</Text>
  </View>
)

type WalletInfoProps = {|
  intl: IntlShape,
  plate: {
    accountPlate: {
      ImagePart: string,
      TextPart: string,
    },
    addresses: Array<string>,
  },
  normalizedPath: Array<number>,
  publicKeyHex: string,
  networkId: NetworkId,
|}

const WalletInfoView = ({intl, plate, normalizedPath, publicKeyHex, networkId}: WalletInfoProps) => (
  <View style={styles.walletInfoContainer}>
    <ScrollView style={styles.scrollView}>
      <View style={styles.checksumContainer}>
        <Text>{intl.formatMessage(messages.checksumLabel)}</Text>
        {!!plate.accountPlate.ImagePart && (
          <CheckSumView icon={plate.accountPlate.ImagePart} checksum={plate.accountPlate.TextPart} />
        )}
      </View>

      <View style={styles.addressesContainer}>
        <Text>{intl.formatMessage(messages.walletAddressLabel)}</Text>
        <FlatList
          data={plate.addresses}
          keyExtractor={(item) => item}
          renderItem={({item}) => <WalletAddress addressHash={item} networkId={networkId} />}
        />
      </View>

      <Line />

      <View style={styles.keyAttributesContainer}>
        <Text style={styles.label}>{intl.formatMessage(messages.key)}</Text>
        <View style={styles.keyView}>
          <Text secondary monospace numberOfLines={1} ellipsizeMode="middle">
            {publicKeyHex}
          </Text>
        </View>

        <Text style={styles.label}>{intl.formatMessage(messages.derivationPath)}</Text>
        <Text secondary monospace>
          {`m/${normalizedPath[0]}'/${normalizedPath[1]}'/${normalizedPath[2]}`}
        </Text>
      </View>
    </ScrollView>
  </View>
)

type Props = {
  intl: IntlShape,
}

const SaveReadOnlyWalletScreen = ({intl}: Props) => {
  const navigation = useNavigation()
  const route: any = useRoute()
  const [isWaiting, setIsWaiting] = React.useState(false)
  const dispatch = useDispatch()
  const [plate, setPlate] = useState({
    accountPlate: {
      ImagePart: '',
      TextPart: '',
    },
    addresses: [],
  })

  const {publicKeyHex, path, networkId, walletImplementationId} = route.params

  const normalizedPath = path.map((i) => {
    if (i >= CONFIG.NUMBERS.HARD_DERIVATION_START) {
      return i - CONFIG.NUMBERS.HARD_DERIVATION_START
    }
    return i
  })

  const withActivityIndicator = async (func: () => Promise<void>): Promise<void> => {
    setIsWaiting(true)
    try {
      await func()
    } finally {
      setIsWaiting(false)
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onSubmit = React.useCallback(
    ignoreConcurrentAsyncHandler(
      () =>
        async ({name}) => {
          try {
            assert.assert(publicKeyHex != null, 'SaveReadOnlyWalletScreen::onPress publicKeyHex')
            assert.assert(networkId != null, 'networkId')
            assert.assert(!!walletImplementationId, 'walletImplementationId')

            withActivityIndicator(
              async () =>
                await dispatch(
                  createWalletWithBip44Account(
                    name,
                    publicKeyHex,
                    networkId,
                    walletImplementationId,
                    null,
                    true, // important: read-only flag
                  ),
                ),
            )

            navigation.navigate(ROOT_ROUTES.WALLET, {
              screen: WALLET_ROOT_ROUTES.MAIN_WALLET_ROUTES,
            })
          } catch (e) {
            setIsWaiting(false)
            Logger.error('SaveReadOnlyWalletScreen::onSubmit', e)
            await handleGeneralError(e.message, e, intl)
          }
        },
      1000,
    )(),
    [publicKeyHex, networkId, walletImplementationId, navigation, route],
  )

  useEffect(() => {
    const generatePlates = async () => {
      const {addresses, accountPlate} = await generateShelleyPlateFromKey(publicKeyHex, 1, networkId)
      setPlate({addresses, accountPlate})
    }

    generatePlates()
  }, [networkId, publicKeyHex])

  return (
    <SafeAreaView style={styles.container} testID="saveReadOnlyWalletContainer">
      <StatusBar type="dark" />
      <WalletNameForm
        onSubmit={onSubmit}
        defaultWalletName={intl.formatMessage(messages.defaultWalletName)}
        containerStyle={styles.walletFormStyle}
        bottomContent={
          <WalletInfoView
            intl={intl}
            plate={plate}
            normalizedPath={normalizedPath}
            publicKeyHex={publicKeyHex}
            networkId={networkId}
          />
        }
        buttonStyle={styles.walletFormButtonStyle}
        isWaiting={isWaiting}
      />
    </SafeAreaView>
  )
}

export default injectIntl(SaveReadOnlyWalletScreen)
