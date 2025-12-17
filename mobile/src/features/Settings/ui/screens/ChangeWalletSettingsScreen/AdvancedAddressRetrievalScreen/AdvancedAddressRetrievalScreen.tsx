import {
  type ManualAddress,
  makeManualAddressStorage,
} from '@yoroi/cardano-wallet'
import {atoms as a, useTheme} from '@yoroi/theme'
import {App} from '@yoroi/types'
import {useSelectedNetwork, useSelectedWallet} from '@yoroi/wallet-manager'

import * as FileSystem from 'expo-file-system'
import * as React from 'react'
import {useIntl} from 'react-intl'
import {Alert, Platform, ScrollView, View, ViewProps} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useAirdropAddressCache} from '~/features/Airdrop/common/airdropAddressCache'
import {usePromptRootKey} from '~/features/ReviewTx/common/hooks/usePromptRootKey'
import {settingsMessages} from '~/kernel/i18n/messages/settings'
import {useStrings} from '~/kernel/i18n/useStrings'
import {logger} from '~/kernel/logger/logger'
import {makeWalletEncryptedStorage} from '~/kernel/storage/EncryptedStorage'
import {Button, ButtonType} from '~/ui/Button/Button'
import {KeyboardAvoidingView} from '~/ui/KeyboardAvoidingView/KeyboardAvoidingView'
import {Space} from '~/ui/Space/Space'
import {Text} from '~/ui/Text/Text'
import {TextInput} from '~/ui/TextInput/TextInput'
import {WarningBanner} from '~/ui/WarningBanner/WarningBanner'

import {checkAddressesBatch} from './utils/checkAddressStatus'
import {deriveAddressesForAccounts} from './utils/deriveAddresses'
import {deriveAddressesFromAccountPubKeys} from './utils/deriveAddressesFromAccountPubKeys'

type Step = 'discovery' | 'discovered' | 'verification' | 'complete'

type DiscoveredAddress = {
  accountIndex: number
  addressIndex: number
  address: string
  derivationPath: string
}

export const AdvancedAddressRetrievalScreen = () => {
  const {atoms: ta, palette: p} = useTheme()
  const {wallet, meta} = useSelectedWallet()
  const {networkManager} = useSelectedNetwork()
  const {promptRootKey} = usePromptRootKey()
  const strings = useStrings()
  const intl = useIntl()
  const addressCache = useAirdropAddressCache()
  const manualAddressStorage = React.useMemo(
    () =>
      makeManualAddressStorage(
        networkManager.rootStorage.join(
          `legacy/${networkManager.network}/v1/${wallet.id}/wallet/`,
        ) as unknown as App.Storage,
      ),
    [networkManager.rootStorage, networkManager.network, wallet.id],
  )

  const [numAccounts, setNumAccounts] = React.useState('')
  const [numAddressesPerAccount, setNumAddressesPerAccount] = React.useState('')
  const [step, setStep] = React.useState<Step>('discovery')
  const [progress, setProgress] = React.useState('')
  const [discoveredAddresses, setDiscoveredAddresses] = React.useState<
    DiscoveredAddress[]
  >([])
  const [isPaused, setIsPaused] = React.useState(false)
  const isPausedRef = React.useRef(false)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [isExporting, setIsExporting] = React.useState(false)
  const [processedCount, setProcessedCount] = React.useState(0)
  const [utxoCount, setUtxoCount] = React.useState(0)
  const [historyCount, setHistoryCount] = React.useState(0)
  const [airdropCount, setAirdropCount] = React.useState(0)
  const [savedUtxoCount, setSavedUtxoCount] = React.useState(0)
  const [savedHistoryCount, setSavedHistoryCount] = React.useState(0)
  const [savedAirdropCount, setSavedAirdropCount] = React.useState(0)
  const [savedTotalCount, setSavedTotalCount] = React.useState(0)

  // Hardware wallets don't store root keys, but they may have account public keys stored
  const isHardwareWallet = meta.isHW

  // Step 2 & 3: Verification (UTXO + History + Airdrop)
  const handleVerification = React.useCallback(async () => {
    if (discoveredAddresses.length === 0) {
      return
    }

    setIsProcessing(true)
    setIsPaused(false)
    isPausedRef.current = false
    setProcessedCount(0)
    setUtxoCount(0)
    setHistoryCount(0)
    setAirdropCount(0)
    setSavedTotalCount(0)
    setSavedUtxoCount(0)
    setSavedHistoryCount(0)
    setSavedAirdropCount(0)
    setProgress(strings.settings.advancedAddressRetrieval.checkingAddresses)

    const addressStrings = discoveredAddresses.map((a) => a.address)
    const apiUrl = networkManager.legacyApiBaseUrl

    try {
      const results = await checkAddressesBatch(
        addressStrings,
        apiUrl,
        10, // batch size
        (checked, total, result) => {
          // Update counts based on result
          setProcessedCount(checked)
          if (result.hasUtxo) {
            setUtxoCount((prev) => prev + 1)
          }
          if (result.hasHistory) {
            setHistoryCount((prev) => prev + 1)
          }
          if (result.isAirdropEligible) {
            setAirdropCount((prev) => prev + 1)
          }
          setProgress(
            intl.formatMessage(
              settingsMessages.advancedAddressRetrievalCheckedProgress,
              {checked, total},
            ),
          )
        },
        () => isPausedRef.current, // shouldPause callback
      )

      // Get normally discovered addresses to exclude from manual storage
      const normalExternalAddresses = wallet.externalAddresses()
      const normalInternalAddresses = wallet.internalAddresses()
      const normalAddressesSet = new Set<string>()
      for (const addr of normalExternalAddresses) {
        normalAddressesSet.add(
          typeof addr === 'string' ? addr : (addr as string),
        )
      }
      for (const addr of normalInternalAddresses) {
        normalAddressesSet.add(
          typeof addr === 'string' ? addr : (addr as string),
        )
      }

      // Save addresses with reasons to manual storage
      // Exclude addresses that are already in the normal discovery range
      const addressesToSave: ManualAddress[] = []
      for (const discoveredAddr of discoveredAddresses) {
        const result = results.get(discoveredAddr.address)
        if (result && result.reasons.length > 0) {
          // Skip if address is already in normal discovery (account 0, addresses 0-49 or until gap limit)
          if (normalAddressesSet.has(discoveredAddr.address)) {
            continue
          }

          addressesToSave.push({
            accountIndex: discoveredAddr.accountIndex,
            addressIndex: discoveredAddr.addressIndex,
            address: discoveredAddr.address,
            derivationPath: discoveredAddr.derivationPath,
            reasons: result.reasons,
            addedAt: new Date().toISOString(),
          })
        }
      }

      // Save to manual address storage
      for (const addr of addressesToSave) {
        await manualAddressStorage.add(addr)

        // If address is airdrop eligible, also add it to airdrop cache
        if (addr.reasons.includes('airdrop')) {
          const result = results.get(addr.address)
          if (result && result.isAirdropEligible) {
            // Add to airdrop cache as eligible with nextThawDate
            await addressCache.updateEligibleAddress(
              addr.address,
              result.nextThawDate,
            )
            // Add as external address so it's included in airdrop eligibility checks
            await addressCache.addExternalAddress(addr.address)
          }
        }
      }

      const savedCount = addressesToSave.length
      const utxoCount = addressesToSave.filter((a) =>
        a.reasons.includes('utxo'),
      ).length
      const historyCount = addressesToSave.filter((a) =>
        a.reasons.includes('used'),
      ).length
      const airdropCount = addressesToSave.filter((a) =>
        a.reasons.includes('airdrop'),
      ).length

      // Store saved counts for display on complete screen
      setSavedTotalCount(savedCount)
      setSavedUtxoCount(utxoCount)
      setSavedHistoryCount(historyCount)
      setSavedAirdropCount(airdropCount)

      setStep('complete')
      setIsProcessing(false)
      setProgress('')

      Alert.alert(
        strings.settings.advancedAddressRetrieval.verificationCompleteTitle,
        intl.formatMessage(
          settingsMessages.advancedAddressRetrievalVerificationCompleteMessage,
          {
            total: discoveredAddresses.length,
            saved: savedCount,
            utxoCount,
            historyCount,
            airdropCount,
          },
        ),
      )
    } catch (error) {
      if (error instanceof Error && error.message === 'PAUSED') {
        setProgress(strings.settings.advancedAddressRetrieval.paused)
        setIsProcessing(false)
        return
      }

      logger.error('Failed to verify addresses', {error})
      Alert.alert(
        strings.settings.advancedAddressRetrieval.errorTitle,
        error instanceof Error
          ? error.message
          : strings.settings.advancedAddressRetrieval.verificationError,
      )
      setIsProcessing(false)
    }
  }, [
    discoveredAddresses,
    networkManager.legacyApiBaseUrl,
    manualAddressStorage,
    addressCache,
    strings.settings.advancedAddressRetrieval,
    intl,
    wallet,
  ])

  // Step 1: Discovery - Just discover addresses
  const handleDiscovery = React.useCallback(
    async (rootKeyHex?: string) => {
      const accountCount = isHardwareWallet ? 1 : parseInt(numAccounts, 10)
      const addressCount = parseInt(numAddressesPerAccount, 10)

      if (
        (!isHardwareWallet &&
          (!accountCount || accountCount < 1 || accountCount > 1000)) ||
        !addressCount ||
        addressCount < 1 ||
        addressCount > 10000
      ) {
        Alert.alert(
          strings.settings.advancedAddressRetrieval.invalidInputTitle,
          strings.settings.advancedAddressRetrieval.invalidInputMessage,
        )
        return
      }

      setIsProcessing(true)
      setStep('discovery')
      setProgress('')

      try {
        setProgress(
          intl.formatMessage(
            settingsMessages.advancedAddressRetrievalDiscoveringProgress,
            {accountCount, addressCount},
          ),
        )

        let addresses: Array<{
          accountIndex: number
          accountPublicKey: string
          addresses: Array<{
            index: number
            address: string
            derivationPath: string
          }>
        }>

        if (isHardwareWallet) {
          const encryptedStorage = makeWalletEncryptedStorage(wallet.id)
          const storedAccountPubKeys: Array<{
            accountIndex: number
            accountPubKeyHex: string
          }> = []

          // Hardware wallets are restricted to first account (account 0) only
          try {
            const accountPubKeyHex = await encryptedStorage.xpub.read(0)
            if (accountPubKeyHex) {
              storedAccountPubKeys.push({accountIndex: 0, accountPubKeyHex})
            }
          } catch {
            // Account public key not found
          }

          if (storedAccountPubKeys.length === 0) {
            throw new Error(
              strings.settings.advancedAddressRetrieval.noStoredAccountKeys,
            )
          }

          addresses = await deriveAddressesFromAccountPubKeys({
            accountPubKeys: storedAccountPubKeys,
            addressesPerAccount: addressCount,
            implementation: meta.implementation,
            chainId: networkManager.chainId,
          })
        } else {
          if (!rootKeyHex) {
            throw new Error(
              strings.settings.advancedAddressRetrieval.rootKeyRequired,
            )
          }
          addresses = await deriveAddressesForAccounts({
            rootKeyHex,
            accountCount,
            addressesPerAccount: addressCount,
            implementation: meta.implementation,
            chainId: networkManager.chainId,
          })
        }

        // Flatten addresses for easier processing
        const flatAddresses: DiscoveredAddress[] = []
        addresses.forEach((accountData) => {
          accountData.addresses.forEach((addr) => {
            flatAddresses.push({
              accountIndex: accountData.accountIndex,
              addressIndex: addr.index,
              address: addr.address,
              derivationPath: addr.derivationPath,
            })
          })
        })

        setDiscoveredAddresses(flatAddresses)
        setProgress('')
        setIsProcessing(false)
        setStep('discovered') // New step: addresses discovered, ready for export or verification
      } catch (error) {
        logger.error('Failed to discover addresses', {error})
        Alert.alert(
          strings.settings.advancedAddressRetrieval.errorTitle,
          error instanceof Error
            ? error.message
            : strings.settings.advancedAddressRetrieval.discoveryError,
        )
        setIsProcessing(false)
      }
    },
    [
      numAccounts,
      numAddressesPerAccount,
      wallet.id,
      meta.implementation,
      networkManager.chainId,
      isHardwareWallet,
      strings.settings.advancedAddressRetrieval,
      intl,
    ],
  )

  // Export discovered addresses to CSV
  const handleExport = React.useCallback(async () => {
    if (discoveredAddresses.length === 0) {
      return
    }

    setIsExporting(true)
    setProgress(strings.settings.advancedAddressRetrieval.exportingCsv)

    try {
      // Export CSV
      const csvRows = [
        [
          strings.settings.advancedAddressRetrieval.csvHeaderAccount,
          strings.settings.advancedAddressRetrieval.csvHeaderAddressIndex,
          strings.settings.advancedAddressRetrieval.csvHeaderAddress,
          strings.settings.advancedAddressRetrieval.csvHeaderDerivationPath,
        ].join(','),
      ]

      discoveredAddresses.forEach((addr) => {
        csvRows.push(
          [
            addr.accountIndex,
            addr.addressIndex,
            addr.address,
            addr.derivationPath,
          ].join(','),
        )
      })

      const csvContent = csvRows.join('\n')
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const csvFileName = `yoroi-addresses-${timestamp}.csv`

      await saveCsvToDownloads(csvContent, csvFileName)

      setProgress('')
      setIsExporting(false)

      Alert.alert(
        strings.settings.advancedAddressRetrieval.exportCompleteTitle,
        intl.formatMessage(
          settingsMessages.advancedAddressRetrievalExportCompleteMessage,
          {count: discoveredAddresses.length, fileName: csvFileName},
        ),
      )
    } catch (error) {
      logger.error('Failed to export CSV', {error})
      Alert.alert(
        strings.settings.advancedAddressRetrieval.errorTitle,
        error instanceof Error
          ? error.message
          : strings.settings.advancedAddressRetrieval.exportError,
      )
      setIsExporting(false)
    }
  }, [discoveredAddresses, strings.settings.advancedAddressRetrieval, intl])

  const handlePause = React.useCallback(() => {
    setIsPaused(true)
    isPausedRef.current = true
  }, [])

  const handleResume = React.useCallback(() => {
    setIsPaused(false)
    isPausedRef.current = false
    handleVerification()
  }, [handleVerification])

  const handleGenerate = React.useCallback(() => {
    if (isHardwareWallet) {
      handleDiscovery()
      return
    }

    promptRootKey({
      title: strings.settings.advancedAddressRetrieval.enterPasswordTitle,
      summary: strings.settings.advancedAddressRetrieval.enterPasswordSummary,
      onSuccess: (rootKeyHex) => handleDiscovery(rootKeyHex),
      onError: (error: unknown) => {
        logger.error('Password error', {error})
      },
    })
  }, [
    isHardwareWallet,
    promptRootKey,
    handleDiscovery,
    strings.settings.advancedAddressRetrieval.enterPasswordTitle,
    strings.settings.advancedAddressRetrieval.enterPasswordSummary,
  ])

  const saveCsvToDownloads = async (
    csvContent: string,
    fileName: string,
  ): Promise<void> => {
    if (Platform.OS === 'android') {
      try {
        const permissions =
          await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync()
        if (!permissions.granted) {
          throw new Error('Storage permission denied')
        }

        const csvUri = await FileSystem.StorageAccessFramework.createFileAsync(
          permissions.directoryUri,
          fileName,
          'text/csv',
        )
        await FileSystem.writeAsStringAsync(csvUri, csvContent, {
          encoding: FileSystem.EncodingType.UTF8,
        })
      } catch (error) {
        // Fallback to document directory
        if (!FileSystem.documentDirectory) {
          throw new Error('Document directory not available')
        }
        const csvPath = `${FileSystem.documentDirectory}${fileName}`
        await FileSystem.writeAsStringAsync(csvPath, csvContent)
      }
    } else {
      if (!FileSystem.documentDirectory) {
        throw new Error('Document directory not available')
      }
      const csvPath = `${FileSystem.documentDirectory}${fileName}`
      await FileSystem.writeAsStringAsync(csvPath, csvContent)
    }
  }

  const canStartDiscovery =
    !isProcessing &&
    (!isHardwareWallet
      ? numAccounts && numAddressesPerAccount
      : numAddressesPerAccount)

  return (
    <KeyboardAvoidingView style={[ta.bg_color_max, a.flex_1]} enabled>
      <SafeAreaView
        style={[a.flex_1, a.pt_lg, ta.bg_color_max, a.pb_lg]}
        edges={['left', 'right', 'bottom']}
      >
        <ScrollView
          contentContainerStyle={[a.px_lg, a.gap_md]}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          {!isHardwareWallet && (
            <>
              <WarningBanner
                title={strings.settings.advancedAddressRetrieval.importantTitle}
                content={
                  strings.settings.advancedAddressRetrieval.importantContent
                }
              />
              <Space.Height.lg />
            </>
          )}

          <Text style={[a.body_2_md_regular, {color: p.gray_600}]}>
            {strings.settings.advancedAddressRetrieval.description}
          </Text>

          {isHardwareWallet && (
            <>
              <Space.Height.md />
              <WarningBanner
                title={
                  strings.settings.advancedAddressRetrieval
                    .firstAccountOnlyTitle
                }
                content={
                  strings.settings.advancedAddressRetrieval
                    .firstAccountOnlyContent
                }
              />
            </>
          )}

          <Space.Height.lg />

          {step === 'discovery' && (
            <>
              {!isHardwareWallet && (
                <AccountsInput
                  returnKeyType="done"
                  errorDelay={0}
                  enablesReturnKeyAutomatically
                  label={
                    strings.settings.advancedAddressRetrieval.numberOfAccounts
                  }
                  value={numAccounts}
                  onChangeText={setNumAccounts}
                  placeholder={
                    strings.settings.advancedAddressRetrieval
                      .numberOfAccountsPlaceholder
                  }
                  keyboardType="numeric"
                  editable={!isProcessing}
                  helper={
                    strings.settings.advancedAddressRetrieval
                      .numberOfAccountsHelper
                  }
                />
              )}

              <AddressesInput
                returnKeyType="done"
                errorDelay={0}
                enablesReturnKeyAutomatically
                label={
                  strings.settings.advancedAddressRetrieval.addressesPerAccount
                }
                value={numAddressesPerAccount}
                onChangeText={setNumAddressesPerAccount}
                placeholder={
                  strings.settings.advancedAddressRetrieval
                    .addressesPerAccountPlaceholder
                }
                keyboardType="numeric"
                editable={!isProcessing}
                helper={
                  strings.settings.advancedAddressRetrieval
                    .addressesPerAccountHelper
                }
              />
            </>
          )}

          {step === 'discovered' && (
            <View style={a.gap_md}>
              <Text style={[a.body_1_lg_regular, {color: p.gray_900}]}>
                {intl.formatMessage(
                  settingsMessages.advancedAddressRetrievalDiscoveryCompleteMessage,
                  {count: discoveredAddresses.length},
                )}
              </Text>
              <Text style={[a.body_2_md_regular, {color: p.gray_600}]}>
                {
                  strings.settings.advancedAddressRetrieval
                    .discoveryCompleteDescription
                }
              </Text>
            </View>
          )}

          {step === 'verification' && (
            <View style={a.gap_md}>
              <Text style={[a.body_1_lg_regular, {color: p.gray_900}]}>
                {strings.settings.advancedAddressRetrieval.checkingAddressesFor}
              </Text>
              {progress && (
                <View
                  style={[
                    a.p_md,
                    a.rounded_md,
                    {backgroundColor: p.primary_100},
                  ]}
                >
                  <Text style={[a.body_2_md_regular, {color: p.gray_900}]}>
                    {progress}
                  </Text>
                </View>
              )}
              {discoveredAddresses.length > 0 && (
                <View style={a.gap_sm}>
                  <Text style={[a.body_2_md_regular, {color: p.gray_900}]}>
                    {intl.formatMessage(
                      settingsMessages.advancedAddressRetrievalProgress,
                      {
                        processed: processedCount,
                        total: discoveredAddresses.length,
                      },
                    )}
                  </Text>
                  <Text style={[a.body_2_md_regular, {color: p.gray_600}]}>
                    {intl.formatMessage(
                      settingsMessages.advancedAddressRetrievalWithUtxos,
                      {count: utxoCount},
                    )}
                  </Text>
                  <Text style={[a.body_2_md_regular, {color: p.gray_600}]}>
                    {intl.formatMessage(
                      settingsMessages.advancedAddressRetrievalWithHistory,
                      {count: historyCount},
                    )}
                  </Text>
                  <Text style={[a.body_2_md_regular, {color: p.gray_600}]}>
                    {intl.formatMessage(
                      settingsMessages.advancedAddressRetrievalEligibleForAirdrop,
                      {count: airdropCount},
                    )}
                  </Text>
                </View>
              )}
            </View>
          )}

          {step === 'complete' && (
            <View style={a.gap_md}>
              <Text style={[a.body_1_lg_regular, {color: p.gray_900}]}>
                {strings.settings.advancedAddressRetrieval.processComplete}
              </Text>
              {savedTotalCount > 0 && (
                <View style={a.gap_sm}>
                  <Text style={[a.body_2_md_regular, {color: p.gray_600}]}>
                    {
                      strings.settings.advancedAddressRetrieval
                        .addressesSavedToWallet
                    }
                  </Text>
                  <Text style={[a.body_2_md_regular, {color: p.gray_600}]}>
                    {intl.formatMessage(
                      settingsMessages.advancedAddressRetrievalWithUtxos,
                      {count: savedUtxoCount},
                    )}
                  </Text>
                  <Text style={[a.body_2_md_regular, {color: p.gray_600}]}>
                    {intl.formatMessage(
                      settingsMessages.advancedAddressRetrievalWithHistory,
                      {count: savedHistoryCount},
                    )}
                  </Text>
                  <Text style={[a.body_2_md_regular, {color: p.gray_600}]}>
                    {intl.formatMessage(
                      settingsMessages.advancedAddressRetrievalEligibleForAirdrop,
                      {count: savedAirdropCount},
                    )}
                  </Text>
                </View>
              )}
            </View>
          )}

          {progress && step !== 'verification' && (
            <View
              style={[a.p_md, a.rounded_md, {backgroundColor: p.primary_100}]}
            >
              <Text style={[a.body_2_md_regular, {color: p.gray_900}]}>
                {progress}
              </Text>
            </View>
          )}
        </ScrollView>

        <Actions>
          {step === 'discovery' && (
            <Button
              onPress={handleGenerate}
              disabled={!canStartDiscovery}
              title={
                isProcessing
                  ? strings.settings.advancedAddressRetrieval.discovering
                  : strings.settings.advancedAddressRetrieval.discover
              }
            />
          )}

          {step === 'discovered' && (
            <View style={a.gap_sm}>
              {Platform.OS !== 'ios' && (
                <Button
                  onPress={handleExport}
                  disabled={isExporting}
                  title={
                    isExporting
                      ? strings.settings.advancedAddressRetrieval.exportingCsv
                      : strings.settings.advancedAddressRetrieval.exportCsv
                  }
                />
              )}
              <Button
                onPress={handleVerification}
                type={ButtonType.Secondary}
                disabled={isProcessing}
                title={strings.settings.advancedAddressRetrieval.checkAddresses}
              />
            </View>
          )}

          {step === 'verification' && (
            <View style={a.gap_sm}>
              {isPaused ? (
                <Button
                  onPress={handleResume}
                  title={
                    strings.settings.advancedAddressRetrieval.resumeChecking
                  }
                />
              ) : (
                <Button
                  onPress={handlePause}
                  disabled={!isProcessing}
                  title={strings.settings.advancedAddressRetrieval.pause}
                />
              )}
            </View>
          )}

          {step === 'complete' && (
            <Button
              onPress={() => {
                setStep('discovery')
                setDiscoveredAddresses([])
                setProcessedCount(0)
              }}
              title={strings.settings.advancedAddressRetrieval.startOver}
            />
          )}
        </Actions>
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}

const AccountsInput = TextInput
const AddressesInput = TextInput
const Actions = (props: ViewProps) => {
  return <View {...props} style={[a.px_lg, a.pt_lg]} />
}
