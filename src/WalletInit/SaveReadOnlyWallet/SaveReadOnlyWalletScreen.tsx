import {useNavigation, useRoute} from '@react-navigation/native'
import React, {useEffect, useState} from 'react'
import {defineMessages, useIntl} from 'react-intl'
// TODO: in the future, prefer SafeAreaView from react-native-safe-area-context,
// current version however doesn't work well on iOS
import {FlatList, SafeAreaView, ScrollView, View} from 'react-native'
import {StyleSheet} from 'react-native'
import {useDispatch} from 'react-redux'

import {createWalletWithBip44Account, handleGeneralError} from '../../../legacy/actions'
import {Line, StatusBar, Text} from '../../../legacy/components/UiKit'
import {CONFIG} from '../../../legacy/config/config'
import type {NetworkId} from '../../../legacy/config/types'
import {generateShelleyPlateFromKey} from '../../../legacy/crypto/shelley/plate'
import {ROOT_ROUTES, WALLET_ROOT_ROUTES} from '../../../legacy/RoutesList'
import {WalletMeta} from '../../../legacy/state'
import {theme} from '../../../legacy/styles/config'
import assert from '../../../legacy/utils/assert'
import {Logger} from '../../../legacy/utils/logging'
import {ignoreConcurrentAsyncHandler} from '../../../legacy/utils/utils'
import {Icon} from '../../components'
import {useSetSelectedWallet, useSetSelectedWalletMeta} from '../../SelectedWallet'
import {WalletAddress} from '../WalletAddress'
import {WalletNameForm} from '../WalletNameForm'

export const SaveReadOnlyWalletScreen = () => {
  const intl = useIntl()
  const strings = useStrings()
  const navigation = useNavigation()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  const setSelectedWalletMeta = useSetSelectedWalletMeta()
  const setSelectedWallet = useSetSelectedWallet()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onSubmit = React.useCallback(
    ignoreConcurrentAsyncHandler(
      () =>
        async ({name}) => {
          try {
            assert.assert(publicKeyHex != null, 'SaveReadOnlyWalletScreen::onPress publicKeyHex')
            assert.assert(networkId != null, 'networkId')
            assert.assert(!!walletImplementationId, 'walletImplementationId')

            withActivityIndicator(async () => {
              const wallet = await dispatch(
                createWalletWithBip44Account(
                  name,
                  publicKeyHex,
                  networkId,
                  walletImplementationId,
                  null,
                  true, // important: read-only flag
                ),
              )

              const walletMeta: WalletMeta = {
                name,

                id: wallet.id,
                networkId: wallet.networkId,
                walletImplementationId: wallet.walletImplementationId,
                isHW: wallet.isHW,
                checksum: wallet.checksum,
                isEasyConfirmationEnabled: wallet.isEasyConfirmationEnabled,
                provider: wallet.provider,
              }
              setSelectedWalletMeta(walletMeta)
              setSelectedWallet(wallet)
            })

            navigation.navigate(ROOT_ROUTES.WALLET, {
              screen: WALLET_ROOT_ROUTES.MAIN_WALLET_ROUTES,
            })
          } catch (e) {
            setIsWaiting(false)
            Logger.error('SaveReadOnlyWalletScreen::onSubmit', e)
            if (e instanceof Error) {
              await handleGeneralError(e.message, e, intl)
            }

            throw e
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
        defaultWalletName={strings.defaultWalletName}
        containerStyle={styles.walletFormStyle}
        bottomContent={
          <WalletInfoView
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

const SECTION_MARGIN = 22
const LABEL_MARGIN = 6

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.COLORS.BACKGROUND,
    paddingHorizontal: 16,
  },
  scrollView: {
    paddingRight: 10,
  },
  walletInfoContainer: {
    marginTop: SECTION_MARGIN,
  },
  label: {
    marginBottom: LABEL_MARGIN,
  },
  checksumContainer: {
    marginBottom: SECTION_MARGIN,
  },
  checksumView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    borderColor: 'red',
    flexWrap: 'wrap',
  },
  checksumText: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingLeft: 12,
  },
  addressesContainer: {
    marginBottom: SECTION_MARGIN,
  },
  keyAttributesContainer: {
    marginTop: SECTION_MARGIN,
  },
  keyView: {
    padding: 4,
    backgroundColor: theme.COLORS.CODE_STYLE_BACKGROUND,
    marginBottom: 10,
  },
  walletFormStyle: {
    paddingTop: 0,
    paddingHorizontal: 0,
  },
  walletFormButtonStyle: {
    marginHorizontal: 0,
  },
})

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

const useStrings = () => {
  const intl = useIntl()

  return {
    defaultWalletName: intl.formatMessage(messages.defaultWalletName),
    checksumLabel: intl.formatMessage(messages.checksumLabel),
    walletAddressLabel: intl.formatMessage(messages.walletAddressLabel),
    key: intl.formatMessage(messages.key),
    derivationPath: intl.formatMessage(messages.derivationPath),
  }
}

const CheckSumView = ({icon, checksum}: {icon: string; checksum: string}) => (
  <View style={styles.checksumView}>
    <Icon.WalletAccount iconSeed={icon} />
    <Text style={styles.checksumText}>{checksum}</Text>
  </View>
)

type WalletInfoProps = {
  plate: {
    accountPlate: {
      ImagePart: string
      TextPart: string
    }
    addresses: Array<string>
  }
  normalizedPath: Array<number>
  publicKeyHex: string
  networkId: NetworkId
}

const WalletInfoView = ({plate, normalizedPath, publicKeyHex, networkId}: WalletInfoProps) => {
  const strings = useStrings()

  return (
    <View style={styles.walletInfoContainer}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.checksumContainer}>
          <Text>{strings.checksumLabel}</Text>
          {!!plate.accountPlate.ImagePart && (
            <CheckSumView icon={plate.accountPlate.ImagePart} checksum={plate.accountPlate.TextPart} />
          )}
        </View>

        <View style={styles.addressesContainer}>
          <Text>{strings.walletAddressLabel}</Text>
          <FlatList
            data={plate.addresses}
            keyExtractor={(item) => item}
            renderItem={({item}) => <WalletAddress addressHash={item} networkId={networkId} />}
          />
        </View>

        <Line />

        <View style={styles.keyAttributesContainer}>
          <Text style={styles.label}>{strings.key}</Text>
          <View style={styles.keyView}>
            <Text secondary monospace numberOfLines={1} ellipsizeMode="middle">
              {publicKeyHex}
            </Text>
          </View>

          <Text style={styles.label}>{strings.derivationPath}</Text>
          <Text secondary monospace>
            {`m/${normalizedPath[0]}'/${normalizedPath[1]}'/${normalizedPath[2]}`}
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}
