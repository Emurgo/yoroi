/**
 * Generate Shared Key Screen
 * Generate shared wallet key from parent wallet
 */
import {deriveMultisigAccount} from '@yoroi/cardano-wallet'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Wallet} from '@yoroi/types'
import {useWalletManager} from '@yoroi/wallet-manager'

import {useNavigation, useRoute} from '@react-navigation/native'
import * as React from 'react'
import {ActivityIndicator, ScrollView, View} from 'react-native'

import {showErrorDialog} from '~/kernel/dialogs'
import {errorMessages} from '~/kernel/i18n/messages/global'
import {useStrings} from '~/kernel/i18n/useStrings'
import {SetupWalletRouteNavigation} from '~/kernel/navigation/types'
import {makeWalletEncryptedStorage} from '~/kernel/storage/EncryptedStorage'
import {Button} from '~/ui/Button/Button'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {Space} from '~/ui/Space/Space'
import {Text} from '~/ui/Text/Text'
import {TextInput} from '~/ui/TextInput/TextInput'

type RouteParams = {
  parentWalletId?: string
}

export const GenerateSharedKeyScreen = () => {
  const strings = useStrings()
  const {palette: p} = useTheme()
  const navigation = useNavigation<SetupWalletRouteNavigation>()
  const route = useRoute()
  const {walletManager} = useWalletManager()
  const [password, setPassword] = React.useState('')
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [sharedKey, setSharedKey] =
    React.useState<Wallet.Bip32PublicKeyHex | null>(null)
  const [parentRootKey, setParentRootKey] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const params = (route.params as RouteParams) || {}
  const parentWalletId = params.parentWalletId

  // Get parent wallet metadata
  const parentWalletMeta = React.useMemo(() => {
    if (!parentWalletId) return null
    return walletManager.walletMetas.get(parentWalletId) || null
  }, [parentWalletId, walletManager.walletMetas])

  const handleGenerate = React.useCallback(async () => {
    if (!parentWalletId || !parentWalletMeta) {
      setError('Parent wallet not selected')
      return
    }

    if (!password) {
      setError('Password is required')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      // Get root key from encrypted storage
      const encryptedStorage = makeWalletEncryptedStorage(parentWalletId)
      const rootKeyResult = await encryptedStorage.xpriv.read(password)
      const rootKeyHex = rootKeyResult.value

      // Store root key for later use (will be passed through navigation)
      setParentRootKey(rootKeyHex)

      // Derive shared wallet key
      const derivation = await deriveMultisigAccount({
        rootKeyHex,
        accountVisual: 0, // Use account 0 for multisig
        implementation: parentWalletMeta.implementation,
      })

      setSharedKey(derivation.sharedWalletKey)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to generate shared key'
      setError(errorMessage)
      showErrorDialog(errorMessages.generalError, undefined, {
        message: errorMessage,
      })
    } finally {
      setIsGenerating(false)
    }
  }, [parentWalletId, parentWalletMeta, password])

  const handleContinue = React.useCallback(() => {
    if (!sharedKey || !parentWalletId || !parentWalletMeta || !parentRootKey)
      return

    navigation.navigate('setup-wallet-multisig-add-cosigners', {
      parentWalletId,
      parentWalletRootKey: parentRootKey,
      sharedWalletKey: sharedKey,
      parentWalletImplementation: parentWalletMeta.implementation,
      accountVisual: 0,
    })
  }, [sharedKey, parentWalletId, parentWalletMeta, parentRootKey, navigation])

  if (!parentWalletMeta) {
    return (
      <SafeArea>
        <Space.Height.lg />
        <View style={[a.px_lg]}>
          <Text style={[a.heading_1_medium]}>
            {strings.setupWallet.parentWalletNotFound}
          </Text>
          <Space.Height.md />
          <Button
            title={strings.global.cancel}
            onPress={() => navigation.goBack()}
          />
        </View>
      </SafeArea>
    )
  }

  return (
    <SafeArea>
      <Space.Height.lg />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[a.px_lg, a.pb_lg]}
      >
        <View style={[a.gap_md]}>
          <Text style={[a.heading_1_medium]}>
            {strings.setupWallet.generateSharedKeyTitle}
          </Text>

          <Space.Height.md />

          <Text style={[a.body_1_lg_regular]}>
            {strings.setupWallet.generateSharedKeyDescription}
          </Text>

          <Space.Height.lg />

          <TextInput
            label={strings.setupWallet.passwordInputLabel}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoFocus
            testID="parent-wallet-password-input"
          />

          {error && (
            <>
              <Space.Height.sm />
              <Text style={[a.body_1_lg_medium, {color: p.gray_max}]}>
                {error}
              </Text>
            </>
          )}

          <Space.Height.lg />

          {!sharedKey || !parentRootKey ? (
            <Button
              title={strings.setupWallet.generateSharedKeyButton}
              onPress={handleGenerate}
              disabled={!password || isGenerating}
              testID="generate-shared-key-button"
            />
          ) : (
            <>
              <View
                style={[
                  a.p_md,
                  a.rounded_sm,
                  {backgroundColor: p.secondary_100},
                ]}
              >
                <Text style={[a.body_1_lg_medium]}>
                  {strings.setupWallet.sharedKeyGenerated}
                </Text>
                <Space.Height.sm />
                <Text
                  style={[a.body_2_md_regular, {fontFamily: 'monospace'}]}
                  numberOfLines={3}
                  ellipsizeMode="middle"
                >
                  {sharedKey}
                </Text>
              </View>

              <Space.Height.lg />

              <Button
                title={strings.global.proceed}
                onPress={handleContinue}
                testID="continue-after-shared-key-button"
              />
            </>
          )}

          {isGenerating && (
            <View style={[a.align_center, a.justify_center, a.py_lg]}>
              <ActivityIndicator size="large" />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeArea>
  )
}
