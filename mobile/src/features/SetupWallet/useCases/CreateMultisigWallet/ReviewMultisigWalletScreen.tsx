/**
 * Review Multisig Wallet Screen
 * Review multisig wallet configuration before creation
 */
import {getWalletNameError} from '@yoroi/cardano-wallet'
import {useAsyncStorage} from '@yoroi/common'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Wallet} from '@yoroi/types'
import {
  parseWalletMeta,
  useCreateMultisigWallet,
  useWalletManager,
} from '@yoroi/wallet-manager'

import {useNavigation, useRoute} from '@react-navigation/native'
import * as React from 'react'
import {
  ActivityIndicator,
  InteractionManager,
  ScrollView,
  View,
} from 'react-native'

import {showErrorDialog} from '~/kernel/dialogs'
import {errorMessages} from '~/kernel/i18n/messages/global'
import {useStrings} from '~/kernel/i18n/useStrings'
import {logger} from '~/kernel/logger/logger'
import {SetupWalletRouteNavigation} from '~/kernel/navigation/types'
import {Button} from '~/ui/Button/Button'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {Space} from '~/ui/Space/Space'
import {Text} from '~/ui/Text/Text'
import {TextInput} from '~/ui/TextInput/TextInput'

type RouteParams = {
  parentWalletId: string
  parentWalletRootKey?: string
  sharedWalletKey: Wallet.Bip32PublicKeyHex
  parentWalletImplementation: Wallet.Implementation
  accountVisual: number
  coSigners: ReadonlyArray<Wallet.CoSigner>
  quorumRules: Wallet.QuorumRules
  walletName?: string
}

export const ReviewMultisigWalletScreen = () => {
  const strings = useStrings()
  const {palette: p} = useTheme()
  const navigation = useNavigation<SetupWalletRouteNavigation>()
  const route = useRoute()
  const storage = useAsyncStorage()
  const {walletManager} = useWalletManager()
  const [walletName, setWalletName] = React.useState(initialWalletName || '')
  const [password, setPassword] = React.useState('')
  const [passwordConfirmation, setPasswordConfirmation] = React.useState('')

  const params = (route.params as RouteParams) || {}
  const {
    coSigners,
    quorumRules,
    parentWalletId,
    parentWalletImplementation,
    accountVisual,
    parentWalletRootKey,
    walletName: initialWalletName,
  } = params

  const {
    createWallet,
    isPending,
    isSuccess: isCreateWalletSuccess,
  } = useCreateMultisigWallet({
    onSuccess: async (wallet) => {
      const walletStorage = storage.join('wallet/')
      const walletMeta = await walletStorage.getItem(wallet.id, parseWalletMeta)

      if (!walletMeta) {
        const error = new Error(
          'ReviewMultisigWalletScreen: wallet meta is invalid, reached an invalid state.',
        )
        logger.error(error)
        throw error
      }

      navigation.navigate('setup-wallet-preparing-wallet')
    },
    onError: (error) => {
      InteractionManager.runAfterInteractions(() => {
        showErrorDialog(errorMessages.generalError, undefined, {
          message: error.message,
        })
      })
    },
  })

  const nameErrors = !isCreateWalletSuccess
    ? walletManager.validateWalletName(walletName)
    : null
  const walletNameErrorText = getWalletNameError(
    {
      tooLong: strings.setupWallet.tooLong,
      nameAlreadyTaken: strings.setupWallet.nameAlreadyTaken,
      mustBeFilled: strings.setupWallet.mustBeFilled,
    },
    nameErrors,
  )

  const passwordErrors = React.useMemo(() => {
    if (!password) return {}
    if (password.length < 8) return {passwordIsWeak: true}
    if (password !== passwordConfirmation) return {matchesConfirmation: true}
    return {}
  }, [password, passwordConfirmation])

  const passwordErrorText =
    passwordErrors.passwordIsWeak && !isPending
      ? strings.setupWallet.passwordStrengthRequirement(8)
      : undefined
  const passwordConfirmationErrorText =
    passwordErrors.matchesConfirmation && !isPending
      ? strings.setupWallet.repeatPasswordInputError
      : undefined

  const disabled =
    isPending ||
    Object.keys(nameErrors ?? {}).length > 0 ||
    Object.keys(passwordErrors).length > 0 ||
    !walletName.trim() ||
    !password ||
    !passwordConfirmation

  const handleCreateWallet = React.useCallback(() => {
    if (!parentWalletRootKey) {
      showErrorDialog(errorMessages.generalError, undefined, {
        message: 'Parent wallet root key is required',
      })
      return
    }

    createWallet({
      name: walletName.trim() || 'Multisig Wallet',
      coSigners,
      quorumRules,
      parentWalletIds: [parentWalletId],
      parentWalletRootKeys: [
        {
          walletId: parentWalletId,
          rootKeyHex: parentWalletRootKey,
          accountVisual,
          implementation: parentWalletImplementation,
        },
      ],
    })
  }, [
    createWallet,
    walletName,
    coSigners,
    quorumRules,
    parentWalletId,
    accountVisual,
    parentWalletImplementation,
    parentWalletRootKey,
  ])

  const quorumDescription = React.useMemo(() => {
    if (quorumRules.kind === 'RequireAllOf') {
      return `All ${coSigners.length} co-signers must sign`
    }
    if (quorumRules.kind === 'RequireAnyOf') {
      return 'Any 1 co-signer can sign'
    }
    return `${quorumRules.required} of ${coSigners.length} co-signers must sign`
  }, [quorumRules, coSigners.length])

  return (
    <SafeArea>
      <Space.Height.lg />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[a.px_lg, a.pb_lg]}
      >
        <View style={[a.gap_md]}>
          <Text style={[a.heading_1_medium]}>
            {strings.setupWallet.reviewMultisigWalletTitle}
          </Text>

          <Space.Height.md />

          {/* Wallet name */}
          <TextInput
            label={strings.setupWallet.walletNameInputLabel}
            value={walletName}
            onChangeText={setWalletName}
            errorText={walletNameErrorText || undefined}
            autoFocus
            testID="multisig-wallet-name-input"
          />

          {/* Password */}
          <TextInput
            label={strings.setupWallet.passwordInputLabel}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            errorText={passwordErrorText}
            testID="multisig-wallet-password-input"
          />

          {/* Password confirmation */}
          <TextInput
            label={strings.setupWallet.repeatPasswordInputLabel}
            value={passwordConfirmation}
            onChangeText={setPasswordConfirmation}
            secureTextEntry
            errorText={passwordConfirmationErrorText}
            testID="multisig-wallet-password-confirmation-input"
          />

          <Space.Height.lg />

          {/* Review section */}
          <View style={[a.gap_sm]}>
            <Text style={[a.heading_3_medium]}>
              {strings.setupWallet.walletConfiguration}
            </Text>

            <View style={[a.p_md, {backgroundColor: p.gray_50}, a.rounded_sm]}>
              <Text style={[a.body_1_lg_medium]}>
                {strings.setupWallet.coSignersCount}: {coSigners.length}
              </Text>
              <Space.Height.xs />
              {coSigners.map((cs, index) => (
                <Text
                  key={index}
                  style={[a.body_2_md_regular, {color: p.gray_600}]}
                >
                  • {cs.name}
                </Text>
              ))}
            </View>

            <View style={[a.p_md, {backgroundColor: p.gray_50}, a.rounded_sm]}>
              <Text style={[a.body_1_lg_medium]}>
                {strings.setupWallet.quorumRules}: {quorumRules.kind}
              </Text>
              <Space.Height.xs />
              <Text style={[a.body_2_md_regular, {color: p.gray_600}]}>
                {quorumDescription}
              </Text>
            </View>
          </View>

          <Space.Height.lg />

          <Button
            title={strings.setupWallet.createWalletButton}
            onPress={handleCreateWallet}
            disabled={disabled}
            testID="create-multisig-wallet-final-button"
          />

          {isPending && (
            <View style={[a.align_center, a.justify_center, a.py_lg]}>
              <ActivityIndicator size="large" />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeArea>
  )
}
