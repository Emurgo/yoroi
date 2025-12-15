import {atoms as a, useTheme} from '@yoroi/theme'

import {useNavigation} from '@react-navigation/native'
import * as React from 'react'
import {ScrollView, Text, View} from 'react-native'

import {SetupWalletRouteNavigation} from '~/kernel/navigation/types'
import {SafeArea} from '~/ui/SafeArea/SafeArea'
import {Space} from '~/ui/Space/Space'

import {ButtonCard} from '../../common/ButtonCard/ButtonCard'

export const RestoreReadOnlyWalletChooseTypeScreen = () => {
  const {atoms: ta} = useTheme()
  const navigation = useNavigation<SetupWalletRouteNavigation>()

  const handleFromKey = () => {
    navigation.navigate('setup-wallet-restore-read-only-from-key')
  }

  const handleFromAddresses = () => {
    navigation.navigate('setup-wallet-restore-read-only-from-addresses')
  }

  return (
    <SafeArea>
      <Space.Height.lg />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[a.px_lg]}
      >
        <View>
          <Text style={[a.body_1_lg_regular, ta.text_gray_low]}>
            Select how you want to restore the read-only wallet:
          </Text>

          <Space.Height.xl />

          <ButtonCard
            title="Full Read-Only (with Account Key)"
            subTitle="Restore using accountPubKeyHex. Can generate all addresses."
            onPress={handleFromKey}
            testID="setup-restore-read-only-from-key-button"
          />

          <Space.Height.lg />

          <ButtonCard
            title="Partial Read-Only (with Addresses)"
            subTitle="Restore using known addresses. Can only view transactions for provided addresses."
            onPress={handleFromAddresses}
            testID="setup-restore-read-only-from-addresses-button"
          />

          <Space.Height.lg />
        </View>
      </ScrollView>
    </SafeArea>
  )
}
