/**
 * Multisig Wallet Details Screen
 * Shows co-signers, quorum rules, and allows exporting wallet setup JSON
 */
import {getMultisigMeta} from '@yoroi/cardano-wallet'
import {atoms as a, useTheme} from '@yoroi/theme'
import {useSelectedWallet} from '@yoroi/wallet-manager'

import * as Clipboard from 'expo-clipboard'
import * as FileSystem from 'expo-file-system'
import * as React from 'react'
import {Alert, ScrollView, View} from 'react-native'
import Share from 'react-native-share'

import {useStrings} from '~/kernel/i18n/useStrings'
import {Button, ButtonType} from '~/ui/Button/Button'
import {Icon} from '~/ui/Icon'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {Space} from '~/ui/Space/Space'
import {Text} from '~/ui/Text/Text'

// Note: We'll use JSON.stringify for now - serializeMultisigWalletSetupJSON may need to be created

export const MultisigWalletDetailsScreen = () => {
  const strings = useStrings()
  const {palette: p} = useTheme()
  const {wallet, meta} = useSelectedWallet()
  const [copied, setCopied] = React.useState(false)

  const multisigMeta = getMultisigMeta(wallet)

  // Always call hooks before early returns
  const handleExportWalletSetup = React.useCallback(async () => {
    if (!multisigMeta) return
    try {
      const walletSetup = {
        version: '1.0.0',
        metadata: {
          walletId: meta.id,
          walletName: meta.name,
          createdAt: new Date().toISOString(),
          network: 'cardano', // TODO: Get from wallet network manager
        },
        multisig: {
          coSigners: multisigMeta.coSigners,
          quorumRules: multisigMeta.quorumRules,
          paymentScriptCbor: multisigMeta.paymentScriptCbor,
          stakingScriptCbor: multisigMeta.stakingScriptCbor,
        },
      }

      const jsonString = JSON.stringify(walletSetup, null, 2)
      const fileName = `yoroi_multisig_wallet_setup_${meta.name}.json`
      const fileUri = FileSystem.documentDirectory + fileName

      await FileSystem.writeAsStringAsync(fileUri, jsonString, {
        encoding: FileSystem.EncodingType.UTF8,
      })

      await Share.open({
        url: fileUri,
        type: 'application/json',
        filename: fileName,
      })
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error
          ? error.message
          : 'Failed to export wallet setup',
      )
    }
  }, [multisigMeta, meta])

  const handleCopyJSON = React.useCallback(async () => {
    if (!multisigMeta) return
    try {
      const walletSetup = {
        version: '1.0.0',
        metadata: {
          walletId: meta.id,
          walletName: meta.name,
          createdAt: new Date().toISOString(),
          network: 'cardano', // TODO: Get from wallet network manager
        },
        multisig: {
          coSigners: multisigMeta.coSigners,
          quorumRules: multisigMeta.quorumRules,
          paymentScriptCbor: multisigMeta.paymentScriptCbor,
          stakingScriptCbor: multisigMeta.stakingScriptCbor,
        },
      }

      const jsonString = JSON.stringify(walletSetup, null, 2)
      await Clipboard.setStringAsync(jsonString)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to copy JSON',
      )
    }
  }, [multisigMeta, meta])

  if (!multisigMeta) {
    return (
      <SafeArea>
        <Space.Height.lg />
        <View style={[a.px_lg]}>
          <Text style={[a.heading_1_medium]}>
            {strings.setupWallet.notMultisigWallet}
          </Text>
          <Space.Height.md />
          <Text style={[a.body_1_lg_regular]}>
            {strings.setupWallet.selectMultisigWallet}
          </Text>
        </View>
      </SafeArea>
    )
  }

  const getQuorumDescription = () => {
    if (multisigMeta.quorumRules.kind === 'RequireAllOf') {
      return `All ${multisigMeta.coSigners.length} co-signers must sign`
    }
    if (multisigMeta.quorumRules.kind === 'RequireAnyOf') {
      return 'Any co-signer can sign'
    }
    if (multisigMeta.quorumRules.kind === 'RequireNOf') {
      return `${multisigMeta.quorumRules.required || multisigMeta.coSigners.length} of ${multisigMeta.coSigners.length} co-signers must sign`
    }
    return 'Unknown quorum rule'
  }

  return (
    <SafeArea>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[a.px_lg, a.pb_lg]}
      >
        <Space.Height.lg />

        <View style={[a.gap_md]}>
          <Text style={[a.heading_1_medium]}>{meta.name}</Text>

          <Space.Height.md />

          {/* Quorum Rules */}
          <View style={[a.p_md, {backgroundColor: p.gray_50}, a.rounded_sm]}>
            <Text style={[a.heading_3_medium]}>
              {strings.setupWallet.quorumRules}
            </Text>
            <Space.Height.sm />
            <Text style={[a.body_1_lg_regular]}>{getQuorumDescription()}</Text>
            <Space.Height.xs />
            <Text style={[a.body_2_md_regular, {color: p.gray_600}]}>
              Type: {multisigMeta.quorumRules.kind}
            </Text>
          </View>

          <Space.Height.md />

          {/* Co-Signers List */}
          <View style={[a.p_md, {backgroundColor: p.gray_50}, a.rounded_sm]}>
            <Text style={[a.heading_3_medium]}>
              {strings.setupWallet.coSigners} ({multisigMeta.coSigners.length})
            </Text>
            <Space.Height.sm />

            <View style={[a.gap_sm]}>
              {multisigMeta.coSigners.map((coSigner, index) => (
                <View
                  key={index}
                  style={[
                    a.p_sm,
                    {backgroundColor: p.gray_100},
                    a.rounded_xs,
                    a.flex_row,
                    a.align_center,
                    a.justify_between,
                  ]}
                >
                  <View style={[a.flex_1]}>
                    <Text style={[a.body_1_lg_medium]}>{coSigner.name}</Text>
                    <Space.Height.xs />
                    <Text
                      style={[a.body_2_md_regular, {fontFamily: 'monospace'}]}
                      numberOfLines={1}
                      ellipsizeMode="middle"
                    >
                      {coSigner.sharedWalletKey.substring(0, 20)}...
                    </Text>
                  </View>
                  <Icon.Wallet size={24} color={p.gray_600} />
                </View>
              ))}
            </View>
          </View>

          <Space.Height.lg />

          {/* Export Options */}
          <View style={[a.gap_md]}>
            <Text style={[a.heading_3_medium]}>
              {strings.setupWallet.exportWalletSetup}
            </Text>
            <Text style={[a.body_1_lg_regular]}>
              {strings.setupWallet.exportWalletSetupDescription}
            </Text>

            <Space.Height.md />

            <Button
              title={
                copied
                  ? strings.setupWallet.copied
                  : strings.setupWallet.copyJSON
              }
              onPress={handleCopyJSON}
              type={ButtonType.Secondary}
              testID="copy-wallet-setup-json-button"
            />

            <Button
              title={strings.setupWallet.shareWalletSetup}
              onPress={handleExportWalletSetup}
              testID="share-wallet-setup-button"
            />
          </View>
        </View>
      </ScrollView>
    </SafeArea>
  )
}
