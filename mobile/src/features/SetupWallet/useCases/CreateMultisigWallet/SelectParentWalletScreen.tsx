/**
 * Select Parent Wallet Screen
 * Select a parent wallet to generate shared key from
 */
import {atoms as a, useTheme} from '@yoroi/theme'
import {useWalletManager} from '@yoroi/wallet-manager'

import {useNavigation} from '@react-navigation/native'
import * as React from 'react'
import {ScrollView, TouchableOpacity, View} from 'react-native'

import {useStrings} from '~/kernel/i18n/useStrings'
import {SetupWalletRouteNavigation} from '~/kernel/navigation/types'
import {Button} from '~/ui/Button/Button'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {Space} from '~/ui/Space/Space'
import {Text} from '~/ui/Text/Text'

export const SelectParentWalletScreen = () => {
  const strings = useStrings()
  const {palette: p} = useTheme()
  const navigation = useNavigation<SetupWalletRouteNavigation>()
  const {walletManager} = useWalletManager()

  // Get available wallets (exclude multisig wallets)
  const availableWallets = React.useMemo(() => {
    return Array.from(walletManager.walletMetas.values()).filter(
      (meta) => meta.implementation !== 'cardano-multisig',
    )
  }, [walletManager.walletMetas])

  const [selectedWalletId, setSelectedWalletId] = React.useState<string | null>(
    null,
  )

  const handleSelectWallet = React.useCallback((walletId: string) => {
    setSelectedWalletId(walletId)
  }, [])

  const handleContinue = React.useCallback(() => {
    if (!selectedWalletId) return

    navigation.navigate('setup-wallet-multisig-generate-shared-key', {
      parentWalletId: selectedWalletId,
    })
  }, [selectedWalletId, navigation])

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

  return (
    <SafeArea>
      <Space.Height.lg />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[a.px_lg, a.pb_lg]}
      >
        <View style={[a.gap_md]}>
          <Text style={[a.heading_1_medium]}>
            {strings.setupWallet.selectParentWalletTitle}
          </Text>

          <Space.Height.md />

          <Text style={[a.body_1_lg_regular]}>
            {strings.setupWallet.selectParentWalletDescription}
          </Text>

          <Space.Height.lg />

          {availableWallets.map((walletMeta) => {
            const isSelected = selectedWalletId === walletMeta.id

            return (
              <TouchableOpacity
                key={walletMeta.id}
                onPress={() => handleSelectWallet(walletMeta.id)}
                style={[
                  a.p_md,
                  a.rounded_sm,
                  a.border,
                  isSelected
                    ? {backgroundColor: p.primary_100}
                    : {backgroundColor: p.white_static},
                  isSelected
                    ? {borderColor: p.primary_600}
                    : {borderColor: p.gray_200},
                ]}
                testID={`parent-wallet-option-${walletMeta.id}`}
              >
                <Text style={[a.heading_3_medium]}>{walletMeta.name}</Text>
                <Space.Height.xs />
                <Text style={[a.body_2_md_regular, {color: p.gray_600}]}>
                  {walletMeta.implementation}
                </Text>
              </TouchableOpacity>
            )
          })}

          <Space.Height.lg />

          <Button
            title={strings.global.proceed}
            onPress={handleContinue}
            disabled={!selectedWalletId}
            testID="continue-after-select-parent-button"
          />
        </View>
      </ScrollView>
    </SafeArea>
  )
}
