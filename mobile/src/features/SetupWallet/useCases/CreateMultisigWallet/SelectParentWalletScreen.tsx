/**
 * Select Parent Wallet Screen
 * Select a parent wallet to generate shared key from
 * Uses SelectMultipleWalletsModal for consistent UI
 */
import {atoms as a} from '@yoroi/theme'
import {Wallet} from '@yoroi/types'
import {useWalletManager} from '@yoroi/wallet-manager'

import {useNavigation} from '@react-navigation/native'
import * as React from 'react'
import {View} from 'react-native'

import {useSelectMultipleWalletsModal} from '~/features/WalletManager/ui/modals/SelectMultipleWalletsModal'
import {useStrings} from '~/kernel/i18n/useStrings'
import {SetupWalletRouteNavigation} from '~/kernel/navigation/types'
import {makeWalletEncryptedStorage} from '~/kernel/storage/EncryptedStorage'
import {Button} from '~/ui/Button/Button'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {Space} from '~/ui/Space/Space'
import {Text} from '~/ui/Text/Text'

export const SelectParentWalletScreen = () => {
  const strings = useStrings()
  const navigation = useNavigation<SetupWalletRouteNavigation>()
  const {walletManager} = useWalletManager()
  const {openSelectMultipleWalletsModal} = useSelectMultipleWalletsModal()

  // Check if wallet can generate shared key
  // A wallet can generate shared key if:
  // 1. It's not readonly (has root key to derive)
  // 2. OR it has multisigSharedKey already stored
  const canGenerateSharedKey = React.useCallback(
    async (walletMeta: Wallet.Meta): Promise<boolean> => {
      // Readonly wallets without stored shared key can't generate it
      if (walletMeta.isReadOnly) {
        try {
          const encryptedStorage = makeWalletEncryptedStorage(walletMeta.id)
          const sharedKey = await encryptedStorage.multisigSharedKey.read(0)
          return sharedKey !== null
        } catch {
          return false
        }
      }
      // Non-readonly wallets can generate shared key (can derive with password)
      return true
    },
    [],
  )

  // Filter wallets that can generate shared keys
  const [availableWallets, setAvailableWallets] = React.useState<
    ReadonlyArray<Wallet.Meta>
  >([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const filterWallets = async () => {
      setIsLoading(true)
      const allWallets = Array.from(walletManager.walletMetas.values()).filter(
        (meta) => meta.implementation !== 'cardano-multisig',
      )

      const canGenerate = await Promise.all(
        allWallets.map(async (meta) => ({
          meta,
          canGenerate: await canGenerateSharedKey(meta),
        })),
      )

      const filtered = canGenerate
        .filter(({canGenerate: canGen}) => canGen)
        .map(({meta}) => meta)

      setAvailableWallets(filtered)
      setIsLoading(false)
    }

    filterWallets()
  }, [walletManager.walletMetas, canGenerateSharedKey])

  const handleSelectWallet = React.useCallback(() => {
    openSelectMultipleWalletsModal({
      onSelect: (selectedIds) => {
        if (selectedIds.length > 0) {
          const selectedWalletId = selectedIds[0]
          navigation.navigate('setup-wallet-multisig-generate-shared-key', {
            parentWalletId: selectedWalletId,
          })
        }
      },
      selectedWalletIds: [],
      excludeWalletIds: [],
      minSelection: 1,
      maxSelection: 1,
      singleSelection: true,
      title: strings.setupWallet.selectParentWalletTitle,
      filter: (walletMeta) => {
        // Filter is already applied via availableWallets state
        // This is a safety check
        return availableWallets.some((meta) => meta.id === walletMeta.id)
      },
    })
  }, [
    openSelectMultipleWalletsModal,
    navigation,
    availableWallets,
    strings.setupWallet.selectParentWalletTitle,
  ])

  React.useEffect(() => {
    if (!isLoading && availableWallets.length > 0) {
      // Auto-open modal when wallets are loaded
      handleSelectWallet()
    }
  }, [isLoading, availableWallets.length, handleSelectWallet])

  if (isLoading) {
    return (
      <SafeArea>
        <Space.Height.lg />
        <View style={[a.px_lg]}>
          <Text style={[a.body_1_lg_regular]}>{strings.send.pleaseWait}</Text>
        </View>
      </SafeArea>
    )
  }

  if (availableWallets.length === 0) {
    return (
      <SafeArea>
        <Space.Height.lg />
        <View style={[a.px_lg]}>
          <Text style={[a.heading_1_medium]}>
            {strings.setupWallet.noParentWalletsAvailable}
          </Text>
          <Space.Height.md />
          <Text style={[a.body_1_lg_regular]}>
            {strings.setupWallet.noParentWalletsDescription}
          </Text>
          <Space.Height.lg />
          <Button
            title={strings.global.cancel}
            onPress={() => navigation.goBack()}
          />
        </View>
      </SafeArea>
    )
  }

  // Modal will be opened automatically via useEffect
  return (
    <SafeArea>
      <View style={[a.px_lg, a.pt_lg]}>
        <Text style={[a.body_1_lg_regular]}>
          {strings.setupWallet.selectParentWalletDescription}
        </Text>
      </View>
    </SafeArea>
  )
}
