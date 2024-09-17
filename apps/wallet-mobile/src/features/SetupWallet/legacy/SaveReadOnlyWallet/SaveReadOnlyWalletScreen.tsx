import {useNavigation} from '@react-navigation/native'
import {useAsyncStorage} from '@yoroi/common'
import {Blockies} from '@yoroi/identicon'
import {useSetupWallet} from '@yoroi/setup-wallet'
import {Api, Wallet} from '@yoroi/types'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {FlatList, InteractionManager, ScrollView, StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Boundary} from '../../../../components/Boundary/Boundary'
import {Icon} from '../../../../components/Icon'
import {Line} from '../../../../components/Line'
import {Text} from '../../../../components/Text'
import {showErrorDialog} from '../../../../kernel/dialogs'
import {errorMessages} from '../../../../kernel/i18n/global-messages'
import {logger} from '../../../../kernel/logger/logger'
import {useMetrics} from '../../../../kernel/metrics/metricsManager'
import {SetupWalletRouteNavigation} from '../../../../kernel/navigation'
import {isEmptyString} from '../../../../kernel/utils'
import {usePlate} from '../../../../yoroi-wallets/hooks'
import {derivationConfig} from '../../../WalletManager/common/derivation-config'
import {useCreateWalletXPub} from '../../../WalletManager/common/hooks/useCreateWalletXPub'
import {useSelectedNetwork} from '../../../WalletManager/common/hooks/useSelectedNetwork'
import {parseWalletMeta} from '../../../WalletManager/common/validators/wallet-meta'
import {WalletAddress} from '../WalletAddress/WalletAddress'
import {WalletNameForm} from '../WalletNameForm/WalletNameForm'

// when ro, later will be part of the onboarding
const addressMode: Wallet.AddressMode = 'single'
export const SaveReadOnlyWalletScreen = () => {
  const intl = useIntl()
  const strings = useStrings()
  const storage = useAsyncStorage()
  const navigation = useNavigation<SetupWalletRouteNavigation>()
  const {track} = useMetrics()

  const {publicKeyHex, path, walletImplementation, accountVisual, walletIdChanged} = useSetupWallet()

  const normalizedPath = path.map((i) => {
    if (i >= derivationConfig.hardStart) return i - derivationConfig.hardStart
    return i
  })

  const {createWallet, isLoading} = useCreateWalletXPub({
    onSuccess: async (wallet) => {
      walletIdChanged(wallet.id)
      const walletStorage = storage.join('wallet/')
      const walletMeta = await walletStorage.getItem(wallet.id, parseWalletMeta)

      if (!walletMeta) {
        const error = new Error('WalletDetailsScreen: wallet meta is invalid, reached an invalid state.')
        logger.error(error)
        throw error
      }

      track.restoreWalletDetailsSettled()

      navigation.navigate('setup-wallet-preparing-wallet')
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
        implementation: walletImplementation,
        bip44AccountPublic: publicKeyHex,
        readOnly: true,
        addressMode,
        hwDeviceInfo: null,
        accountVisual,
      })
    },
    [createWallet, publicKeyHex, walletImplementation, accountVisual],
  )

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container} testID="saveReadOnlyWalletContainer">
      <WalletNameForm
        onSubmit={onSubmit}
        defaultWalletName={strings.defaultWalletName}
        containerStyle={styles.walletFormStyle}
        bottomContent={
          <Boundary>
            <WalletInfoView normalizedPath={normalizedPath} publicKeyHex={publicKeyHex} />
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
    <Icon.WalletAvatar image={new Blockies({seed: icon}).asBase64()} />

    <Text style={styles.checksumText}>{checksum}</Text>
  </View>
)

type WalletInfoProps = {
  normalizedPath: Array<number>
  publicKeyHex: string
}

const WalletInfoView = ({normalizedPath, publicKeyHex}: WalletInfoProps) => {
  const strings = useStrings()
  const {walletImplementation} = useSetupWallet()
  const {
    networkManager: {chainId},
  } = useSelectedNetwork()
  const plate = usePlate({chainId, publicKeyHex, implementation: walletImplementation})

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
            renderItem={({item}) => <WalletAddress addressHash={item} />}
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
