import {RouteProp, useNavigation, useRoute} from '@react-navigation/native'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, KeyboardSpacer, ScrollableView, Spacer, StatusBar, Text} from '../../components'
import {getWalletConfigById} from '../../legacy/config'
import {WalletInitRouteNavigation, WalletInitRoutes} from '../../navigation'
import {MnemonicInput} from '../MnemonicInput'

export const RestoreWalletScreen = () => {
  const strings = useStrings()
  const navigation = useNavigation<WalletInitRouteNavigation>()
  const route = useRoute<RouteProp<WalletInitRoutes, 'restore-wallet-form'>>()
  const {networkId, walletImplementationId, provider} = route.params
  const {MNEMONIC_LEN: mnemonicLength} = getWalletConfigById(walletImplementationId)
  const navigateToWalletCredentials = () =>
    navigation.navigate('wallet-account-checksum', {
      phrase,
      networkId,
      walletImplementationId,
      provider,
    })

  const [phrase, setPhrase] = React.useState('')

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={{flex: 1, backgroundColor: 'white', borderWidth: 1}}>
      <StatusBar type="dark" />

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
          disabled={!phrase}
          testID="restoreButton"
        />
      </Actions>
    </SafeAreaView>
  )
}

const Instructions = (props) => <Text {...props} style={{fontSize: 16, lineHeight: 24}} />
const Actions = (props) => <View {...props} style={{padding: 16}} />

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
