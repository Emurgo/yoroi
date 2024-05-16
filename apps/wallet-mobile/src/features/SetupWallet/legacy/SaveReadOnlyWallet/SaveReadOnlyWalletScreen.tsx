import {useSetupWallet} from '@yoroi/setup-wallet'
import {Api} from '@yoroi/types'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {FlatList, InteractionManager, ScrollView, StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Boundary, Icon, Line, Text} from '../../../../components'
import {showErrorDialog} from '../../../../dialogs'
import {errorMessages} from '../../../../i18n/global-messages'
import {useMetrics} from '../../../../metrics/metricsManager'
import {useWalletNavigation} from '../../../../navigation'
import {theme} from '../../../../theme'
import {isEmptyString} from '../../../../utils/utils'
import {AddressMode} from '../../../../wallet-manager/types'
import {NUMBERS} from '../../../../yoroi-wallets/cardano/numbers'
import {useCreateBip44Wallet, usePlate} from '../../../../yoroi-wallets/hooks'
import {NetworkId, WalletImplementationId} from '../../../../yoroi-wallets/types'
import {WalletAddress} from '../WalletAddress/WalletAddress'
import {WalletNameForm} from '../WalletNameForm/WalletNameForm'

// when ro, later will be part of the onboarding
const addressMode: AddressMode = 'single'
export const SaveReadOnlyWalletScreen = () => {
  const intl = useIntl()
  const strings = useStrings()
  const {resetToWalletSelection} = useWalletNavigation()
  const {track} = useMetrics()

  const {publicKeyHex, path, networkId, walletImplementationId} = useSetupWallet()

  const normalizedPath = path.map((i) => {
    if (i >= NUMBERS.HARD_DERIVATION_START) {
      return i - NUMBERS.HARD_DERIVATION_START
    }
    return i
  })

  const {createWallet, isLoading} = useCreateBip44Wallet({
    onSuccess: () => {
      track.restoreWalletDetailsSettled()
      resetToWalletSelection()
    },
    onError: (error) => {
      InteractionManager.runAfterInteractions(() => {
        return error instanceof Api.Errors.Network
          ? showErrorDialog(errorMessages.networkError, intl)
          : showErrorDialog(errorMessages.generalError, intl, {message: error.message})
      })
    },
  })

  const onSubmit = React.useCallback(
    ({name}: {name: string}) => {
      createWallet({
        name,
        networkId: networkId as NetworkId,
        implementationId: walletImplementationId as WalletImplementationId,
        bip44AccountPublic: publicKeyHex,
        readOnly: true,
        addressMode,
      })
    },
    [createWallet, networkId, publicKeyHex, walletImplementationId],
  )

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container} testID="saveReadOnlyWalletContainer">
      <WalletNameForm
        onSubmit={onSubmit}
        defaultWalletName={strings.defaultWalletName}
        containerStyle={styles.walletFormStyle}
        bottomContent={
          <Boundary>
            <WalletInfoView
              normalizedPath={normalizedPath}
              publicKeyHex={publicKeyHex}
              networkId={networkId as NetworkId}
            />
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

          {!isEmptyString(plate.accountPlate.ImagePart) && (
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
