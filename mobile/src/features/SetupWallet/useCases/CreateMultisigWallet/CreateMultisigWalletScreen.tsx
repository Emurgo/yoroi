/**
 * Create Multisig Wallet Screen
 * Main entry point for creating a multisig wallet
 */
import {atoms as a, useTheme} from '@yoroi/theme'
import {useWalletManager} from '@yoroi/wallet-manager'

import {useNavigation} from '@react-navigation/native'
import * as React from 'react'
import {ScrollView, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {SetupWalletRouteNavigation} from '~/kernel/navigation/types'
import {Button} from '~/ui/Button/Button'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {Space} from '~/ui/Space/Space'
import {Text} from '~/ui/Text'

export const CreateMultisigWalletScreen = () => {
  const strings = useStrings()
  const {atoms: ta} = useTheme()
  const navigation = useNavigation<SetupWalletRouteNavigation>()
  const {walletManager} = useWalletManager()

  // Get available wallets for parent wallet selection
  const availableWallets = React.useMemo(() => {
    return Array.from(walletManager.walletMetas.values()).filter(
      (meta) => meta.implementation !== 'cardano-multisig', // Can't use multisig as parent
    )
  }, [walletManager.walletMetas])

  const handleStartCreation = React.useCallback(() => {
    // Navigate to the first step: selecting parent wallet
    navigation.navigate('setup-wallet-multisig-select-parent')
  }, [navigation])

  const handleImportWallet = React.useCallback(() => {
    // Navigate to import multisig wallet screen
    navigation.navigate('setup-wallet-multisig-import')
  }, [navigation])

  const canCreateMultisig = availableWallets.length > 0

  return (
    <SafeArea>
      <Space.Height.lg />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[a.px_lg, a.pb_lg]}
      >
        <View style={[a.gap_md]}>
          <Text style={[ta.heading_1, a.text_center]}>
            {strings.setupWallet.createMultisigWalletTitle}
          </Text>

          <Space.Height.md />

          <Text style={[ta.body_1_lg_regular, a.text_center]}>
            {strings.setupWallet.createMultisigWalletDescription}
          </Text>

          <Space.Height.xl />

          {!canCreateMultisig && (
            <View style={[a.bg_warning_light, a.p_md, a.rounded_sm]}>
              <Text style={[ta.body_1_lg_medium]}>
                {strings.setupWallet.noParentWalletsAvailable}
              </Text>
            </View>
          )}

          <Button
            title={strings.setupWallet.createMultisigWalletButton}
            onPress={handleStartCreation}
            disabled={!canCreateMultisig}
            testID="create-multisig-wallet-button"
          />

          <Space.Height.md />

          <Button
            title={strings.setupWallet.importMultisigWalletButton}
            onPress={handleImportWallet}
            outline
            testID="import-multisig-wallet-button"
          />
        </View>
      </ScrollView>
    </SafeArea>
  )
}
