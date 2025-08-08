import {useNavigation} from '@react-navigation/native'
import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useWalletManager} from '~/features/WalletManager/context/WalletManagerProvider'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {Button} from '~/ui/Button/Button'
import {Text} from '~/ui/Text/Text'

export const DisableEasyConfirmationScreen = () => {
  const {atoms: ta} = useTheme()
  const strings = useStrings()
  const navigation = useNavigation()
  const {wallet} = useSelectedWallet()
  const {walletManager} = useWalletManager()

  const handleOnDisableConfirmation = () => {
    walletManager.disableEasyConfirmation(wallet.id)
    navigation.goBack()
  }

  return (
    <SafeAreaView edges={['bottom']} style={[a.flex_1, ta.bg_color_max]}>
      <View
        style={[
          a.flex_1,
          a.justify_center,
          {
            padding: 20,
          },
        ]}
      >
        <Text style={[a.body_1_lg_regular]}>
          {strings.settings.easyConfirmation.disableHeading}
        </Text>
      </View>

      <View style={[a.pb_lg, a.px_lg]}>
        <Button
          title={strings.settings.easyConfirmation.disableButton}
          onPress={handleOnDisableConfirmation}
        />
      </View>
    </SafeAreaView>
  )
}
