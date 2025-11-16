import {useAsyncStorage} from '@yoroi/common'
import {useSetupWallet} from '@yoroi/setup-wallet'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Api, Scan, Wallet} from '@yoroi/types'

import {useNavigation} from '@react-navigation/native'
import * as React from 'react'
import {
  InteractionManager,
  TextInput as RNTextInput,
  ScrollView,
  Text,
  View,
} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {parseWalletMeta} from '~/features/WalletManager/common/validators/wallet-meta'
import {useWalletManager} from '~/features/WalletManager/context/WalletManagerProvider'
import {useCreateWalletFromRootKey} from '~/features/WalletManager/hooks/useCreateWalletFromRootKey'
import {useCreateWalletMnemonic} from '~/features/WalletManager/hooks/useCreateWalletMnemonic'
import {useCreateWalletXPub} from '~/features/WalletManager/hooks/useCreateWalletXPub'
import {requiredPasswordLength} from '~/kernel/constants'
import {showErrorDialog} from '~/kernel/dialogs'
import {errorMessages} from '~/kernel/i18n/messages/global'
import {useStrings} from '~/kernel/i18n/useStrings'
import {logger} from '~/kernel/logger/logger'
import {useUnsafeParams} from '~/kernel/navigation/hooks/useUnsafeParams'
import {Button, ButtonType} from '~/ui/Button/Button'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'
import {Space} from '~/ui/Space/Space'
import {TextInput} from '~/ui/TextInput/TextInput'
import {isEmptyString} from '~/wallets/utils/string'
import {getWalletNameError, validatePassword} from '~/wallets/utils/validators'

// Default values when not provided in link
const DEFAULT_IMPLEMENTATION: Wallet.Implementation = 'cardano-cip1852'
const DEFAULT_ADDRESS_MODE: Wallet.AddressMode = 'single'
const DEFAULT_ACCOUNT_VISUAL = 0

// Generate a unique wallet name by appending a number suffix if needed
const generateUniqueWalletName = (
  baseName: string,
  walletManager: ReturnType<typeof useWalletManager>['walletManager'],
): string => {
  let candidateName = baseName
  let counter = 1

  // Check if the base name is already taken
  const nameErrors = walletManager.validateWalletName(candidateName)
  if (!nameErrors.nameAlreadyTaken) {
    return candidateName
  }

  // Try appending numbers until we find a unique name
  while (counter < 1000) {
    // Limit to prevent infinite loops
    candidateName = `${baseName} ${counter}`
    const errors = walletManager.validateWalletName(candidateName)
    if (!errors.nameAlreadyTaken) {
      return candidateName
    }
    counter++
  }

  // Fallback: append timestamp if we can't find a unique name
  return `${baseName} ${Date.now()}`
}

export const RestoreWalletFromLinkScreen = () => {
  const navigation = useNavigation<any>()
  const strings = useStrings()
  const {atoms: ta} = useTheme()
  const {openModal, closeModal} = useModal()
  const {walletManager} = useWalletManager()
  const storage = useAsyncStorage()
  const {walletIdChanged} = useSetupWallet()

  const {action} = useUnsafeParams<{
    action: Scan.ActionRestoreWallet
  }>()

  const [showSecurityWarning, setShowSecurityWarning] = React.useState(true)
  const [name, setName] = React.useState(() => {
    const baseName = action.name ?? 'Restored Wallet'
    return generateUniqueWalletName(baseName, walletManager)
  })
  const [password, setPassword] = React.useState('')
  const [passwordConfirmation, setPasswordConfirmation] = React.useState('')
  const passwordRef = React.useRef<RNTextInput>(null)
  const passwordConfirmationRef = React.useRef<RNTextInput>(null)

  const passwordErrors = validatePassword(password, passwordConfirmation)
  const passwordErrorText = passwordErrors.passwordIsWeak
    ? strings.setupWallet.passwordStrengthRequirement(requiredPasswordLength)
    : undefined
  const passwordConfirmationErrorText = passwordErrors.matchesConfirmation
    ? strings.setupWallet.repeatPasswordInputError
    : undefined

  const nameErrors = walletManager.validateWalletName(name)
  const walletNameErrorText = getWalletNameError(
    {
      tooLong: strings.setupWallet.tooLong,
      nameAlreadyTaken: strings.setupWallet.nameAlreadyTaken,
    },
    nameErrors,
  )

  // Parse optional parameters with defaults
  const implementation: Wallet.Implementation =
    (action.implementation as Wallet.Implementation) || DEFAULT_IMPLEMENTATION
  const addressMode: Wallet.AddressMode =
    (action.addressMode as Wallet.AddressMode) || DEFAULT_ADDRESS_MODE
  const accountVisual = action.accountVisual
    ? Number(action.accountVisual)
    : DEFAULT_ACCOUNT_VISUAL

  // Security warning modal
  React.useEffect(() => {
    if (showSecurityWarning) {
      openModal({
        title: 'Security Warning',
        content: (
          <Modal.Content>
            <Text style={[a.body_1_lg_regular, ta.text_primary_max]}>
              You are about to restore a wallet from a link or QR code.
            </Text>
            <Space.Height.md />
            <Text style={[a.body_1_lg_regular, ta.text_primary_max]}>
              ⚠️ Security Risks:
            </Text>
            <Space.Height.xs />
            <Text style={[a.body_1_lg_regular, ta.text_primary_max]}>
              • Phishing: Verify the source of this link/QR code
            </Text>
            <Text style={[a.body_1_lg_regular, ta.text_primary_max]}>
              • Malicious links could steal your funds
            </Text>
            <Text style={[a.body_1_lg_regular, ta.text_primary_max]}>
              • Only restore from trusted sources
            </Text>
            <Space.Height.md />
            <Text style={[a.body_1_lg_regular, ta.text_primary_max]}>
              By continuing, you acknowledge these risks.
            </Text>
          </Modal.Content>
        ),
        footer: (
          <Modal.Footer>
            <Button
              title="I Understand, Continue"
              onPress={() => {
                closeModal()
                setShowSecurityWarning(false)
              }}
            />
          </Modal.Footer>
        ),
        height: 400,
        canDiscard: false, // Non-dismissible - user must acknowledge
      })
    }
  }, [showSecurityWarning, openModal, closeModal, ta])

  // Full wallet restoration (from mnemonic)
  const {createWallet: createWalletFromMnemonic, isPending: isPendingMnemonic} =
    useCreateWalletMnemonic({
      onSuccess: async (wallet) => {
        walletIdChanged(wallet.id)
        const walletStorage = storage.join('wallet/')
        const walletMeta = await walletStorage.getItem(
          wallet.id,
          parseWalletMeta,
        )

        if (!walletMeta) {
          const error = new Error(
            'RestoreWalletFromLinkScreen: wallet meta is invalid',
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

  // Full wallet restoration (from root key)
  const {createWallet: createWalletFromRootKey, isPending: isPendingRootKey} =
    useCreateWalletFromRootKey({
      onSuccess: async (wallet) => {
        walletIdChanged(wallet.id)
        const walletStorage = storage.join('wallet/')
        const walletMeta = await walletStorage.getItem(
          wallet.id,
          parseWalletMeta,
        )

        if (!walletMeta) {
          const error = new Error(
            'RestoreWalletFromLinkScreen: wallet meta is invalid',
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

  // Read-only wallet restoration
  const {createWallet: createReadOnlyWallet, isPending: isPendingReadOnly} =
    useCreateWalletXPub({
      onSuccess: async (wallet) => {
        walletIdChanged(wallet.id)
        const walletStorage = storage.join('wallet/')
        const walletMeta = await walletStorage.getItem(
          wallet.id,
          parseWalletMeta,
        )

        if (!walletMeta) {
          const error = new Error(
            'RestoreWalletFromLinkScreen: wallet meta is invalid',
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

  const isPending = isPendingMnemonic || isPendingRootKey || isPendingReadOnly

  const handleRestore = () => {
    if (action.type === 'full') {
      if (action.mnemonic) {
        createWalletFromMnemonic({
          name,
          mnemonicPhrase: action.mnemonic,
          password,
          implementation,
          addressMode,
          accountVisual,
        })
      } else if (action.rootKey) {
        createWalletFromRootKey({
          name,
          rootKeyHex: action.rootKey,
          password,
          implementation,
          addressMode,
          accountVisual,
        })
      } else {
        // This should not happen due to validation, but add safety check
        logger.error(
          new Error(
            'RestoreWalletFromLinkScreen: full wallet type requires either mnemonic or rootKey',
          ),
        )
        showErrorDialog(errorMessages.generalError, undefined, {
          message: 'Invalid wallet data: missing mnemonic or root key',
        })
      }
    } else if (action.type === 'readonly' && action.accountPubKey != null) {
      createReadOnlyWallet({
        name,
        bip44AccountPublic: action.accountPubKey,
        implementation,
        hwDeviceInfo: null,
        readOnly: true,
        addressMode,
        accountVisual,
      })
    } else {
      // This should not happen due to validation, but add safety check
      logger.error(
        new Error(
          'RestoreWalletFromLinkScreen: readonly wallet type requires accountPubKey',
        ),
      )
      showErrorDialog(errorMessages.generalError, undefined, {
        message: 'Invalid wallet data: missing account public key',
      })
    }
  }

  const canRestore =
    !isEmptyString(name) &&
    !walletNameErrorText &&
    (action.type === 'readonly' ||
      (!isEmptyString(password) &&
        !passwordErrors.passwordIsWeak &&
        !passwordErrors.matchesConfirmation)) &&
    !showSecurityWarning

  if (showSecurityWarning) {
    return null // Modal is shown via useEffect
  }

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={[a.flex_1, a.px_lg, ta.bg_color_max]}
    >
      <ScrollView style={a.flex_1} contentContainerStyle={[a.gap_lg, a.pb_lg]}>
        <View>
          <Text style={[a.heading_3_medium, ta.text_primary_max]}>
            Restore Wallet from Link
          </Text>
          <Space.Height.sm />
          <Text style={[a.body_1_lg_regular, ta.text_gray_max]}>
            Wallet Type: {action.type === 'full' ? 'Full Wallet' : 'Read-Only'}
          </Text>
          {action.encryption && (
            <Text style={[a.body_1_lg_regular, ta.text_gray_max]}>
              Encryption: {action.encryption}
            </Text>
          )}
        </View>

        <TextInput
          enablesReturnKeyAutomatically
          autoFocus
          label={strings.setupWallet.walletDetailsNameInput}
          value={name}
          onChangeText={setName}
          errorText={walletNameErrorText ?? undefined}
          errorDelay={0}
          returnKeyType="next"
          onSubmitEditing={() => {
            if (action.type === 'full') {
              passwordRef.current?.focus()
            }
          }}
          testID="walletNameInput"
          autoComplete="off"
          showErrorOnBlur
        />

        {action.type === 'full' && (
          <>
            <TextInput
              enablesReturnKeyAutomatically
              ref={passwordRef}
              secureTextEntry
              label={strings.setupWallet.walletDetailsPasswordInput}
              value={password}
              onChangeText={setPassword}
              errorText={passwordErrorText}
              returnKeyType="next"
              helper={strings.setupWallet.walletDetailsPasswordHelper}
              onSubmitEditing={() => passwordConfirmationRef.current?.focus()}
              testID="walletPasswordInput"
              autoComplete="off"
              showErrorOnBlur
              textContentType="oneTimeCode"
            />

            <TextInput
              enablesReturnKeyAutomatically
              ref={passwordConfirmationRef}
              secureTextEntry
              label={strings.setupWallet.walletDetailsConfirmPasswordInput}
              value={passwordConfirmation}
              onChangeText={setPasswordConfirmation}
              errorText={passwordConfirmationErrorText}
              returnKeyType="done"
              onSubmitEditing={handleRestore}
              testID="walletPasswordConfirmationInput"
              autoComplete="off"
              showErrorOnBlur
              textContentType="oneTimeCode"
            />
          </>
        )}

        {action.type === 'readonly' && action.accountPubKey && (
          <View style={[a.p_md, ta.bg_color_min]}>
            <Text style={[a.body_1_lg_regular, ta.text_primary_max]}>
              Account Public Key:
            </Text>
            <Space.Height.xs />
            <Text
              style={[a.body_2_md_regular, ta.text_gray_max]}
              numberOfLines={3}
              ellipsizeMode="middle"
            >
              {action.accountPubKey ?? ''}
            </Text>
          </View>
        )}

        <Button
          title="Restore Wallet"
          onPress={handleRestore}
          disabled={!canRestore || isPending}
          type={ButtonType.Primary}
        />
      </ScrollView>
    </SafeAreaView>
  )
}
