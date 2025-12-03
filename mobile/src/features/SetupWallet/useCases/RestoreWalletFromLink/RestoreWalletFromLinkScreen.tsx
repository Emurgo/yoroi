import {isEmptyString} from '@yoroi/cardano-wallet'
import {getWalletNameError, validatePassword} from '@yoroi/cardano-wallet'
import {useAsyncStorage} from '@yoroi/common'
import {decryptWalletData, useLinks} from '@yoroi/links'
import {useSetupWallet} from '@yoroi/setup-wallet'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Api, Links, Wallet} from '@yoroi/types'
import {useCreateWalletFromRootKey} from '@yoroi/wallet-manager'
import {useCreateWalletMnemonic} from '@yoroi/wallet-manager'
import {useCreateWalletXPub} from '@yoroi/wallet-manager'
import {useWalletManager} from '@yoroi/wallet-manager'
import {parseWalletMeta} from '@yoroi/wallet-manager'

import {useNavigation} from '@react-navigation/native'
import * as React from 'react'
import {
  InteractionManager,
  TextInput as RNTextInput,
  ScrollView,
  Text,
  View,
} from 'react-native'

import {requiredPasswordLength} from '~/kernel/constants'
import {showErrorDialog} from '~/kernel/dialogs'
import {errorMessages} from '~/kernel/i18n/messages/global'
import {useStrings} from '~/kernel/i18n/useStrings'
import {logger} from '~/kernel/logger/logger'
import {useUnsafeParams} from '~/kernel/navigation/hooks/useUnsafeParams'
import {SetupWalletRouteNavigation} from '~/kernel/navigation/types'
import {Button} from '~/ui/Button/Button'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {Space} from '~/ui/Space/Space'
import {TextInput} from '~/ui/TextInput/TextInput'

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
  const navigation = useNavigation<SetupWalletRouteNavigation>()
  const strings = useStrings()
  const {atoms: ta} = useTheme()
  const {openModal, closeModal} = useModal()
  const {walletManager} = useWalletManager()
  const storage = useAsyncStorage()
  const {walletIdChanged} = useSetupWallet()
  const {markActionProcessed} = useLinks()

  const {action} = useUnsafeParams<{
    action: Links.CardanoActionRestoreWallet
  }>()

  // Clear the pending action from context as soon as we mount this screen
  // This prevents the action from being re-processed if the component remounts
  // or if navigation happens multiple times
  React.useEffect(() => {
    markActionProcessed()
  }, [markActionProcessed]) // Only run once on mount

  // Track if we've already processed this action to prevent re-showing modal
  const hasProcessedRef = React.useRef(false)
  const [showSecurityWarning, setShowSecurityWarning] = React.useState(true)

  const [name, setName] = React.useState(() => {
    const baseName = action.name ?? 'Restored Wallet'
    return generateUniqueWalletName(baseName, walletManager)
  })
  const [password, setPassword] = React.useState('')
  const [passwordConfirmation, setPasswordConfirmation] = React.useState('')
  const [decryptionPassword, setDecryptionPassword] = React.useState('')
  const [decryptionError, setDecryptionError] = React.useState<string | null>(
    null,
  )
  const passwordRef = React.useRef<RNTextInput>(null)
  const passwordConfirmationRef = React.useRef<RNTextInput>(null)
  const decryptionPasswordRef = React.useRef<RNTextInput>(null)

  // Check if encryption is used
  const encryptionAlgorithm =
    (action.encryption as
      | 'plain'
      | 'chacha20poly1305'
      | 'chacha20poly1305-csl') || 'plain'
  const needsDecryption = encryptionAlgorithm !== 'plain'

  const passwordErrors = validatePassword(password, passwordConfirmation)
  const passwordErrorText = passwordErrors.passwordIsWeak
    ? strings.setupWallet.passwordStrengthRequirement(requiredPasswordLength)
    : undefined
  const passwordConfirmationErrorText = passwordErrors.matchesConfirmation
    ? strings.setupWallet.repeatPasswordInputError
    : undefined

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
    // Don't show modal if we've already processed this action
    if (showSecurityWarning && !hasProcessedRef.current) {
      openModal({
        title: strings.setupWallet.restoreWalletFromLinkSecurityWarningTitle,
        content: (
          <Modal.Content>
            <Text style={[a.body_2_md_regular, ta.text_gray_max]}>
              {
                strings.setupWallet
                  .restoreWalletFromLinkSecurityWarningDescription
              }
            </Text>
          </Modal.Content>
        ),
        footer: (
          <Modal.Footer>
            <Button
              title={strings.setupWallet.restoreWalletFromLinkContinueButton}
              onPress={() => {
                closeModal()
                setShowSecurityWarning(false)
                hasProcessedRef.current = true
              }}
            />
          </Modal.Footer>
        ),
        height: 400,
        canDiscard: false, // Non-dismissible - user must acknowledge
      })
    }
  }, [
    showSecurityWarning,
    openModal,
    closeModal,
    strings.setupWallet.restoreWalletFromLinkSecurityWarningTitle,
    strings.setupWallet.restoreWalletFromLinkSecurityWarningDescription,
    strings.setupWallet.restoreWalletFromLinkContinueButton,
    strings.global.disclaimer,
    ta.text_gray_max,
  ])

  // Full wallet restoration (from mnemonic)
  const {createWallet: createWalletFromMnemonic, isPending: isPendingMnemonic} =
    useCreateWalletMnemonic({
      onSuccess: async (wallet) => {
        // Mark as processed to prevent re-showing modal if component remounts
        hasProcessedRef.current = true

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

        // Use replace instead of navigate to prevent going back to restore screen
        navigation.replace('setup-wallet-preparing-wallet')
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
        // Mark as processed to prevent re-showing modal if component remounts
        hasProcessedRef.current = true

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

        // Use replace instead of navigate to prevent going back to restore screen
        navigation.replace('setup-wallet-preparing-wallet')
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
        // Mark as processed to prevent re-showing modal if component remounts
        hasProcessedRef.current = true

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

        // Use replace instead of navigate to prevent going back to restore screen
        navigation.replace('setup-wallet-preparing-wallet')
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

  // Skip validation while pending to avoid race condition where validation runs
  // during async operation and shows error flash
  const nameErrors = !isPending ? walletManager.validateWalletName(name) : null
  const walletNameErrorText = getWalletNameError(
    {
      tooLong: strings.setupWallet.tooLong,
      nameAlreadyTaken: strings.setupWallet.nameAlreadyTaken,
    },
    nameErrors,
  )

  const handleRestore = () => {
    try {
      // Decrypt data if encryption is used
      let decryptedMnemonic = action.mnemonic
      let decryptedRootKey = action.rootKey
      let decryptedAccountPubKey = action.accountPubKey

      if (needsDecryption) {
        if (!decryptionPassword) {
          setDecryptionError('Decryption password is required')
          return
        }

        try {
          if (action.mnemonic) {
            decryptedMnemonic = decryptWalletData(
              action.mnemonic,
              decryptionPassword,
              encryptionAlgorithm,
            )
          }
          if (action.rootKey) {
            decryptedRootKey = decryptWalletData(
              action.rootKey,
              decryptionPassword,
              encryptionAlgorithm,
            )
          }
          if (action.accountPubKey) {
            decryptedAccountPubKey = decryptWalletData(
              action.accountPubKey,
              decryptionPassword,
              encryptionAlgorithm,
            )
          }
          setDecryptionError(null)
        } catch (error) {
          setDecryptionError('Invalid decryption password')
          logger.error('Decryption failed', {error})
          return
        }
      }

      if (action.type === 'full') {
        if (decryptedMnemonic) {
          createWalletFromMnemonic({
            name,
            mnemonicPhrase: decryptedMnemonic,
            password,
            implementation,
            addressMode,
            accountVisual,
          })
        } else if (decryptedRootKey) {
          createWalletFromRootKey({
            name,
            rootKeyHex: decryptedRootKey,
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
      } else if (action.type === 'readonly' && decryptedAccountPubKey != null) {
        createReadOnlyWallet({
          name,
          bip44AccountPublic: decryptedAccountPubKey,
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
    } catch (error) {
      logger.error('Restore failed', {error})
      showErrorDialog(errorMessages.generalError, undefined, {
        message: error instanceof Error ? error.message : 'Unknown error',
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
    (!needsDecryption || !isEmptyString(decryptionPassword)) &&
    !decryptionError &&
    !showSecurityWarning

  // Don't show modal if we've already processed this action
  if (showSecurityWarning && !hasProcessedRef.current) {
    return null // Modal is shown via useEffect
  }

  return (
    <SafeArea>
      <ScrollView
        style={a.flex_1}
        contentContainerStyle={[a.gap_lg, a.p_lg]}
        keyboardShouldPersistTaps="always"
      >
        <View>
          <Text style={[a.body_1_lg_regular, ta.text_gray_max]}>
            Wallet Type: {action.type === 'full' ? 'Full Wallet' : 'Read-Only'}
          </Text>
          {action.encryption && (
            <Text style={[a.body_1_lg_regular, ta.text_gray_max]}>
              Encryption: {action.encryption}
            </Text>
          )}
        </View>

        {needsDecryption && (
          <>
            <TextInput
              enablesReturnKeyAutomatically
              ref={decryptionPasswordRef}
              secureTextEntry
              label="Decryption Password"
              value={decryptionPassword}
              onChangeText={(text) => {
                setDecryptionPassword(text)
                setDecryptionError(null)
              }}
              errorText={decryptionError ?? undefined}
              returnKeyType="next"
              onSubmitEditing={() => {
                passwordRef.current?.focus()
              }}
              testID="decryptionPasswordInput"
              autoComplete="off"
              textContentType="none"
              showErrorOnBlur
            />
            <Space.Height.md />
          </>
        )}

        <TextInput
          enablesReturnKeyAutomatically
          autoFocus={!needsDecryption}
          label={strings.setupWallet.walletDetailsNameInput}
          value={name}
          onChangeText={setName}
          errorText={walletNameErrorText ?? undefined}
          errorDelay={0}
          returnKeyType="next"
          onSubmitEditing={() => {
            if (needsDecryption && !decryptionPassword) {
              decryptionPasswordRef.current?.focus()
            } else if (action.type === 'full') {
              passwordRef.current?.focus()
            }
          }}
          testID="walletNameInput"
          autoComplete="off"
          textContentType="none"
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
              textContentType="none"
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
              textContentType="none"
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
      </ScrollView>

      <SafeArea.Footer>
        <Button
          title="Restore Wallet"
          onPress={handleRestore}
          disabled={!canRestore || isPending}
        />
      </SafeArea.Footer>
    </SafeArea>
  )
}
