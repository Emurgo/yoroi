/**
 * Share Wallet Details Screen
 * Export wallet setup JSON for sharing with co-signers
 */
import {createMultisigWalletLink} from '@yoroi/cardano-wallet'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Wallet} from '@yoroi/types'

import {useNavigation, useRoute} from '@react-navigation/native'
import * as Clipboard from 'expo-clipboard'
import * as FileSystem from 'expo-file-system'
import * as React from 'react'
import {Alert, ScrollView, View} from 'react-native'
import Share from 'react-native-share'

import {useStrings} from '~/kernel/i18n/useStrings'
import {logger} from '~/kernel/logger/logger'
import {SetupWalletRouteNavigation} from '~/kernel/navigation/types'
import {Button, ButtonType} from '~/ui/Button/Button'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {Space} from '~/ui/Space/Space'
import {Text} from '~/ui/Text/Text'

type RouteParams = {
  walletId: string
  walletMeta: Wallet.Meta
}

type MultisigWalletSetupJSON = {
  version: string
  metadata: {
    walletId: string
    walletName: string
    createdAt: string
    network: string
  }
  multisig: {
    coSigners: ReadonlyArray<Wallet.CoSigner>
    quorumRules: Wallet.QuorumRules
    paymentScriptCbor: Wallet.ScriptCbor
    stakingScriptCbor: Wallet.ScriptCbor
  }
}

export const ShareWalletDetailsScreen = () => {
  const strings = useStrings()
  const {palette: p} = useTheme()
  const navigation = useNavigation<SetupWalletRouteNavigation>()
  const route = useRoute()

  const params = (route.params as RouteParams) || {}
  const {walletId, walletMeta} = params

  const multisigMeta = walletMeta.multisigMeta

  // Always call hooks before early returns
  const walletSetupJSON: MultisigWalletSetupJSON | null = React.useMemo(() => {
    if (!multisigMeta) return null
    return {
      version: '1.0.0',
      metadata: {
        walletId,
        walletName: walletMeta.name,
        createdAt: new Date().toISOString(),
        network: 'cardano', // TODO: Get from wallet meta
      },
      multisig: {
        coSigners: multisigMeta.coSigners.map((cs) => ({
          name: cs.name,
          sharedWalletKey: cs.sharedWalletKey,
        })) as unknown as ReadonlyArray<Wallet.CoSigner>,
        quorumRules: multisigMeta.quorumRules,
        paymentScriptCbor: multisigMeta.paymentScriptCbor as Wallet.ScriptCbor,
        stakingScriptCbor: multisigMeta.stakingScriptCbor as Wallet.ScriptCbor,
      },
    } as MultisigWalletSetupJSON
  }, [multisigMeta, walletId, walletMeta.name])

  const jsonString = React.useMemo(
    () => (walletSetupJSON ? JSON.stringify(walletSetupJSON, null, 2) : ''),
    [walletSetupJSON],
  )

  // Generate restoration link/QR code
  const restorationLink = React.useMemo(() => {
    if (!walletSetupJSON) return null
    try {
      return createMultisigWalletLink({
        multisigSetup: walletSetupJSON,
        name: walletMeta.name,
      })
    } catch (error) {
      logger.error('Failed to create multisig wallet link', {error})
      return null
    }
  }, [walletSetupJSON, walletMeta.name])

  const handleShare = React.useCallback(async () => {
    if (!jsonString) return
    try {
      const fileName = `multisig-wallet-${walletMeta.name.replace(/\s+/g, '-')}-${walletId.substring(0, 8)}.json`
      const fileUri = `${FileSystem.documentDirectory}${fileName}`

      // Write JSON to file
      await FileSystem.writeAsStringAsync(fileUri, jsonString, {
        encoding: FileSystem.EncodingType.UTF8,
      })

      // Share file using react-native-share
      await Share.open({
        url: `file://${fileUri}`,
        type: 'application/json',
        title: strings.setupWallet.shareWalletSetup,
      })
    } catch (error) {
      // User cancelled or error occurred - ignore cancellation
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = String(error.message)
        if (!errorMessage.includes('User did not share')) {
          Alert.alert(strings.setupWallet.shareError, errorMessage)
        }
      }
    }
  }, [jsonString, walletMeta.name, walletId, strings])

  const handleCopyJSON = React.useCallback(async () => {
    if (!jsonString) return
    try {
      await Clipboard.setStringAsync(jsonString)
      Alert.alert(
        strings.setupWallet.copied,
        strings.setupWallet.walletSetupCopied,
      )
    } catch (error) {
      Alert.alert(
        strings.setupWallet.copyError,
        error instanceof Error ? error.message : 'Failed to copy wallet setup',
      )
    }
  }, [jsonString, strings])

  const handleCopyLink = React.useCallback(async () => {
    if (!restorationLink) {
      Alert.alert(
        strings.setupWallet.copyError,
        'Failed to generate restoration link',
      )
      return
    }

    try {
      await Clipboard.setStringAsync(restorationLink)
      Alert.alert(
        strings.setupWallet.copied,
        'Restoration link copied to clipboard',
      )
    } catch (error) {
      Alert.alert(
        strings.setupWallet.copyError,
        error instanceof Error ? error.message : 'Failed to copy link',
      )
    }
  }, [restorationLink, strings])

  if (!multisigMeta) {
    // This screen should only be accessed for multisig wallets
    return null
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
            {strings.setupWallet.shareWalletDetailsTitle}
          </Text>

          <Space.Height.md />

          <Text style={[a.body_1_lg_regular]}>
            {strings.setupWallet.shareWalletDetailsDescription}
          </Text>

          <Space.Height.lg />

          {/* Wallet info summary */}
          <View style={[a.p_md, {backgroundColor: p.gray_50}, a.rounded_sm]}>
            <Text style={[a.body_1_lg_medium]}>
              {strings.setupWallet.walletName}: {walletMeta.name}
            </Text>
            <Space.Height.xs />
            <Text style={[a.body_1_lg_medium]}>
              {strings.setupWallet.coSignersCount}:{' '}
              {multisigMeta.coSigners.length}
            </Text>
            <Space.Height.xs />
            <Text style={[a.body_1_lg_medium]}>
              {strings.setupWallet.quorumRules}: {multisigMeta.quorumRules.kind}
              {multisigMeta.quorumRules.kind === 'RequireNOf' &&
                ` (${multisigMeta.quorumRules.required} of ${multisigMeta.coSigners.length})`}
            </Text>
          </View>

          <Space.Height.lg />

          {/* Action buttons */}
          <Button
            title={strings.setupWallet.shareWalletSetup}
            onPress={handleShare}
            testID="share-wallet-setup-button"
          />

          <Button
            title={strings.setupWallet.copyJSON}
            onPress={handleCopyJSON}
            type={ButtonType.Secondary}
            testID="copy-json-button"
          />

          {restorationLink && (
            <>
              <Space.Height.md />
              <Button
                title="Copy Restoration Link"
                onPress={handleCopyLink}
                type={ButtonType.Secondary}
                testID="copy-link-button"
              />
              <Space.Height.xs />
              <Text style={[a.body_2_md_regular, {color: p.gray_max}]}>
                Share this link or QR code with co-signers. They can open it in
                Yoroi to restore the multisig wallet.
              </Text>
            </>
          )}

          <Space.Height.lg />

          {/* JSON preview */}
          <View style={[a.gap_sm]}>
            <Text style={[a.heading_3_medium]}>
              {strings.setupWallet.walletSetupJSON}
            </Text>
            <View style={[a.p_md, {backgroundColor: p.gray_100}, a.rounded_sm]}>
              <Text
                style={[
                  a.body_2_md_regular,
                  {fontFamily: 'monospace', fontSize: 10},
                ]}
                numberOfLines={10}
              >
                {jsonString}
              </Text>
            </View>
          </View>

          <Space.Height.lg />

          <Button
            title={strings.global.close}
            onPress={() => navigation.navigate('setup-wallet-preparing-wallet')}
            testID="done-after-share-button"
          />
        </View>
      </ScrollView>
    </SafeArea>
  )
}
