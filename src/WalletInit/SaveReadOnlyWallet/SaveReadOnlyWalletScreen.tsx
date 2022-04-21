import {RouteProp, useRoute} from '@react-navigation/native'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {FlatList, ScrollView, View} from 'react-native'
import {StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Boundary, Icon, Line, StatusBar, Text} from '../../components'
import {useCreateBip44Wallet, usePlate} from '../../hooks'
import {handleGeneralError} from '../../legacy/actions'
import {CONFIG} from '../../legacy/config'
import {Logger} from '../../legacy/logging'
import {useWalletNavigation, WalletInitRoutes} from '../../navigation'
import {theme} from '../../theme'
import {NetworkId} from '../../yoroi-wallets'
import {WalletAddress} from '../WalletAddress'
import {WalletNameForm} from '../WalletNameForm'

export const SaveReadOnlyWalletScreen = () => {
  const intl = useIntl()
  const strings = useStrings()
  const {resetToWalletSelection} = useWalletNavigation()
  const route = useRoute<RouteProp<WalletInitRoutes, 'save-read-only'>>()

  const {publicKeyHex, path, networkId, walletImplementationId} = route.params

  const normalizedPath = path.map((i) => {
    if (i >= CONFIG.NUMBERS.HARD_DERIVATION_START) {
      return i - CONFIG.NUMBERS.HARD_DERIVATION_START
    }
    return i
  })

  const {createWallet, isLoading} = useCreateBip44Wallet({
    onError: async (error) => {
      Logger.error('SaveReadOnlyWalletScreen::onSubmit', error)
      if (error instanceof Error) {
        await handleGeneralError(error.message, error, intl)
      }

      throw error
    },
    onSuccess: () => {
      resetToWalletSelection()
    },
  })

  const onSubmit = ({name}) => {
    createWallet({
      name,
      networkId,
      implementationId: walletImplementationId,
      bip44AccountPublic: publicKeyHex,
      readOnly: true,
    })
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container} testID="saveReadOnlyWalletContainer">
      <StatusBar type="dark" />
      <WalletNameForm
        onSubmit={onSubmit}
        defaultWalletName={strings.defaultWalletName}
        containerStyle={styles.walletFormStyle}
        bottomContent={
          <Boundary>
            <WalletInfoView normalizedPath={normalizedPath} publicKeyHex={publicKeyHex} networkId={networkId} />
          </Boundary>
        }
        buttonStyle={styles.walletFormButtonStyle}
        isWaiting={isLoading}
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
    defaultMessage: '!!!Checksum label',
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
  normalizedPath: Array<number>
  publicKeyHex: string
  networkId: NetworkId
}

const WalletInfoView = ({normalizedPath, publicKeyHex, networkId}: WalletInfoProps) => {
  const strings = useStrings()
  const plate = usePlate({networkId, publicKeyHex})

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
