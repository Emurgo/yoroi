import {atoms as a, useTheme} from '@yoroi/theme'
import {useSelectedNetwork, useSelectedWallet} from '@yoroi/wallet-manager'

import * as FileSystem from 'expo-file-system'
import * as React from 'react'
import {Alert, Platform, ScrollView, View, ViewProps} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {usePromptRootKey} from '~/features/ReviewTx/common/hooks/usePromptRootKey'
import {logger} from '~/kernel/logger/logger'
import {makeWalletEncryptedStorage} from '~/kernel/storage/EncryptedStorage'
import {Button} from '~/ui/Button/Button'
import {KeyboardAvoidingView} from '~/ui/KeyboardAvoidingView/KeyboardAvoidingView'
import {Space} from '~/ui/Space/Space'
import {Text} from '~/ui/Text/Text'
import {TextInput} from '~/ui/TextInput/TextInput'
import {WarningBanner} from '~/ui/WarningBanner/WarningBanner'

import {deriveAddressesForAccounts} from './utils/deriveAddresses'
import {deriveAddressesFromAccountPubKeys} from './utils/deriveAddressesFromAccountPubKeys'

export const AdvancedAddressRetrievalScreen = () => {
  const {atoms: ta, palette: p} = useTheme()
  const {wallet, meta} = useSelectedWallet()
  const {networkManager} = useSelectedNetwork()
  const {promptRootKey} = usePromptRootKey()

  const [numAccounts, setNumAccounts] = React.useState('')
  const [numAddressesPerAccount, setNumAddressesPerAccount] = React.useState('')
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [progress, setProgress] = React.useState('')

  // Hardware wallets don't store root keys, but they may have account public keys stored
  // We can derive addresses from stored account public keys, but not new accounts
  const isHardwareWallet = meta.isHW

  const handleGenerateWithRootKey = React.useCallback(
    async (rootKeyHex: string) => {
      const accountCount = parseInt(numAccounts, 10)
      const addressCount = parseInt(numAddressesPerAccount, 10)

      if (
        !accountCount ||
        accountCount < 1 ||
        accountCount > 1000 ||
        !addressCount ||
        addressCount < 1 ||
        addressCount > 10000
      ) {
        Alert.alert(
          'Invalid Input',
          'Please enter valid numbers: accounts (1-1000) and addresses per account (1-10000).',
        )
        return
      }

      setIsGenerating(true)
      setProgress('')

      try {
        setProgress(
          `Generating ${accountCount} accounts with ${addressCount} addresses each...`,
        )

        const addresses = await deriveAddressesForAccounts({
          rootKeyHex,
          accountCount,
          addressesPerAccount: addressCount,
          implementation: meta.implementation,
          chainId: networkManager.chainId,
        })

        setProgress('Exporting to file...')

        // Create CSV content
        const csvRows = [
          ['Account', 'Address Index', 'Address', 'Derivation Path'].join(','),
        ]

        addresses.forEach((accountData) => {
          accountData.addresses.forEach((addr, index) => {
            csvRows.push(
              [
                accountData.accountIndex,
                index,
                addr.address,
                addr.derivationPath,
              ].join(','),
            )
          })
        })

        const csvContent = csvRows.join('\n')

        // Create JSON content
        const jsonContent = JSON.stringify(
          {
            generatedAt: new Date().toISOString(),
            walletId: wallet.id,
            accountCount,
            addressesPerAccount: addressCount,
            accounts: addresses.map((accountData) => ({
              accountIndex: accountData.accountIndex,
              accountPublicKey: accountData.accountPublicKey,
              addresses: accountData.addresses.map((addr) => ({
                index: addr.index,
                address: addr.address,
                derivationPath: addr.derivationPath,
              })),
            })),
          },
          null,
          2,
        )

        // Save files to Downloads folder
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        const csvFileName = `yoroi-addresses-${timestamp}.csv`
        const jsonFileName = `yoroi-addresses-${timestamp}.json`

        setProgress('Saving files to Downloads...')

        if (Platform.OS === 'android') {
          // Android: Use Storage Access Framework to save to Downloads
          try {
            const permissions =
              await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync()
            if (!permissions.granted) {
              throw new Error('Storage permission denied')
            }

            const csvUri =
              await FileSystem.StorageAccessFramework.createFileAsync(
                permissions.directoryUri,
                csvFileName,
                'text/csv',
              )
            await FileSystem.writeAsStringAsync(csvUri, csvContent, {
              encoding: FileSystem.EncodingType.UTF8,
            })

            const jsonUri =
              await FileSystem.StorageAccessFramework.createFileAsync(
                permissions.directoryUri,
                jsonFileName,
                'application/json',
              )
            await FileSystem.writeAsStringAsync(jsonUri, jsonContent, {
              encoding: FileSystem.EncodingType.UTF8,
            })

            setProgress('')
            Alert.alert(
              'Success',
              `Successfully generated ${addresses.length} accounts with addresses.\n\nFiles saved to Downloads:\n• ${csvFileName}\n• ${jsonFileName}`,
            )
          } catch (error) {
            // Fallback to document directory if Storage Access Framework fails
            if (!FileSystem.documentDirectory) {
              throw new Error('Document directory not available')
            }
            const csvPath = `${FileSystem.documentDirectory}${csvFileName}`
            const jsonPath = `${FileSystem.documentDirectory}${jsonFileName}`
            await FileSystem.writeAsStringAsync(csvPath, csvContent)
            await FileSystem.writeAsStringAsync(jsonPath, jsonContent)
            setProgress('')
            Alert.alert(
              'Success',
              `Successfully generated ${addresses.length} accounts with addresses.\n\nFiles saved:\n• ${csvFileName}\n• ${jsonFileName}\n\nFiles are saved in the app's document directory.`,
            )
          }
        } else {
          // iOS: Save to documentDirectory (accessible via Files app)
          if (!FileSystem.documentDirectory) {
            throw new Error('Document directory not available')
          }
          const csvPath = `${FileSystem.documentDirectory}${csvFileName}`
          const jsonPath = `${FileSystem.documentDirectory}${jsonFileName}`
          await FileSystem.writeAsStringAsync(csvPath, csvContent)
          await FileSystem.writeAsStringAsync(jsonPath, jsonContent)
          setProgress('')
          Alert.alert(
            'Success',
            `Successfully generated ${addresses.length} accounts with addresses.\n\nFiles saved:\n• ${csvFileName}\n• ${jsonFileName}\n\nFiles are saved in the app's document directory. You can access them via the Files app.`,
          )
        }
      } catch (error) {
        logger.error('Failed to generate addresses', {error})
        Alert.alert(
          'Error',
          error instanceof Error
            ? error.message
            : 'Failed to generate addresses. Please try again.',
        )
      } finally {
        setIsGenerating(false)
        setProgress('')
      }
    },
    [
      numAccounts,
      numAddressesPerAccount,
      wallet.id,
      meta.implementation,
      networkManager.chainId,
    ],
  )

  const handleGenerateForHardwareWallet = React.useCallback(async () => {
    const addressCount = parseInt(numAddressesPerAccount, 10)

    if (!addressCount || addressCount < 1 || addressCount > 10000) {
      Alert.alert(
        'Invalid Input',
        'Please enter a valid number of addresses per account (1-10000).',
      )
      return
    }

    setIsGenerating(true)
    setProgress('')

    try {
      setProgress('Reading stored account public keys...')
      const encryptedStorage = makeWalletEncryptedStorage(wallet.id)

      // Check which account public keys are stored (typically 0, but could be more)
      // We'll check accounts 0-99 to find stored ones
      const storedAccountPubKeys: Array<{
        accountIndex: number
        accountPubKeyHex: string
      }> = []

      for (let accountIndex = 0; accountIndex < 100; accountIndex++) {
        try {
          const accountPubKeyHex =
            await encryptedStorage.xpub.read(accountIndex)
          if (accountPubKeyHex) {
            storedAccountPubKeys.push({accountIndex, accountPubKeyHex})
          }
        } catch {
          // Account public key not found, skip
        }
      }

      if (storedAccountPubKeys.length === 0) {
        throw new Error(
          'No stored account public keys found. Hardware wallets need to have accounts set up first.',
        )
      }

      setProgress(
        `Generating addresses for ${storedAccountPubKeys.length} stored account(s)...`,
      )

      const addresses = await deriveAddressesFromAccountPubKeys({
        accountPubKeys: storedAccountPubKeys,
        addressesPerAccount: addressCount,
        implementation: meta.implementation,
        chainId: networkManager.chainId,
      })

      setProgress('Exporting to file...')

      // Create CSV content
      const csvRows = [
        ['Account', 'Address Index', 'Address', 'Derivation Path'].join(','),
      ]

      addresses.forEach((accountData) => {
        accountData.addresses.forEach((addr, index) => {
          csvRows.push(
            [
              accountData.accountIndex,
              index,
              addr.address,
              addr.derivationPath,
            ].join(','),
          )
        })
      })

      const csvContent = csvRows.join('\n')

      // Create JSON content
      const jsonContent = JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          walletId: wallet.id,
          accountCount: storedAccountPubKeys.length,
          addressesPerAccount: addressCount,
          accounts: addresses.map((accountData) => ({
            accountIndex: accountData.accountIndex,
            accountPublicKey: accountData.accountPublicKey,
            addresses: accountData.addresses.map((addr) => ({
              index: addr.index,
              address: addr.address,
              derivationPath: addr.derivationPath,
            })),
          })),
        },
        null,
        2,
      )

      // Save files to Downloads folder
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const csvFileName = `yoroi-addresses-${timestamp}.csv`
      const jsonFileName = `yoroi-addresses-${timestamp}.json`

      setProgress('Saving files to Downloads...')

      if (Platform.OS === 'android') {
        // Android: Use Storage Access Framework to save to Downloads
        try {
          const permissions =
            await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync()
          if (!permissions.granted) {
            throw new Error('Storage permission denied')
          }

          const csvUri =
            await FileSystem.StorageAccessFramework.createFileAsync(
              permissions.directoryUri,
              csvFileName,
              'text/csv',
            )
          await FileSystem.writeAsStringAsync(csvUri, csvContent, {
            encoding: FileSystem.EncodingType.UTF8,
          })

          const jsonUri =
            await FileSystem.StorageAccessFramework.createFileAsync(
              permissions.directoryUri,
              jsonFileName,
              'application/json',
            )
          await FileSystem.writeAsStringAsync(jsonUri, jsonContent, {
            encoding: FileSystem.EncodingType.UTF8,
          })

          setProgress('')
          Alert.alert(
            'Success',
            `Successfully generated addresses for ${storedAccountPubKeys.length} stored account(s).\n\nFiles saved to Downloads:\n• ${csvFileName}\n• ${jsonFileName}`,
          )
        } catch (error) {
          // Fallback to document directory if Storage Access Framework fails
          if (!FileSystem.documentDirectory) {
            throw new Error('Document directory not available')
          }
          const csvPath = `${FileSystem.documentDirectory}${csvFileName}`
          const jsonPath = `${FileSystem.documentDirectory}${jsonFileName}`
          await FileSystem.writeAsStringAsync(csvPath, csvContent)
          await FileSystem.writeAsStringAsync(jsonPath, jsonContent)
          setProgress('')
          Alert.alert(
            'Success',
            `Successfully generated addresses for ${storedAccountPubKeys.length} stored account(s).\n\nFiles saved:\n• ${csvFileName}\n• ${jsonFileName}\n\nFiles are saved in the app's document directory.`,
          )
        }
      } else {
        // iOS: Save to documentDirectory (accessible via Files app)
        if (!FileSystem.documentDirectory) {
          throw new Error('Document directory not available')
        }
        const csvPath = `${FileSystem.documentDirectory}${csvFileName}`
        const jsonPath = `${FileSystem.documentDirectory}${jsonFileName}`
        await FileSystem.writeAsStringAsync(csvPath, csvContent)
        await FileSystem.writeAsStringAsync(jsonPath, jsonContent)
        setProgress('')
        Alert.alert(
          'Success',
          `Successfully generated addresses for ${storedAccountPubKeys.length} stored account(s).\n\nFiles saved:\n• ${csvFileName}\n• ${jsonFileName}\n\nFiles are saved in the app's document directory. You can access them via the Files app.`,
        )
      }
    } catch (error) {
      logger.error('Failed to generate addresses', {error})
      Alert.alert(
        'Error',
        error instanceof Error
          ? error.message
          : 'Failed to generate addresses. Please try again.',
      )
    } finally {
      setIsGenerating(false)
      setProgress('')
    }
  }, [
    numAddressesPerAccount,
    wallet.id,
    meta.implementation,
    networkManager.chainId,
  ])

  const handleGenerate = React.useCallback(() => {
    if (isHardwareWallet) {
      handleGenerateForHardwareWallet()
      return
    }

    const accountCount = parseInt(numAccounts, 10)
    const addressCount = parseInt(numAddressesPerAccount, 10)

    if (
      !accountCount ||
      accountCount < 1 ||
      accountCount > 1000 ||
      !addressCount ||
      addressCount < 1 ||
      addressCount > 10000
    ) {
      Alert.alert(
        'Invalid Input',
        'Please enter valid numbers: accounts (1-1000) and addresses per account (1-10000).',
      )
      return
    }

    promptRootKey({
      title: 'Enter Wallet Password',
      summary: 'Enter your wallet password to generate addresses.',
      onSuccess: handleGenerateWithRootKey,
      onError: (error: unknown) => {
        logger.error('Password error', {error})
      },
    })
  }, [
    isHardwareWallet,
    numAccounts,
    numAddressesPerAccount,
    promptRootKey,
    handleGenerateWithRootKey,
    handleGenerateForHardwareWallet,
  ])

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
          <View style={a.gap_sm}>
            <Text style={[a.heading_3_medium, {color: p.gray_900}]}>
              Advanced Address Retrieval
            </Text>

            <Text style={[a.body_2_md_regular, {color: p.gray_600}]}>
              Generate addresses from multiple accounts for airdrop recovery.
              This tool will derive addresses from your wallet seed phrase.
            </Text>
          </View>

          <Space.Height.lg />

          {!isHardwareWallet && (
            <AccountsInput
              returnKeyType="done"
              errorDelay={0}
              enablesReturnKeyAutomatically
              label="Number of Accounts"
              value={numAccounts}
              onChangeText={setNumAccounts}
              placeholder="e.g., 10"
              keyboardType="numeric"
              editable={!isGenerating}
              helper="Enter the number of accounts to generate (1-1000)"
            />
          )}

          <AddressesInput
            returnKeyType="done"
            errorDelay={0}
            enablesReturnKeyAutomatically
            label="Addresses per Account"
            value={numAddressesPerAccount}
            onChangeText={setNumAddressesPerAccount}
            placeholder="e.g., 20"
            keyboardType="numeric"
            editable={!isGenerating && !isHardwareWallet}
            helper="Enter the number of addresses to generate per account (1-10000)"
          />

          {progress ? (
            <View
              style={[a.p_md, a.rounded_md, {backgroundColor: p.primary_100}]}
            >
              <Text style={[a.body_2_md_regular, {color: p.gray_900}]}>
                {progress}
              </Text>
            </View>
          ) : null}

          <Space.Height.lg />

          {isHardwareWallet ? (
            <WarningBanner
              title="Hardware Wallet Mode"
              content="For hardware wallets, addresses will be generated only for accounts that have already been set up and have their public keys stored. New accounts cannot be derived without connecting to your hardware device."
            />
          ) : (
            <WarningBanner
              title="Important"
              content="This feature generates addresses from your wallet seed phrase. Make sure you are in a secure environment and do not share the exported files with untrusted parties."
            />
          )}
        </ScrollView>

        <Actions>
          <Button
            onPress={handleGenerate}
            disabled={
              isGenerating ||
              (!isHardwareWallet && !numAccounts) ||
              !numAddressesPerAccount
            }
            title={
              isGenerating ? 'Generating...' : 'Generate & Export Addresses'
            }
          />
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
