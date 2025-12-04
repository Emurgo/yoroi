/**
 * Import Multisig Wallet Screen
 * Import multisig wallet from JSON setup file
 */

import {useWalletManager} from '@yoroi/wallet-manager'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Wallet} from '@yoroi/types'

import {useNavigation} from '@react-navigation/native'
import * as React from 'react'
import {
  ScrollView,
  View,
  Alert,
  ActivityIndicator,
  TextInput as RNTextInput,
} from 'react-native'
import * as FileSystem from 'expo-file-system'

import {useStrings} from '~/kernel/i18n/useStrings'
import {SetupWalletRouteNavigation} from '~/kernel/navigation/types'
import {Button} from '~/ui/Button/Button'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {Space} from '~/ui/Space/Space'
import {Text} from '~/ui/Text'
import {showErrorDialog} from '~/kernel/dialogs'
import {errorMessages} from '~/kernel/i18n/messages/global'
import {deriveMultisigAccount} from '@yoroi/cardano-wallet'
import {makeWalletEncryptedStorage} from '~/kernel/storage/EncryptedStorage'

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

export const ImportMultisigWalletScreen = () => {
  const strings = useStrings()
  const {atoms: ta} = useTheme()
  const navigation = useNavigation<SetupWalletRouteNavigation>()
  const {walletManager} = useWalletManager()
  const [importedData, setImportedData] = React.useState<MultisigWalletSetupJSON | null>(null)
  const [isValidating, setIsValidating] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [jsonInput, setJsonInput] = React.useState('')
  const [useFilePicker, setUseFilePicker] = React.useState(true)

  // Get current wallet to check if it matches any co-signer
  const currentWallet = React.useMemo(() => {
    const selectedWalletId = walletManager.selectedWalletId
    if (!selectedWalletId) return null
    return walletManager.getWalletById(selectedWalletId) || null
  }, [walletManager])

  const parseAndValidateJSON = React.useCallback((jsonString: string) => {
    try {
      // Parse JSON
      const parsed = JSON.parse(jsonString) as MultisigWalletSetupJSON

      // Basic validation
      if (!parsed.multisig || !parsed.multisig.coSigners || !parsed.multisig.quorumRules) {
        setError('Invalid wallet setup JSON format')
        return
      }

      setImportedData(parsed)
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid JSON format'
      setError(errorMessage)
    }
  }, [])

  const handlePickFile = React.useCallback(async () => {
    try {
      // Try to use expo-document-picker if available
      // Otherwise fall back to manual JSON input
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const DocumentPicker = require('expo-document-picker')
        const result = await DocumentPicker.getDocumentAsync({
          type: ['application/json', 'text/json', '*.json'],
          copyToCacheDirectory: true,
        })

        if (result.canceled) return

        const fileUri = result.assets[0]?.uri
        if (!fileUri) {
          setError('No file selected')
          return
        }

        // Read file content
        const fileContent = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.UTF8,
        })

        parseAndValidateJSON(fileContent)
      } catch (pickerError) {
        // Document picker not available, use manual input
        setUseFilePicker(false)
        setError('File picker not available. Please paste JSON manually.')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to import file'
      setError(errorMessage)
      showErrorDialog(errorMessages.generalError, undefined, {
        message: errorMessage,
      })
    }
  }, [parseAndValidateJSON])

  const handlePasteJSON = React.useCallback(() => {
    if (!jsonInput.trim()) {
      setError('Please paste JSON content')
      return
    }

    parseAndValidateJSON(jsonInput.trim())
  }, [jsonInput, parseAndValidateJSON])

  const handleValidateAndImport = React.useCallback(async () => {
    if (!importedData || !currentWallet) {
      setError('No wallet setup imported or no wallet selected')
      return
    }

    setIsValidating(true)
    setError(null)

    try {
      // Check if current wallet matches any co-signer
      // We need to derive the shared wallet key from the current wallet
      const currentWalletMeta = walletManager.getWalletMetaById(currentWallet.id)
      if (!currentWalletMeta) {
        throw new Error('Current wallet metadata not found')
      }

      // Get root key (requires password - will prompt later)
      // For now, we'll navigate to a validation screen that prompts for password
      navigation.navigate('setup-wallet-multisig-validate-cosigner', {
        importedWalletSetup: importedData,
        currentWalletId: currentWallet.id,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to validate wallet setup'
      setError(errorMessage)
      showErrorDialog(errorMessages.generalError, undefined, {
        message: errorMessage,
      })
    } finally {
      setIsValidating(false)
    }
  }, [importedData, currentWallet, walletManager, navigation])

  if (!currentWallet) {
    return (
      <SafeArea>
        <Space.Height.lg />
        <View style={[a.px_lg]}>
          <Text style={[ta.heading_1]}>
            {strings.setupWallet.noWalletSelected || 'No Wallet Selected'}
          </Text>
          <Space.Height.md />
          <Text style={[ta.body_1_lg_regular]}>
            {strings.setupWallet.selectWalletToImport ||
              'Please select a wallet first to import the multisig wallet.'}
          </Text>
          <Space.Height.lg />
          <Button
            title={strings.global.back || 'Back'}
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
          <Text style={[ta.heading_1]}>
            {strings.setupWallet.importMultisigWalletTitle || 'Import Multisig Wallet'}
          </Text>

          <Space.Height.md />

          <Text style={[ta.body_1_lg_regular]}>
            {strings.setupWallet.importMultisigWalletDescription ||
              'Import a multisig wallet setup JSON file. Make sure you are one of the co-signers for this wallet.'}
          </Text>

          <Space.Height.lg />

          {!importedData ? (
            <>
              {useFilePicker ? (
                <Button
                  title={strings.setupWallet.selectJSONFile || 'Select JSON File'}
                  onPress={handlePickFile}
                  testID="select-json-file-button"
                />
              ) : (
                <>
                  <Text style={[ta.body_1_lg_regular]}>
                    {strings.setupWallet.pasteJSONManually ||
                      'Paste the wallet setup JSON below:'}
                  </Text>
                  <RNTextInput
                    style={[
                      a.p_md,
                      a.border,
                      a.rounded_sm,
                      {minHeight: 200, textAlignVertical: 'top'},
                    ]}
                    value={jsonInput}
                    onChangeText={setJsonInput}
                    placeholder="Paste JSON here..."
                    multiline
                    testID="json-input"
                  />
                  <Button
                    title={strings.setupWallet.parseJSON || 'Parse JSON'}
                    onPress={handlePasteJSON}
                    testID="parse-json-button"
                  />
                </>
              )}

              {error && (
                <>
                  <Space.Height.sm />
                  <Text style={[ta.body_1_lg_medium, {color: ta.error.color}]}>
                    {error}
                  </Text>
                </>
              )}
            </>
          ) : (
            <>
              <View style={[a.p_md, a.bg_success_light, a.rounded_sm]}>
                <Text style={[ta.body_1_lg_medium]}>
                  {strings.setupWallet.fileImported || 'File imported successfully!'}
                </Text>
                <Space.Height.xs />
                <Text style={[ta.body_2_md_regular]}>
                  {strings.setupWallet.walletName || 'Wallet Name'}: {importedData.metadata.walletName}
                </Text>
                <Space.Height.xs />
                <Text style={[ta.body_2_md_regular]}>
                  {strings.setupWallet.coSignersCount || 'Co-Signers'}: {importedData.multisig.coSigners.length}
                </Text>
              </View>

              <Space.Height.lg />

              <Button
                title={
                  strings.setupWallet.validateAndImport || 'Validate & Import'
                }
                onPress={handleValidateAndImport}
                disabled={isValidating}
                testID="validate-and-import-button"
              />

              {isValidating && (
                <View style={[a.items_center, a.justify_center, a.py_lg]}>
                  <ActivityIndicator size="large" />
                </View>
              )}

              <Space.Height.md />

              <Button
                title={strings.setupWallet.selectDifferentFile || 'Select Different File'}
                onPress={() => {
                  setImportedData(null)
                  setError(null)
                }}
                outline
                testID="select-different-file-button"
              />
            </>
          )}
        </View>
      </ScrollView>
    </SafeArea>
  )
}

