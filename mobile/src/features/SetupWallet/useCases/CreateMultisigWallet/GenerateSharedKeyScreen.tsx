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
import Share from 'react-native-share'

import {showErrorDialog} from '~/kernel/dialogs'
import {errorMessages} from '~/kernel/i18n/messages/global'
import {useStrings} from '~/kernel/i18n/useStrings'
import {SetupWalletRouteNavigation} from '~/kernel/navigation/types'
import {makeWalletEncryptedStorage} from '~/kernel/storage/EncryptedStorage'
import {Button, ButtonType} from '~/ui/Button/Button'
import {Copiable} from '~/ui/Copiable/Copiable'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {ShareQRCodeCard} from '~/ui/ShareQRCodeCard/ShareQRCodeCard'
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
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [sharedKey, setSharedKey] =
    React.useState<Wallet.Bip32PublicKeyHex | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [showQRCode, setShowQRCode] = React.useState(false)
  const [needsPassword, setNeedsPassword] = React.useState(false)
  const [password, setPassword] = React.useState('')

  const params = (route.params as RouteParams) || {}
  const parentWalletId = params.parentWalletId

  // Get parent wallet metadata
  const parentWalletMeta = React.useMemo(() => {
    if (!parentWalletId) return null
    return walletManager.walletMetas.get(parentWalletId) || null
  }, [parentWalletId, walletManager.walletMetas])

  // Auto-generate shared key on mount (no password needed)
  React.useEffect(() => {
    if (!parentWalletMeta || sharedKey || isGenerating) return

    const generateKey = async () => {
      if (!parentWalletId || !parentWalletMeta) return

      setIsGenerating(true)
      setError(null)

      try {
        // Get shared wallet key from public storage (no password needed)
        // This key was derived and stored when the account was created
        const encryptedStorage = makeWalletEncryptedStorage(parentWalletId)
        let sharedKeyHex = await encryptedStorage.multisigSharedKey.read(0)

        // If not found, this is an older wallet - we'll need to derive it
        if (!sharedKeyHex) {
          setNeedsPassword(true)
          return
        }

        setSharedKey(sharedKeyHex as Wallet.Bip32PublicKeyHex)
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : strings.setupWallet.failedToGenerateSharedKey
        setError(errorMessage)
        showErrorDialog(errorMessages.generalError, undefined, {
          message: errorMessage,
        })
      } finally {
        setIsGenerating(false)
      }
    }

    generateKey()
  }, [
    parentWalletId,
    parentWalletMeta,
    sharedKey,
    isGenerating,
    strings.setupWallet.failedToGenerateSharedKey,
  ])

  const handleGenerate = React.useCallback(async () => {
    if (!parentWalletId || !parentWalletMeta) {
      setError(strings.setupWallet.parentWalletNotSelected)
      return
    }

    if (needsPassword && !password) {
      setError(strings.setupWallet.passwordRequiredForOlderWallets)
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const encryptedStorage = makeWalletEncryptedStorage(parentWalletId)
      let sharedKeyHex = await encryptedStorage.multisigSharedKey.read(0)

      // If not found, derive it from root key (for older wallets)
      if (!sharedKeyHex) {
        if (!password) {
          setError(strings.setupWallet.passwordRequired)
          setIsGenerating(false)
          return
        }

        const rootKeyResult = await encryptedStorage.xpriv.read(password)
        const rootKeyHex = rootKeyResult.value

        // Derive shared wallet key
        const derivation = await deriveMultisigAccount({
          rootKeyHex,
          accountVisual: 0,
          implementation: parentWalletMeta.implementation,
        })

        sharedKeyHex = derivation.sharedWalletKey

        // Store it for future use (no password needed next time)
        await encryptedStorage.multisigSharedKey.write(0, sharedKeyHex)

        setNeedsPassword(false)
        setPassword('')
      }

      setSharedKey(sharedKeyHex as Wallet.Bip32PublicKeyHex)
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : strings.setupWallet.failedToGenerateSharedKey
      setError(errorMessage)
      showErrorDialog(errorMessages.generalError, undefined, {
        message: errorMessage,
      })
    } finally {
      setIsGenerating(false)
    }
  }, [
    parentWalletId,
    parentWalletMeta,
    password,
    needsPassword,
    strings.setupWallet.failedToGenerateSharedKey,
    strings.setupWallet.parentWalletNotSelected,
    strings.setupWallet.passwordRequired,
    strings.setupWallet.passwordRequiredForOlderWallets,
  ])

  const handleShareKey = React.useCallback(async () => {
    if (!sharedKey) return

    try {
      await Share.open({
        message: strings.setupWallet.shareSharedWalletKeyMessage.replace(
          '{sharedKey}',
          sharedKey,
        ),
        title: strings.setupWallet.shareSharedWalletKeyTitle,
      })
    } catch {
      // User cancelled - ignore
    }
  }, [sharedKey, strings.setupWallet])

  const handleContinue = React.useCallback(() => {
    if (!sharedKey || !parentWalletId || !parentWalletMeta) return

    navigation.navigate('setup-wallet-multisig-add-cosigners', {
      parentWalletId,
      sharedWalletKey: sharedKey,
      parentWalletImplementation: parentWalletMeta.implementation,
      accountVisual: 0,
    })
  }, [sharedKey, parentWalletId, parentWalletMeta, navigation])

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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[a.px_lg, a.pb_lg]}
      >
        <View style={[a.gap_md]}>
          <Space.Height.lg />

          <Text style={[a.body_1_lg_regular]}>
            {strings.setupWallet.generateSharedKeyDescription}
          </Text>

          <Space.Height.lg />

          {!sharedKey ? (
            <>
              {needsPassword && (
                <>
                  <Text style={[a.body_1_lg_regular, {color: p.gray_600}]}>
                    {strings.setupWallet.olderWalletPasswordPrompt}
                  </Text>
                  <Space.Height.md />
                  <TextInput
                    label={strings.setupWallet.passwordInputLabel}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoFocus
                    testID="parent-wallet-password-input"
                  />
                  <Space.Height.md />
                </>
              )}

              {error && (
                <>
                  <Text style={[a.body_1_lg_medium, {color: p.gray_max}]}>
                    {error}
                  </Text>
                  <Space.Height.md />
                </>
              )}

              {isGenerating && (
                <View style={[a.align_center, a.justify_center, a.py_lg]}>
                  <ActivityIndicator size="large" />
                  <Space.Height.md />
                  <Text style={[a.body_1_lg_regular, {color: p.gray_600}]}>
                    {needsPassword
                      ? strings.setupWallet.derivingSharedKey
                      : strings.setupWallet.generatingSharedKey}
                  </Text>
                </View>
              )}
            </>
          ) : (
            <>
              <View
                style={[
                  a.p_md,
                  a.rounded_sm,
                  {backgroundColor: p.secondary_100},
                ]}
              >
                <View style={[a.flex_row, a.justify_between, a.align_center]}>
                  <Text style={[a.body_1_lg_medium]}>
                    {strings.setupWallet.sharedKeyGenerated}
                  </Text>
                  <Copiable
                    text={sharedKey}
                    feedback={strings.setupWallet.sharedKeyCopied}
                  />
                </View>
                <Space.Height.sm />
                <Text
                  style={[a.body_2_md_regular, {fontFamily: 'monospace'}]}
                  numberOfLines={3}
                  ellipsizeMode="middle"
                >
                  {sharedKey}
                </Text>
              </View>

              <Space.Height.md />

              <Text style={[a.body_2_md_regular, {color: p.gray_600}]}>
                {strings.setupWallet.shareKeyDescription}
              </Text>

              <Space.Height.md />

              {showQRCode ? (
                <ShareQRCodeCard
                  qrContent={sharedKey}
                  shareContent={sharedKey}
                  title={strings.setupWallet.mySharedWalletKey}
                  shareLabel={strings.setupWallet.shareQRCode}
                  onLongPress={() => {}}
                  testID="shared-key-qr-code"
                />
              ) : (
                <View style={[a.gap_sm]}>
                  <Button
                    title={strings.setupWallet.showQRCode}
                    onPress={() => setShowQRCode(true)}
                    type={ButtonType.Secondary}
                    testID="show-qr-code-button"
                  />
                  <Button
                    title={strings.setupWallet.shareKey}
                    onPress={handleShareKey}
                    type={ButtonType.Secondary}
                    testID="share-key-button"
                  />
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {!sharedKey ? (
        <SafeArea.Footer>
          <Button
            title={strings.setupWallet.generateSharedKeyButton}
            onPress={handleGenerate}
            disabled={isGenerating || (needsPassword && !password)}
            testID="generate-shared-key-button"
          />
        </SafeArea.Footer>
      ) : (
        <SafeArea.Footer>
          <Button
            title={strings.global.proceed}
            onPress={handleContinue}
            testID="continue-after-shared-key-button"
          />
        </SafeArea.Footer>
      )}
    </SafeArea>
  )
}
