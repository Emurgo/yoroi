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
  Text,
} from 'react-native'

import {parseWalletMeta} from '~/features/WalletManager/common/validators/wallet-meta'
import {useWalletManager} from '~/features/WalletManager/context/WalletManagerProvider'
import {useCreateWalletXPub} from '~/features/WalletManager/hooks/useCreateWalletXPub'
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

export const RestoreReadOnlyWalletFromKeyScreen = () => {
  const navigation = useNavigation<SetupWalletRouteNavigation>()
  const strings = useStrings()
  const {atoms: ta} = useTheme()
  const {walletManager} = useWalletManager()
  const storage = useAsyncStorage()
  const {walletIdChanged} = useSetupWallet()

  const [name, setName] = React.useState('')
  const [accountPubKeyHex, setAccountPubKeyHex] = React.useState('')

  const nameRef = React.useRef<RNTextInput>(null)

  const nameErrors = walletManager.validateWalletName(name)
  const walletNameErrorText = getWalletNameError(
    {
      tooLong: strings.setupWallet.tooLong,
      nameAlreadyTaken: strings.setupWallet.nameAlreadyTaken,
    },
    nameErrors,
  )

  const implementation: Wallet.Implementation = DEFAULT_IMPLEMENTATION
  const addressMode: Wallet.AddressMode = DEFAULT_ADDRESS_MODE
  const accountVisual = DEFAULT_ACCOUNT_VISUAL

  const {createWallet: createReadOnlyWallet, isPending} = useCreateWalletXPub({
    onSuccess: async (wallet) => {
      walletIdChanged(wallet.id)
      const walletStorage = storage.join('wallet/')
      const walletMeta = await walletStorage.getItem(wallet.id, parseWalletMeta)

      if (!walletMeta) {
        const error = new Error(
          'RestoreReadOnlyWalletFromKeyScreen: wallet meta is invalid',
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

  const handleRestore = () => {
    if (isEmptyString(accountPubKeyHex)) {
      showErrorDialog(errorMessages.generalError, undefined, {
        message: 'Account public key is required',
      })
      return
    }

    createReadOnlyWallet({
      name,
      bip44AccountPublic: accountPubKeyHex.trim(),
      implementation,
      hwDeviceInfo: null,
      readOnly: true,
      addressMode,
      accountVisual,
    })
  }

  const canRestore =
    !isEmptyString(name) &&
    !walletNameErrorText &&
    !isEmptyString(accountPubKeyHex)

  return (
    <SafeArea>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[a.px_lg, a.pb_lg]}
      >
        <Space.Height.lg />

        <Text style={[a.body_1_lg_regular, ta.text_gray_low]}>
          Enter the account public key (accountPubKeyHex) to restore a full
          read-only wallet. This allows viewing all addresses and transactions.
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

        <TextInput
          label="Account Public Key (hex)"
          value={accountPubKeyHex}
          onChangeText={setAccountPubKeyHex}
          placeholder="Enter accountPubKeyHex..."
          multiline
          numberOfLines={4}
          testID="accountPubKeyHexInput"
        />
      </ScrollView>

      <SafeArea.Footer>
        <Button
          onPress={handleRestore}
          title="Restore Wallet"
          disabled={!canRestore || isPending}
          testID="restoreReadOnlyWalletButton"
        />
      </SafeArea.Footer>
    </SafeArea>
  )
}
