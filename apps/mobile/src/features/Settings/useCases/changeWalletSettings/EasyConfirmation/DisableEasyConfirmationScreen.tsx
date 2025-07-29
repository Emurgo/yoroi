import {useNavigation} from '@react-navigation/native'
import {atoms as a, useTheme} from '@yoroi/theme'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button} from '../../../../../ui/Button/Button'
import {Text} from '../../../../../ui/Text/Text'
import {useWalletManager} from '../../../../WalletManager/context/WalletManagerProvider'
import {useSelectedWallet} from '../../../../WalletManager/hooks/useSelectedWallet'

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
        <Text
          style={[
            a.body_1_lg_regular,
          ]}
        >
          {strings.disableHeading}
        </Text>
      </View>

      <View style={[a.pb_lg, a.px_lg]}>
        <Button
          title={strings.disableButton}
          onPress={handleOnDisableConfirmation}
        />
      </View>
    </SafeAreaView>
  )
}

const useStrings = () => {
  const intl = useIntl()

  return {
    disableHeading: intl.formatMessage(messages.disableHeading),
    disableButton: intl.formatMessage(messages.disableButton),
  }
}

const messages = defineMessages({
  disableHeading: {
    id: 'components.settings.disableeasyconfirmationscreen.disableHeading',
    defaultMessage:
      '!!!By disabling this option you will be able to spend your assets only with your master password.',
  },
  disableButton: {
    id: 'components.settings.disableeasyconfirmationscreen.disableButton',
    defaultMessage: '!!!Disable',
  },
})
