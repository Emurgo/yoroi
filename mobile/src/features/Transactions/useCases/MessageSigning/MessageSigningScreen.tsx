import {atoms as a, useTheme} from '@yoroi/theme'
import {useAddressMode, useSelectedWallet} from '@yoroi/wallet-manager'

import {Buffer} from 'buffer'
import * as React from 'react'
import {Pressable, Text as RNText, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {useWalletNavigation} from '~/kernel/navigation/hooks/useWalletNavigation'
import {Button} from '~/ui/Button/Button'
import {useModal} from '~/ui/Modal/context/ModalContext'
import {Modal} from '~/ui/Modal/ui/screens/Modal/Modal'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {ScrollView} from '~/ui/ScrollView/ScrollView'
import {Space} from '~/ui/Space/Space'
import {Tab, TabPanel, TabPanels, Tabs} from '~/ui/Tabs/Tabs'
import {Text} from '~/ui/Text/Text'
import {TextInput} from '~/ui/TextInput/TextInput'

import {MessageVerificationResultModal} from './MessageVerificationResultModal'
import {PayloadFormatSelector} from './PayloadFormatSelector'
import {useMessageSigning} from './useMessageSigning'
import {
  VerificationResult,
  useMessageVerification,
} from './useMessageVerification'
import {isHexString, isValidJson, payloadToHex} from './utils'

const MAX_MESSAGE_LENGTH_BYTES = 64

type PayloadFormat = 'text' | 'json' | 'hex'
type TabType = 'sign' | 'verify'

export const MessageSigningScreen = () => {
  const strings = useStrings()
  const {palette: p, atoms: ta} = useTheme()
  const {wallet} = useSelectedWallet()
  const {addressMode} = useAddressMode()
  const {signMessage} = useMessageSigning()
  const {verifyMessage} = useMessageVerification()
  const {navigateToMessageSigningResult} = useWalletNavigation()
  const {openModal, closeModal} = useModal()

  const [activeTab, setActiveTab] = React.useState<TabType>('sign')
  const [payloadFormat, setPayloadFormat] =
    React.useState<PayloadFormat>('text')

  // Get available addresses
  const availableAddresses = React.useMemo(() => {
    const external = wallet.externalAddresses()
    const internal = wallet.internalAddresses()
    return [...external, ...internal]
  }, [wallet])

  // Get default change address
  const defaultAddress = React.useMemo(
    () => wallet.getChangeAddress(addressMode),
    [wallet, addressMode],
  )

  // Signing state
  const [message, setMessage] = React.useState('')
  const [selectedAddress, setSelectedAddress] =
    React.useState<string>(defaultAddress)
  const [isSigning, setIsSigning] = React.useState(false)
  const [signError, setSignError] = React.useState<string | null>(null)

  // Verification state
  const [verifySignature, setVerifySignature] = React.useState('')
  const [verifyExpectedPayload, setVerifyExpectedPayload] = React.useState('')
  const [verifyKey, setVerifyKey] = React.useState('')
  const [verifyAddress, setVerifyAddress] = React.useState('')
  const [isVerifying, setIsVerifying] = React.useState(false)
  const [_verifyResult, setVerifyResult] =
    React.useState<VerificationResult | null>(null)
  const [_verifyError, setVerifyError] = React.useState<string | null>(null)

  // Calculate message length based on format
  const getPayloadLengthInBytes = React.useCallback(
    (payload: string, format: PayloadFormat): number => {
      try {
        const hex = payloadToHex(payload, format)
        return Buffer.from(hex, 'hex').length
      } catch {
        return Buffer.from(payload, 'utf-8').length
      }
    },
    [],
  )

  const messageLengthBytes = getPayloadLengthInBytes(message, payloadFormat)
  const isValidLength = messageLengthBytes <= MAX_MESSAGE_LENGTH_BYTES
  const canSign = message.trim().length > 0 && isValidLength && !isSigning

  // Validate payload format
  const getPayloadFormatError = React.useCallback(
    (payload: string, format: PayloadFormat): string | null => {
      if (!payload.trim()) return null
      try {
        if (format === 'hex' && !isHexString(payload)) {
          return 'Invalid hex string'
        }
        if (format === 'json' && !isValidJson(payload)) {
          return 'Invalid JSON string'
        }
        return null
      } catch {
        return 'Invalid format'
      }
    },
    [],
  )

  const payloadFormatError = getPayloadFormatError(message, payloadFormat)

  const lengthInfo =
    strings.transactions.messageSigning.messageSigningLengthInfo(
      messageLengthBytes.toString(),
      MAX_MESSAGE_LENGTH_BYTES.toString(),
    )

  const handleSign = React.useCallback(async () => {
    if (!canSign || payloadFormatError) return

    setIsSigning(true)
    setSignError(null)

    try {
      // signMessage always converts UTF-8 to hex internally
      // For hex format, we need to convert hex bytes to a UTF-8 string representation
      // For text/json, pass as-is
      let messageToSign: string
      if (payloadFormat === 'hex') {
        // Convert hex to bytes, then to UTF-8 string
        // This allows signing arbitrary hex data
        const hexBytes = Buffer.from(message, 'hex')
        messageToSign = hexBytes.toString('utf-8')
      } else {
        // Text/JSON: pass as-is (signMessage converts UTF-8 to hex internally)
        messageToSign = message
      }

      const result = await signMessage(messageToSign, selectedAddress)
      navigateToMessageSigningResult(result.signature, result.key)
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : strings.transactions.messageSigning.error
      setSignError(errorMessage)
    } finally {
      setIsSigning(false)
    }
  }, [
    message,
    payloadFormat,
    canSign,
    payloadFormatError,
    signMessage,
    navigateToMessageSigningResult,
    strings,
    selectedAddress,
  ])

  const handleVerify = React.useCallback(async () => {
    if (!verifySignature.trim()) {
      setVerifyError('Please enter a signature')
      return
    }

    setIsVerifying(true)
    setVerifyError(null)
    setVerifyResult(null)

    try {
      const result = await verifyMessage(
        verifySignature,
        verifyExpectedPayload.trim() || undefined,
        verifyExpectedPayload.trim() ? payloadFormat : undefined,
        verifyAddress.trim() || undefined,
        verifyKey.trim() || undefined,
      )

      // If address was provided but doesn't match, show specific error
      let errorMessage: string | null = null
      if (
        verifyAddress.trim() &&
        result.addressMatches === false &&
        result.isValid
      ) {
        errorMessage =
          'Signature is valid but does not match the provided address'
      } else if (!result.isValid) {
        errorMessage =
          strings.transactions.messageSigning.messageSigningVerifyError
      }

      setVerifyResult(result)
      setVerifyError(errorMessage)

      // Open modal with results
      openModal({
        title: 'Verification Result',
        content: (
          <MessageVerificationResultModal
            result={result}
            error={errorMessage}
            onClose={() => {
              closeModal()
              setVerifyResult(null)
              setVerifyError(null)
            }}
          />
        ),
        height: 500,
      })
    } catch (err) {
      setVerifyResult({isValid: false})
      const errorMessage =
        err instanceof Error
          ? err.message
          : strings.transactions.messageSigning.messageSigningVerifyError
      setVerifyError(errorMessage)
    } finally {
      setIsVerifying(false)
    }
  }, [
    verifySignature,
    verifyExpectedPayload,
    verifyKey,
    verifyAddress,
    payloadFormat,
    verifyMessage,
    strings,
    openModal,
    closeModal,
  ])

  return (
    <SafeArea>
      <View style={[a.flex_1]}>
        <Tabs style={[a.px_lg, a.pt_lg]}>
          <Tab
            active={activeTab === 'sign'}
            label={strings.transactions.messageSigning.messageSigningTabSign}
            onPress={() => {
              setActiveTab('sign')
              setSignError(null)
            }}
            testID="messageSigningTabSign"
          />
          <Tab
            active={activeTab === 'verify'}
            label={strings.transactions.messageSigning.messageSigningTabVerify}
            onPress={() => {
              setActiveTab('verify')
              setVerifyError(null)
              setVerifyResult(null)
            }}
            testID="messageSigningTabVerify"
          />
        </Tabs>

        <TabPanels>
          <TabPanel active={activeTab === 'sign'}>
            <ScrollView contentContainerStyle={[a.px_lg, a.pb_lg]}>
              <Space.Height.lg />

              <View style={[a.flex_col, a.gap_md]}>
                <Pressable
                  onPress={() => {
                    openModal({
                      title: 'Select Address',
                      content: (
                        <Modal.Content>
                          <ScrollView
                            contentContainerStyle={[a.px_sm, a.pb_lg]}
                          >
                            <Space.Height.lg />
                            {availableAddresses.map((addr) => (
                              <View key={addr} style={[a.pb_md]}>
                                <Pressable
                                  onPress={() => {
                                    setSelectedAddress(addr)
                                    closeModal()
                                  }}
                                  style={[
                                    a.p_md,
                                    a.rounded_sm,
                                    selectedAddress === addr && {
                                      backgroundColor: p.primary_100,
                                    },
                                  ]}
                                >
                                  <View
                                    style={[
                                      a.flex_row,
                                      a.align_center,
                                      {flex: 1},
                                    ]}
                                  >
                                    <View style={{flex: 1}}>
                                      <RNText
                                        numberOfLines={1}
                                        ellipsizeMode="middle"
                                      >
                                        <RNText
                                          style={[
                                            a.body_2_md_regular,
                                            ta.text_gray_medium,
                                          ]}
                                        >
                                          {addr.slice(0, -6)}
                                        </RNText>
                                        <RNText
                                          style={[
                                            a.body_2_md_medium,
                                            ta.el_primary_medium,
                                          ]}
                                        >
                                          {' '}
                                          {addr.slice(-6)}
                                        </RNText>
                                      </RNText>
                                    </View>
                                  </View>
                                </Pressable>
                              </View>
                            ))}
                          </ScrollView>
                        </Modal.Content>
                      ),
                      height: 500,
                    })
                  }}
                >
                  <View
                    style={[
                      a.flex_row,
                      a.align_center,
                      {flex: 1},
                      {backgroundColor: p.bg_color_min},
                      a.rounded_sm,
                      a.p_md,
                    ]}
                  >
                    <View style={{flex: 1}}>
                      <RNText numberOfLines={1} ellipsizeMode="middle">
                        <RNText
                          style={[a.body_2_md_regular, ta.text_gray_medium]}
                        >
                          {selectedAddress.slice(0, -6)}
                        </RNText>
                        <RNText
                          style={[a.body_2_md_medium, ta.el_primary_medium]}
                        >
                          {' '}
                          {selectedAddress.slice(-6)}
                        </RNText>
                      </RNText>
                    </View>
                  </View>
                </Pressable>

                <PayloadFormatSelector
                  value={payloadFormat}
                  onChange={setPayloadFormat}
                  onErrorChange={setSignError}
                />

                <TextInput
                  value={message}
                  onChangeText={(text) => {
                    setMessage(text)
                    setSignError(null)
                  }}
                  label={
                    strings.transactions.messageSigning.messageSigningInputLabel
                  }
                  placeholder={
                    strings.transactions.messageSigning
                      .messageSigningPlaceholder
                  }
                  multiline
                  autoComplete="off"
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={
                    !isValidLength ||
                    signError !== null ||
                    payloadFormatError !== null
                  }
                  renderComponentStyle={{minHeight: 120}}
                  testID="messageSigningInput"
                />
              </View>

              <Space.Height.md />

              {payloadFormatError && (
                <View>
                  <Text
                    style={[a.body_2_md_regular, {color: p.sys_magenta_500}]}
                  >
                    {payloadFormatError}
                  </Text>
                </View>
              )}

              {!isValidLength && message.length > 0 && (
                <View>
                  <Space.Height.md />
                  <Text
                    style={[a.body_2_md_regular, {color: p.sys_magenta_500}]}
                  >
                    {
                      strings.transactions.messageSigning
                        .messageSigningMaxLengthError
                    }
                  </Text>
                  <Space.Height.xs />
                  <Text style={[a.body_2_md_regular, {color: p.gray_600}]}>
                    {lengthInfo}
                  </Text>
                </View>
              )}

              {signError && (
                <View>
                  <Space.Height.md />
                  <Text
                    style={[a.body_2_md_regular, {color: p.sys_magenta_500}]}
                  >
                    {signError}
                  </Text>
                </View>
              )}
            </ScrollView>

            <SafeArea.Footer>
              <Button
                title={
                  strings.transactions.messageSigning.messageSigningSignButton
                }
                onPress={handleSign}
                disabled={!canSign || payloadFormatError !== null}
                isLoading={isSigning}
                testID="messageSigningButton"
              />
            </SafeArea.Footer>
          </TabPanel>

          <TabPanel active={activeTab === 'verify'}>
            <ScrollView contentContainerStyle={[a.px_lg, a.pb_lg]}>
              <Space.Height.lg />

              <TextInput
                value={verifySignature}
                onChangeText={(text) => {
                  setVerifySignature(text)
                  setVerifyError(null)
                  setVerifyResult(null)
                }}
                label={
                  strings.transactions.messageSigning
                    .messageSigningVerifySignatureLabel
                }
                placeholder="Enter signature (hex)"
                multiline
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect={false}
                testID="messageVerificationSignatureInput"
              />

              <Space.Height.md />

              <Text style={[a.body_2_md_regular, {color: p.text_gray_low}]}>
                Optional: Enter key or public key to verify it matches the
                signature
              </Text>

              <Space.Height.sm />

              <TextInput
                value={verifyKey}
                onChangeText={(text) => {
                  setVerifyKey(text)
                  setVerifyError(null)
                  setVerifyResult(null)
                }}
                label={
                  strings.transactions.messageSigning
                    .messageSigningVerifyKeyLabel + ' (optional)'
                }
                placeholder="Enter key or public key (hex)"
                multiline
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect={false}
                testID="messageVerificationKeyInput"
              />

              <Space.Height.md />

              <View style={[a.flex_row, a.gap_md]}>
                <View style={[a.flex_1]}>
                  <Text style={[a.body_2_md_regular, {color: p.text_gray_low}]}>
                    Optional: Enter expected message to verify it matches the
                    signature
                  </Text>

                  <Space.Height.sm />

                  <PayloadFormatSelector
                    value={payloadFormat}
                    onChange={setPayloadFormat}
                    onErrorChange={setVerifyError}
                  />
                  <Space.Height.sm />
                  <TextInput
                    value={verifyExpectedPayload}
                    onChangeText={(text) => {
                      setVerifyExpectedPayload(text)
                      setVerifyError(null)
                      setVerifyResult(null)
                    }}
                    label="Expected Message (optional)"
                    placeholder="Enter expected message to verify"
                    multiline
                    autoComplete="off"
                    autoCapitalize="none"
                    autoCorrect={false}
                    testID="messageVerificationExpectedPayloadInput"
                  />
                </View>
              </View>

              <Space.Height.md />

              <Text style={[a.body_2_md_regular, {color: p.text_gray_low}]}>
                Optional: Enter address to verify signature belongs to it
              </Text>

              <Space.Height.sm />

              <TextInput
                value={verifyAddress}
                onChangeText={(text) => {
                  setVerifyAddress(text)
                  setVerifyError(null)
                  setVerifyResult(null)
                }}
                label={
                  strings.transactions.messageSigning
                    .messageSigningVerifyAddressLabel
                }
                placeholder={
                  strings.transactions.messageSigning
                    .messageSigningVerifyAddressPlaceholder
                }
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect={false}
                testID="messageVerificationAddressInput"
              />
            </ScrollView>

            <SafeArea.Footer>
              <Button
                title={
                  strings.transactions.messageSigning.messageSigningVerifyButton
                }
                onPress={handleVerify}
                disabled={!verifySignature.trim() || isVerifying}
                isLoading={isVerifying}
                testID="messageVerificationButton"
              />
            </SafeArea.Footer>
          </TabPanel>
        </TabPanels>
      </View>
    </SafeArea>
  )
}
