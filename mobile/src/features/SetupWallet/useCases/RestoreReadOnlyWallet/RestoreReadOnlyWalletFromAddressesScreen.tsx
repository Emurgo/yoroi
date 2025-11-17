import {useAsyncStorage} from '@yoroi/common'
import {useSetupWallet} from '@yoroi/setup-wallet'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Api, Wallet} from '@yoroi/types'

import {useNavigation} from '@react-navigation/native'
import * as React from 'react'
import {
  InteractionManager,
  TextInput as RNTextInput,
  ScrollView,
  Switch,
  Text,
  View,
} from 'react-native'

import {AddressInput} from '~/common/AddressInput/AddressInput'
import {parseWalletMeta} from '~/features/WalletManager/common/validators/wallet-meta'
import {useWalletManager} from '~/features/WalletManager/context/WalletManagerProvider'
import {useCreateReadOnlyWalletFromAddresses} from '~/features/WalletManager/hooks/useCreateReadOnlyWalletFromAddresses'
import {showErrorDialog} from '~/kernel/dialogs'
import {errorMessages} from '~/kernel/i18n/messages/global'
import {useStrings} from '~/kernel/i18n/useStrings'
import {logger} from '~/kernel/logger/logger'
import {SetupWalletRouteNavigation} from '~/kernel/navigation/types'
import {Button} from '~/ui/Button/Button'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {Space} from '~/ui/Space/Space'
import {TextInput} from '~/ui/TextInput/TextInput'
import {isEmptyString} from '~/wallets/utils/string'
import {getWalletNameError} from '~/wallets/utils/validators'

const DEFAULT_IMPLEMENTATION: Wallet.Implementation = 'cardano-cip1852'
const DEFAULT_ADDRESS_MODE: Wallet.AddressMode = 'single'
const DEFAULT_ACCOUNT_VISUAL = 0

export const RestoreReadOnlyWalletFromAddressesScreen = () => {
  const navigation = useNavigation<SetupWalletRouteNavigation>()
  const strings = useStrings()
  const {atoms: ta} = useTheme()
  const {walletManager} = useWalletManager()
  const storage = useAsyncStorage()
  const {walletIdChanged} = useSetupWallet()

  const [name, setName] = React.useState('')
  const [knownAddress, setKnownAddress] = React.useState('')
  const [resolvedAddress, setResolvedAddress] = React.useState('')
  const [isAddressValid, setIsAddressValid] = React.useState(false)
  const [enableDiscovery, setEnableDiscovery] = React.useState(false)

  const handleResolved = React.useCallback((address: string) => {
    setResolvedAddress(address)
  }, [])

  const handleValidationChange = React.useCallback((isValid: boolean) => {
    setIsAddressValid(isValid)
  }, [])

  const nameRef = React.useRef<RNTextInput>(null)
  const addressInputRef = React.useRef<RNTextInput>(null)

  const implementation: Wallet.Implementation = DEFAULT_IMPLEMENTATION
  const addressMode: Wallet.AddressMode = DEFAULT_ADDRESS_MODE
  const accountVisual = DEFAULT_ACCOUNT_VISUAL

  const {
    createWallet,
    isPending,
    isSuccess: isCreateWalletSuccess,
  } = useCreateReadOnlyWalletFromAddresses({
    onSuccess: async (wallet) => {
      walletIdChanged(wallet.id)
      const walletStorage = storage.join('wallet/')
      const walletMeta = await walletStorage.getItem(wallet.id, parseWalletMeta)

      if (!walletMeta) {
        const error = new Error(
          'RestoreReadOnlyWalletFromAddressesScreen: wallet meta is invalid',
        )
        logger.error(error)
        throw error
      }

      navigation.navigate('setup-wallet-preparing-wallet')
    },
    onError: (error) => {
      InteractionManager.runAfterInteractions(() => {
        return error instanceof Api.Errors.Network
          ? showErrorDialog(errorMessages.networkError)
          : showErrorDialog(errorMessages.generalError, undefined, {
              message: error.message,
            })
      })
    },
  })

  // Skip validation once wallet is successfully created or while pending to avoid race condition
  // where the wallet is created but validation still runs and sees duplicate name
  const nameErrors =
    !isCreateWalletSuccess && !isPending
      ? walletManager.validateWalletName(name)
      : null
  const walletNameErrorText = getWalletNameError(
    {
      tooLong: strings.setupWallet.tooLong,
      nameAlreadyTaken: strings.setupWallet.nameAlreadyTaken,
    },
    nameErrors,
  )

  const handleRestore = () => {
    // Use resolved address if available, otherwise use the input
    const finalKnownAddress =
      resolvedAddress || knownAddress.trim() || undefined

    if (isEmptyString(finalKnownAddress)) {
      showErrorDialog(errorMessages.generalError, undefined, {
        message: 'A known address is required',
      })
      return
    }

    // Validate that finalKnownAddress is a valid Cardano address format
    // It should start with 'addr' for mainnet or 'addr_test' for testnet
    if (
      !finalKnownAddress.startsWith('addr') &&
      !finalKnownAddress.startsWith('addr_test')
    ) {
      showErrorDialog(errorMessages.generalError, undefined, {
        message: `Invalid address format: ${finalKnownAddress.substring(0, 50)}...`,
      })
      return
    }

    createWallet({
      name,
      knownAddress: finalKnownAddress,
      implementation,
      addressMode,
      accountVisual,
      enableDiscovery,
    })
  }

  const finalKnownAddressCheck = resolvedAddress || knownAddress.trim() || ''

  const canRestore =
    !isEmptyString(name) &&
    !walletNameErrorText &&
    !isEmptyString(finalKnownAddressCheck) &&
    isAddressValid

  return (
    <SafeArea>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[a.px_lg, a.pb_lg]}
        style={[a.flex_1]}
      >
        <Space.Height.lg />

        <Text style={[a.body_1_lg_regular, ta.text_gray_low]}>
          Enter a known address to restore a partial read-only wallet. Enable
          discovery to automatically find other addresses used by this wallet.
        </Text>

        <Space.Height.xl />

        <TextInput
          ref={nameRef}
          label={strings.setupWallet.walletDetailsNameInput}
          value={name}
          onChangeText={setName}
          errorText={walletNameErrorText || undefined}
          autoFocus
          testID="walletNameInput"
        />

        <Space.Height.lg />

        <Text style={[a.body_3_sm_regular, ta.text_gray_low]}>
          Enter a Cardano address, ADA handle (e.g., $handle), or domain. If
          discovery is enabled, other addresses will be found automatically.
        </Text>

        <Space.Height.xs />

        <AddressInput
          value={knownAddress}
          onChangeText={setKnownAddress}
          onResolved={handleResolved}
          onValidationChange={handleValidationChange}
          label="Known Address"
          placeholder="addr1... or $handle or domain.crypto"
          ref={addressInputRef}
          testID="knownAddressInput"
        />

        <Space.Height.xl />

        <View style={[a.flex_row, a.align_center, a.justify_between, a.py_md]}>
          <View style={[a.flex_1]}>
            <Text style={[a.body_1_lg_medium, ta.text_gray_medium]}>
              Enable Address Discovery
            </Text>
            <Space.Height.xs />
            <Text style={[a.body_2_md_regular, ta.text_gray_low]}>
              Automatically discover other addresses used by this wallet by
              analyzing transaction history
            </Text>
          </View>
          <Switch
            value={enableDiscovery}
            onValueChange={setEnableDiscovery}
            testID="enableDiscoverySwitch"
          />
        </View>
      </ScrollView>

      <SafeArea.Footer>
        <Button
          onPress={handleRestore}
          title="Restore Wallet"
          disabled={!canRestore || isPending}
          testID="restoreReadOnlyWalletFromAddressesButton"
        />
      </SafeArea.Footer>
    </SafeArea>
  )
}
