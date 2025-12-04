/**
 * Co-Sign Transaction Screen
 * Import and sign multisig or multiparty transaction JSON files
 * Supports both multisig wallets (shared wallets) and multiparty transactions (multiple different wallets)
 */
import {
  deriveMultisigAccount,
  getMultisigMeta,
  isMultisigWallet,
} from '@yoroi/cardano-wallet'
import {getLogger} from '@yoroi/common'
import {atoms as a, useTheme} from '@yoroi/theme'
import {
  addWalletSignatureToTransactionJSON,
  parseMultipartyTransactionJSON,
  parseMultisigTransactionJSON,
  signMultisigTransaction,
} from '@yoroi/tx'
import {ScriptCbor} from '@yoroi/types'
import {useSelectedWallet} from '@yoroi/wallet-manager'

import {useNavigation} from '@react-navigation/native'
import type {StackNavigationProp} from '@react-navigation/stack'
import {Buffer} from 'buffer'
import * as FileSystem from 'expo-file-system'
import * as React from 'react'
import {
  ActivityIndicator,
  TextInput as RNTextInput,
  ScrollView,
  View,
} from 'react-native'

import {useFormattedTx} from '~/features/ReviewTx/common/hooks/useFormattedTx'
import {useTxBody} from '~/features/ReviewTx/common/hooks/useTxBody'
import {TransactionBody} from '~/features/ReviewTx/common/types'
import {showErrorDialog} from '~/kernel/dialogs'
import {errorMessages} from '~/kernel/i18n/messages/global'
import {useStrings} from '~/kernel/i18n/useStrings'
import {ReviewTxRoutes} from '~/kernel/navigation/types'
import {makeWalletEncryptedStorage} from '~/kernel/storage/EncryptedStorage'
import {Button, ButtonType} from '~/ui/Button/Button'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {Space} from '~/ui/Space/Space'
import {Text} from '~/ui/Text/Text'
import {TextInput} from '~/ui/TextInput/TextInput'

type TransactionType = 'multisig' | 'multiparty' | null

export const CoSignTransactionScreen = () => {
  const logger = getLogger()
  const navigation = useNavigation<StackNavigationProp<ReviewTxRoutes>>()
  const strings = useStrings()
  const {atoms: ta, palette: p} = useTheme()
  const {wallet, meta} = useSelectedWallet()
  const [importedTxJson, setImportedTxJson] = React.useState<string | null>(
    null,
  )
  const [transactionType, setTransactionType] =
    React.useState<TransactionType>(null)
  const [jsonInput, setJsonInput] = React.useState('')
  const [useFilePicker, setUseFilePicker] = React.useState(true)
  const [isSigning, setIsSigning] = React.useState(false)
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)

  const multisigMeta = getMultisigMeta(wallet)
  const isMultisig = isMultisigWallet(wallet) && multisigMeta !== null

  const parseAndValidateJSON = React.useCallback((jsonString: string) => {
    try {
      // Try to parse as multiparty first (more general)
      try {
        const multipartyParsed = parseMultipartyTransactionJSON(jsonString)
        setImportedTxJson(jsonString)
        setTransactionType('multiparty')
        setError(null)
        return {type: 'multiparty' as const, data: multipartyParsed}
      } catch {
        // If multiparty parsing fails, try multisig
        const multisigParsed = parseMultisigTransactionJSON(jsonString)
        setImportedTxJson(jsonString)
        setTransactionType('multisig')
        setError(null)
        return {type: 'multisig' as const, data: multisigParsed}
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Invalid JSON format'
      setError(errorMessage)
      throw err
    }
  }, [])

  const handlePickFile = React.useCallback(async () => {
    try {
      // Try to use expo-document-picker if available
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

        const fileContent = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.UTF8,
        })

        parseAndValidateJSON(fileContent)
      } catch (pickerError) {
        setUseFilePicker(false)
        setError('File picker not available. Please paste JSON manually.')
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to import file'
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

    try {
      parseAndValidateJSON(jsonInput.trim())
    } catch {
      // Error already set by parseAndValidateJSON
    }
  }, [jsonInput, parseAndValidateJSON])

  const handleSignTransaction = React.useCallback(async () => {
    if (!importedTxJson || !password || !transactionType) {
      setError('Password is required')
      return
    }

    setIsSigning(true)
    setError(null)

    try {
      if (transactionType === 'multisig') {
        // Multisig transaction signing
        if (!isMultisig || !multisigMeta) {
          throw new Error('This transaction requires a multisig wallet')
        }

        const txJson = parseMultisigTransactionJSON(importedTxJson)

        // Get parent wallet root key
        const parentWalletId = multisigMeta.parentWalletIds[0]
        if (!parentWalletId) {
          throw new Error('No parent wallet found')
        }

        const encryptedStorage = makeWalletEncryptedStorage(parentWalletId)
        const rootKeyResult = await encryptedStorage.xpriv.read(password)
        const rootKeyHex = rootKeyResult.value

        // Derive shared wallet key
        const derivation = await deriveMultisigAccount({
          rootKeyHex,
          accountVisual: 0,
          implementation: meta.implementation,
        })

        // Sign the transaction
        const signResult = await signMultisigTransaction({
          unsignedTx: {
            cbor: txJson.transaction.cborHex,
            inputs: [],
            outputs: [],
            certificates: [],
            withdrawals: [],
            referenceInputs: [],
            collateralInputs: [],
            options: {},
          },
          coSignerKey: derivation.sharedWalletKey,
          parentWalletRootKeyHex: rootKeyHex,
          accountVisual: 0,
          paymentScriptCbor: multisigMeta.paymentScriptCbor as ScriptCbor,
          stakingScriptCbor: multisigMeta.stakingScriptCbor as ScriptCbor,
        })

        // Navigate to review screen with signed transaction
        navigation.navigate('review-tx', {
          cbor: signResult.cborHex,
          context: 'send',
          onSuccess: () => {
            navigation.goBack()
          },
        } as ReviewTxRoutes['review-tx'])
      } else if (transactionType === 'multiparty') {
        // Multiparty transaction signing - can be signed by any wallet
        const txJson = parseMultipartyTransactionJSON(importedTxJson)

        // Get wallet root key
        const encryptedStorage = makeWalletEncryptedStorage(wallet.id)
        const rootKeyResult = await encryptedStorage.xpriv.read(password)
        const rootKeyHex = rootKeyResult.value

        // Sign the transaction using wallet's signTx method
        // This handles partial signing correctly by merging signatures
        const signedTx = await wallet.signTx(
          {
            cbor: txJson.transaction.cborHex,
            inputs: [],
            outputs: [],
            certificates: [],
            withdrawals: [],
            referenceInputs: [],
            collateralInputs: [],
            options: {},
          },
          rootKeyHex,
        )

        const signedTxCborHex = Buffer.from(signedTx.toBytes()).toString('hex')

        // Extract key hash from wallet's public key for tracking
        // In a real implementation, we'd extract this from the transaction signatures
        const walletKeyHash = wallet.publicKeyHex.substring(0, 64) // Simplified

        // Update transaction JSON with signature (for tracking, not used in navigation)
        addWalletSignatureToTransactionJSON(
          txJson,
          wallet.id,
          walletKeyHash,
          meta.name,
        )

        // Navigate to review screen with signed transaction
        navigation.navigate('review-tx', {
          cbor: signedTxCborHex,
          context: 'send',
          multiparty: {
            requiredSigners:
              txJson.metadata.signers?.map((s) => ({
                walletId: s.walletId || '',
                keyHash: typeof s.publicKey === 'string' ? s.publicKey : '',
                walletName: '',
              })) || [],
            inputWalletIds: [],
          },
          onSuccess: () => {
            navigation.goBack()
          },
        })
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to sign transaction'
      setError(errorMessage)
      logger.error('CoSignTransactionScreen: Signing failed', {
        error: errorMessage,
        transactionType,
      })
      showErrorDialog(errorMessages.generalError, undefined, {
        message: errorMessage,
      })
    } finally {
      setIsSigning(false)
    }
  }, [
    importedTxJson,
    password,
    transactionType,
    isMultisig,
    multisigMeta,
    meta.implementation,
    meta.name,
    wallet,
    navigation,
    logger,
  ])

  const getCborFromJson = React.useCallback(() => {
    if (!importedTxJson || !transactionType) return null
    try {
      if (transactionType === 'multisig') {
        return parseMultisigTransactionJSON(importedTxJson).transaction.cborHex
      } else {
        return parseMultipartyTransactionJSON(importedTxJson).transaction
          .cborHex
      }
    } catch {
      return null
    }
  }, [importedTxJson, transactionType])

  const txBody = useTxBody({cbor: getCborFromJson()})
  const {formattedTx} = useFormattedTx(
    (txBody ?? {
      inputs: [],
      outputs: [],
      fee: {coin: '0'},
      reference_inputs: [],
    }) as TransactionBody,
    getCborFromJson(),
  )

  return (
    <SafeArea>
      <Space.Height.lg />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[a.px_lg, a.pb_lg]}
      >
        <View style={[a.gap_md]}>
          <Text style={[a.heading_1_medium]}>
            {strings.setupWallet.coSignTransactionTitle}
          </Text>

          <Space.Height.md />

          <Text style={[a.body_1_lg_regular]}>
            {strings.setupWallet.coSignTransactionDescription}
          </Text>

          {transactionType && (
            <>
              <Space.Height.sm />
              <View
                style={[
                  a.p_md,
                  a.rounded_sm,
                  {backgroundColor: p.primary_100},
                ]}
              >
                <Text style={[a.body_2_md_medium]}>
                  {transactionType === 'multisig'
                    ? strings.setupWallet.multisigTransaction
                    : strings.setupWallet.multipartyTransaction}
                </Text>
              </View>
            </>
          )}

          <Space.Height.lg />

          {!importedTxJson ? (
            <>
              {useFilePicker ? (
                <Button
                  title={strings.setupWallet.selectJSONFile}
                  onPress={handlePickFile}
                  testID="select-transaction-json-button"
                />
              ) : (
                <>
                  <Text style={[a.body_1_lg_regular]}>
                    {strings.setupWallet.pasteJSONManually}
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
                    placeholder="Paste transaction JSON here..."
                    multiline
                    testID="transaction-json-input"
                  />
                  <Button
                    title={strings.setupWallet.parseJSON}
                    onPress={handlePasteJSON}
                    testID="parse-transaction-json-button"
                  />
                </>
              )}

              {error && (
                <>
                  <Space.Height.sm />
                  <Text style={[a.body_1_lg_medium, ta.text_error]}>
                    {error}
                  </Text>
                </>
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
                <Text style={[a.body_1_lg_medium]}>
                  {strings.setupWallet.transactionImported}
                </Text>
              </View>

              {formattedTx && (
                <>
                  <Space.Height.md />
                  <View
                    style={[
                      a.p_md,
                      a.rounded_sm,
                      {backgroundColor: p.gray_50},
                    ]}
                  >
                    <Text style={[a.heading_3_medium]}>
                      {strings.setupWallet.transactionDetails}
                    </Text>
                    <Space.Height.sm />
                    <Text style={[a.body_2_md_regular]}>
                      {strings.setupWallet.fee}: {formattedTx.fee?.quantity || '0'}{' '}
                      {formattedTx.fee?.tokenInfo?.ticker || 'ADA'}
                    </Text>
                    <Space.Height.xs />
                    <Text style={[a.body_2_md_regular]}>
                      {strings.setupWallet.outputs}: {formattedTx.outputs.length}
                    </Text>
                  </View>
                </>
              )}

              <Space.Height.lg />

              <TextInput
                label={strings.setupWallet.passwordInputLabel}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                testID="cosign-password-input"
              />

              {error && (
                <>
                  <Space.Height.sm />
                  <Text style={[a.body_1_lg_medium, ta.text_error]}>
                    {error}
                  </Text>
                </>
              )}

              <Space.Height.lg />

              <Button
                title={strings.setupWallet.signTransaction}
                onPress={handleSignTransaction}
                disabled={!password || isSigning}
                testID="sign-transaction-button"
              />

              {isSigning && (
                <View style={[a.align_center, a.justify_center, a.py_lg]}>
                  <ActivityIndicator size="large" />
                </View>
              )}

              <Space.Height.md />

              <Button
                title={strings.setupWallet.selectDifferentFile}
                onPress={() => {
                  setImportedTxJson(null)
                  setError(null)
                  setPassword('')
                }}
                type={ButtonType.Secondary}
                testID="select-different-transaction-file-button"
              />
            </>
          )}
        </View>
      </ScrollView>
    </SafeArea>
  )
}
