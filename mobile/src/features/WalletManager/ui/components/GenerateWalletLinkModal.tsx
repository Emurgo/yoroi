import {linksCardanoModuleMaker} from '@yoroi/links'
import {atoms as a, useTheme} from '@yoroi/theme'

import * as Clipboard from 'expo-clipboard'
import * as React from 'react'
import {TextInput as RNTextInput, ScrollView, Text, View} from 'react-native'

import {useSelectedWallet} from '@yoroi/wallet-manager/hooks/useSelectedWallet'
import {makeWalletEncryptedStorage} from '~/kernel/storage/EncryptedStorage'
import {Button, ButtonType} from '~/ui/Button/Button'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'
import {ShareQRCodeCard} from '~/ui/ShareQRCodeCard/ShareQRCodeCard'
import {Space} from '~/ui/Space/Space'
import {TextInput} from '~/ui/TextInput/TextInput'

type WalletLinkType = 'full-rootKey' | 'readonly'

export const GenerateWalletLinkModal = () => {
  const {wallet, meta} = useSelectedWallet()
  const {closeModal} = useModal()
  const {atoms: ta} = useTheme()

  const [showSecurityWarning, setShowSecurityWarning] = React.useState(true)
  const [linkType, setLinkType] = React.useState<WalletLinkType | null>(null)
  const [password, setPassword] = React.useState('')
  const [generatedLink, setGeneratedLink] = React.useState<string | null>(null)
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const passwordRef = React.useRef<RNTextInput>(null)

  // Show security warning as part of the modal content
  if (showSecurityWarning) {
    return (
      <Modal.Content>
        <ScrollView style={[a.flex_1]} contentContainerStyle={[a.gap_lg]}>
          <View>
            <Text style={[a.heading_3_medium, ta.text_primary_max]}>
              Security Warning
            </Text>
          </View>

          <Text style={[a.body_1_lg_regular, ta.text_primary_max]}>
            You are about to generate a wallet link or QR code containing
            sensitive wallet data.
          </Text>
          <Space.Height.md />
          <Text style={[a.body_1_lg_regular, ta.text_primary_max]}>
            ⚠️ Security Risks:
          </Text>
          <Space.Height.xs />
          <Text style={[a.body_1_lg_regular, ta.text_primary_max]}>
            • Anyone with this link can access your wallet
          </Text>
          <Text style={[a.body_1_lg_regular, ta.text_primary_max]}>
            • QR codes can be photographed
          </Text>
          <Text style={[a.body_1_lg_regular, ta.text_primary_max]}>
            • Links may be stored in browser history
          </Text>
          <Text style={[a.body_1_lg_regular, ta.text_primary_max]}>
            • Sensitive data (mnemonic/root key) is in plaintext
          </Text>
          <Space.Height.md />
          <Text style={[a.body_1_lg_regular, ta.text_primary_max]}>
            By continuing, you acknowledge these risks.
          </Text>

          <Button
            title="I Understand, Continue"
            onPress={() => setShowSecurityWarning(false)}
            type={ButtonType.Primary}
          />
        </ScrollView>
      </Modal.Content>
    )
  }

  const handleGenerateFullWalletLink = async () => {
    if (!password) {
      setError('Password is required')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const encryptedStorage = makeWalletEncryptedStorage(wallet.id)
      const rootKeyResult = await encryptedStorage.xpriv.read(password)
      const rootKeyHex = rootKeyResult.value

      const cardanoLinks = linksCardanoModuleMaker()
      const link = cardanoLinks.create({
        config: {
          scheme: 'web+cardano',
          authority: 'wallet',
          version: 'v1',
          rules: {
            requiredParams: ['type'],
            optionalParams: [
              'mnemonic',
              'rootKey',
              'accountPubKey',
              'encryption',
              'name',
              'implementation',
              'addressMode',
              'accountVisual',
            ],
            forbiddenParams: [],
            extraParams: 'drop',
          },
        },
        params: {
          type: 'full',
          rootKey: rootKeyHex,
          encryption: 'plain',
          name: meta.name,
          implementation: meta.implementation,
          addressMode: meta.addressMode,
          accountVisual: wallet.accountVisual.toString(),
        },
      })

      setGeneratedLink(link.link)
      setLinkType('full-rootKey')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate link')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateReadOnlyLink = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      const encryptedStorage = makeWalletEncryptedStorage(wallet.id)
      const accountPubKeyHex = await encryptedStorage.xpub.read(
        wallet.accountVisual,
      )

      if (!accountPubKeyHex) {
        throw new Error('Account public key not found')
      }

      const cardanoLinks = linksCardanoModuleMaker()
      const link = cardanoLinks.create({
        config: {
          scheme: 'web+cardano',
          authority: 'wallet',
          version: 'v1',
          rules: {
            requiredParams: ['type'],
            optionalParams: [
              'mnemonic',
              'rootKey',
              'accountPubKey',
              'encryption',
              'name',
              'implementation',
              'addressMode',
              'accountVisual',
            ],
            forbiddenParams: [],
            extraParams: 'drop',
          },
        },
        params: {
          type: 'readonly',
          accountPubKey: accountPubKeyHex,
          encryption: 'plain',
          name: meta.name,
          implementation: meta.implementation,
          addressMode: meta.addressMode,
          accountVisual: wallet.accountVisual.toString(),
        },
      })

      setGeneratedLink(link.link)
      setLinkType('readonly')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate link')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopyLink = async () => {
    if (generatedLink) {
      await Clipboard.setStringAsync(generatedLink)
    }
  }

  if (generatedLink) {
    return (
      <Modal.Content>
        <ScrollView style={[a.flex_1]} contentContainerStyle={[a.gap_lg]}>
          <View>
            <Text style={[a.heading_3_medium, ta.text_primary_max]}>
              Wallet Link Generated
            </Text>
            <Space.Height.sm />
            <Text style={[a.body_1_lg_regular, ta.text_gray_max]}>
              {linkType === 'full-rootKey'
                ? 'Full Wallet (Root Key)'
                : 'Read-Only Wallet'}
            </Text>
          </View>

          <ShareQRCodeCard
            qrContent={generatedLink}
            shareContent={generatedLink}
            title="Wallet Link"
            onLongPress={() => {}}
            shareLabel="Share QR Code"
          />

          <Button
            title="Copy Link"
            onPress={handleCopyLink}
            type={ButtonType.Primary}
          />

          <Button
            title="Close"
            onPress={closeModal}
            type={ButtonType.Secondary}
          />
        </ScrollView>
      </Modal.Content>
    )
  }

  return (
    <Modal.Content>
      <ScrollView style={[a.flex_1]} contentContainerStyle={[a.gap_lg]}>
        <View>
          <Text style={[a.heading_3_medium, ta.text_primary_max]}>
            Generate Wallet Link
          </Text>
          <Space.Height.sm />
          <Text style={[a.body_1_lg_regular, ta.text_gray_max]}>
            Choose the type of wallet link to generate
          </Text>
        </View>

        {error && (
          <View style={[a.p_md, ta.bg_color_min]}>
            <Text style={[a.body_1_lg_regular, ta.text_error]}>{error}</Text>
          </View>
        )}

        <Button
          title="Generate Full Wallet Link (Root Key)"
          onPress={() => setLinkType('full-rootKey')}
          type={ButtonType.Secondary}
        />

        {linkType === 'full-rootKey' && (
          <>
            <TextInput
              ref={passwordRef}
              secureTextEntry
              label="Enter Wallet Password"
              value={password}
              onChangeText={setPassword}
              returnKeyType="done"
              onSubmitEditing={handleGenerateFullWalletLink}
              autoComplete="off"
            />
            <Button
              title="Generate Link"
              onPress={handleGenerateFullWalletLink}
              disabled={!password || isGenerating}
              type={ButtonType.Primary}
            />
          </>
        )}

        <Button
          title="Generate Read-Only Wallet Link"
          onPress={handleGenerateReadOnlyLink}
          disabled={isGenerating}
          type={ButtonType.Secondary}
        />

        <Button
          title="Cancel"
          onPress={closeModal}
          type={ButtonType.Secondary}
        />
      </ScrollView>
    </Modal.Content>
  )
}
