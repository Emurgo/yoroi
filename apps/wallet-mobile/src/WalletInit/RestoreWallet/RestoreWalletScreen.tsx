import {RouteProp, useNavigation, useRoute} from '@react-navigation/native'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {View, ViewProps} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, KeyboardAvoidingView, KeyboardSpacer, ScrollableView, Spacer, StatusBar, Text} from '../../components'
import {WalletInitRouteNavigation, WalletInitRoutes} from '../../navigation'
import {isEmptyString} from '../../utils/utils'
import {getWalletConfigById} from '../../yoroi-wallets/cardano/utils'
import {MnemonicInput} from '../MnemonicInput'

export const RestoreWalletScreen = () => {
  const strings = useStrings()
  const navigation = useNavigation<WalletInitRouteNavigation>()
  const route = useRoute<RouteProp<WalletInitRoutes, 'restore-wallet-form'>>()
  const {networkId, walletImplementationId} = route.params
  const {MNEMONIC_LEN: mnemonicLength} = getWalletConfigById(walletImplementationId)
  const navigateToWalletCredentials = () =>
    navigation.navigate('wallet-account-checksum', {
      phrase,
      networkId,
      walletImplementationId,
    })

  const [phrase, setPhrase] = React.useState('')

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={{flex: 1, backgroundColor: 'white'}}>
      <StatusBar type="dark" />

      <KeyboardAvoidingView style={{flex: 1}}>
        <ScrollableView bounces={false} style={{paddingHorizontal: 16}} keyboardShouldPersistTaps="always">
          <Spacer height={24} />

          <Instructions>{strings.instructions({mnemonicLength})}</Instructions>

          <Spacer height={16} />

          <MnemonicInput length={mnemonicLength} onDone={setPhrase} />

          <KeyboardSpacer padding={100} />
        </ScrollableView>

        <Actions>
          <Button
            onPress={navigateToWalletCredentials}
            title={strings.restoreButton}
            disabled={isEmptyString(phrase)}
            testID="restoreButton"
          />
        </Actions>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const Instructions = (props: ViewProps) => <Text {...props} style={{fontSize: 16, lineHeight: 24}} />
const Actions = (props: ViewProps) => <View {...props} style={{padding: 16}} />

const messages = defineMessages({
  restoreButton: {
    id: 'components.walletinit.restorewallet.restorewalletscreen.restoreButton',
    defaultMessage: '!!!Restore wallet',
  },
  instructions: {
    id: 'components.walletinit.restorewallet.restorewalletscreen.instructions',
    defaultMessage:
      '!!!To restore your wallet please provide the {mnemonicLength}-word ' +
      'recovery phrase you received when you created your wallet for the ' +
      'first time.',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    restoreButton: intl.formatMessage(messages.restoreButton),
    instructions: ({mnemonicLength}: {mnemonicLength: number}) =>
      intl.formatMessage(messages.instructions, {mnemonicLength}),
  }
}
