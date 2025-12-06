import {CardanoMobileWrapped} from '@yoroi/cardano-wallet'
import {atoms as a, useTheme} from '@yoroi/theme'
import {validateTransactionCbor} from '@yoroi/tx'
import {
  parseMultipartyTransactionJSON,
  parseMultisigTransactionJSON,
} from '@yoroi/tx'

import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system'
import * as React from 'react'
import {ScrollView, Text, View} from 'react-native'

import {showErrorDialog} from '~/kernel/dialogs'
import {errorMessages} from '~/kernel/i18n/messages/global'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {Button, ButtonType} from '~/ui/Button/Button'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {Space} from '~/ui/Space/Space'
import {TextInput} from '~/ui/TextInput/TextInput'

type InputType = 'json' | 'cbor' | null

export const SignTransactionScreen = () => {
  const {palette: p} = useTheme()
  const strings = useStrings()
  const {navigateToTxReview} = useWalletNavigation()
  const [input, setInput] = React.useState('')
  const [inputType, setInputType] = React.useState<InputType>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [isProcessing, setIsProcessing] = React.useState(false)

  const parseAndValidateInput = React.useCallback(
    async (inputString: string) => {
      const trimmed = inputString.trim()
      if (!trimmed) {
        setError('Please paste JSON or CBOR content')
        return null
      }

      setIsProcessing(true)
      setError(null)

      try {
        // Try to parse as JSON first (multiparty or multisig transaction)
        try {
          // Try multiparty first
          try {
            const multipartyParsed = parseMultipartyTransactionJSON(trimmed)
            setInputType('json')
            // Extract multiparty metadata
            const signers = multipartyParsed.metadata.signers ?? []
            const requiredSigners = signers.map((signer) => ({
              walletId: signer.walletId || '',
              keyHash: signer.publicKey,
              walletName: '', // Not available in JSON, will be empty
            }))
            const inputWalletIds = signers
              .map((s) => s.walletId)
              .filter((id): id is string => Boolean(id))

            return {
              type: 'multiparty' as const,
              cbor: multipartyParsed.transaction.cborHex,
              multiparty: {
                requiredSigners,
                inputWalletIds,
              },
              jsonString: trimmed, // Keep original JSON for reference
            }
          } catch {
            // Try multisig
            try {
              const multisigParsed = parseMultisigTransactionJSON(trimmed)
              setInputType('json')
              return {
                type: 'multisig' as const,
                cbor: multisigParsed.transaction.cborHex,
                multisig: {
                  requiredCoSigners:
                    multisigParsed.metadata.signers?.length ?? 0,
                  totalCoSigners: multisigParsed.metadata.signers?.length ?? 0,
                  signedCoSigners:
                    multisigParsed.metadata.signers
                      ?.filter((s) => s.signed)
                      .map((s) => s.publicKey) ?? [],
                  missingCoSigners:
                    multisigParsed.metadata.signers
                      ?.filter((s) => !s.signed)
                      .map((s) => s.publicKey) ?? [],
                },
                jsonString: trimmed,
              }
            } catch {
              throw new Error('Not a valid multiparty or multisig JSON')
            }
          }
        } catch {
          // Not JSON, try as CBOR
          // Validate CBOR format
          const validation = await CardanoMobileWrapped.cslScope(async (csl) =>
            validateTransactionCbor(csl, trimmed),
          )
          if (!validation.valid) {
            setError(
              validation.errors.join(', ') ||
                'Invalid transaction format. Please provide valid JSON or CBOR.',
            )
            return null
          }
          setInputType('cbor')
          return {
            type: 'cbor' as const,
            cbor: trimmed,
          }
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Invalid transaction format. Please provide valid JSON or CBOR.'
        setError(errorMessage)
        return null
      } finally {
        setIsProcessing(false)
      }
    },
    [],
  )

  const handlePickFile = React.useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'text/json', '*.json', 'text/*'],
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

      const parsed = await parseAndValidateInput(fileContent)
      if (parsed) {
        setInput(fileContent)
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to import file'
      setError(errorMessage)
      showErrorDialog(errorMessages.generalError, undefined, {
        message: errorMessage,
      })
    }
  }, [parseAndValidateInput])

  const handleReview = React.useCallback(async () => {
    if (!input.trim()) {
      setError('Please paste JSON or CBOR content')
      return
    }

    const parsed = await parseAndValidateInput(input.trim())
    if (!parsed) {
      return
    }

    // Navigate to review screen
    navigateToTxReview({
      cbor: parsed.cbor,
      context: 'dapp',
      multiparty: parsed.type === 'multiparty' ? parsed.multiparty : undefined,
      multisig: parsed.type === 'multisig' ? parsed.multisig : undefined,
      details: {
        title: 'Sign Transaction',
        component: (
          <Text style={[a.body_2_md_regular, {color: p.text_gray_medium}]}>
            {inputType === 'json'
              ? 'You are signing a transaction from a JSON file. Review the details carefully before signing.'
              : 'You are signing a custom transaction. This is advanced functionality and should only be used if you know what you are doing.'}
          </Text>
        ),
      },
    })
  }, [input, inputType, parseAndValidateInput, navigateToTxReview, p])

  return (
    <SafeArea edges={['bottom']} style={[a.flex_1]}>
      <ScrollView
        contentContainerStyle={[a.p_lg]}
        bounces={false}
        style={[a.flex_1]}
      >
        <View style={[a.gap_md]}>
          <Text style={[a.body_1_lg_medium, {color: p.text_gray_max}]}>
            {strings.setupWallet.signTransaction}
          </Text>

          <Text style={[a.body_2_md_regular, {color: p.text_gray_medium}]}>
            {strings.setupWallet.signTransactionDescription}
          </Text>

          <Space.Height.md />

          <Button
            type={ButtonType.Secondary}
            title={strings.setupWallet.selectDifferentFile}
            onPress={handlePickFile}
          />

          <Space.Height.md />

          <Text style={[a.body_2_md_regular, {color: p.text_gray_medium}]}>
            {strings.setupWallet.orPasteManually}
          </Text>

          <TextInput
            value={input}
            onChangeText={(text) => {
              setInput(text)
              setError(null)
            }}
            placeholder="Paste JSON or CBOR here..."
            multiline
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect={false}
            style={[{minHeight: 200}]}
          />

          {error && (
            <View>
              <Text style={[a.body_2_md_regular, {color: p.sys_magenta_500}]}>
                {error}
              </Text>
            </View>
          )}

          {inputType && (
            <View>
              <Text style={[a.body_2_md_regular, {color: p.text_gray_medium}]}>
                Detected format: {inputType.toUpperCase()}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <SafeArea.Footer>
        <Button
          title={strings.setupWallet.review}
          onPress={handleReview}
          disabled={!input.trim() || isProcessing}
        />
      </SafeArea.Footer>
    </SafeArea>
  )
}
