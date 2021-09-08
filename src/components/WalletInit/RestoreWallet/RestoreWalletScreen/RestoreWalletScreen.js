/* eslint-disable no-use-before-define */
/* eslint-disable react-native/no-inline-styles */
// @flow

import React from 'react'
import {View, ScrollView} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {injectIntl, defineMessages, type IntlShape} from 'react-intl'
import {useNavigation} from '@react-navigation/native'

import {useParams} from '../../../../navigation'
import {KeyboardSpacer, Text, Button, Spacer, StatusBar} from '../../../UiKit'
import {WALLET_INIT_ROUTES} from '../../../../RoutesList'
import {getWalletConfigById} from '../../../../config/config'

import type {WalletImplementationId, NetworkId} from '../../../../config/types'

import {MnemonicInput} from './MnemonicInput'

const messages = defineMessages({
  mnemonicInputLabel: {
    id: 'components.walletinit.restorewallet.restorewalletscreen.mnemonicInputLabel',
    defaultMessage: '!!!Recovery phrase',
  },
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
  noMatchingWords: {
    id: 'components.walletinit.restorewallet.restorewalletscreen.noMatchingWords',
    defaultMessage: '!!!No Matching Words',
  },
  invalidChecksum: {
    id: 'components.walletinit.restorewallet.restorewalletscreen.invalidchecksum',
    defaultMessage: '!!!Please enter valid mnemonic.',
  },
})

type Params = {
  networkId: NetworkId,
  walletImplementationId: WalletImplementationId,
  provider: string,
}

const RestoreWalletScreen = ({intl}: {intl: IntlShape}) => {
  const navigation = useNavigation()
  const {networkId, walletImplementationId, provider} = useParams<Params>()
  const {MNEMONIC_LEN: mnemonicLength} = getWalletConfigById(walletImplementationId)
  const navigateToWalletCredentials = () =>
    navigation.navigate(WALLET_INIT_ROUTES.VERIFY_RESTORED_WALLET, {
      phrase,
      networkId,
      walletImplementationId,
      provider,
    })

  const [phrase, setPhrase] = React.useState('')

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={{flex: 1, backgroundColor: 'white', borderWidth: 1}}>
      <StatusBar type="dark" />

      <ScrollView bounces={false} style={{paddingHorizontal: 16}} keyboardShouldPersistTaps={'always'}>
        <Spacer height={24} />

        <Instructions>{intl.formatMessage(messages.instructions, {mnemonicLength})}</Instructions>

        <Spacer height={16} />

        <MnemonicInput length={mnemonicLength} onDone={setPhrase} />

        <KeyboardSpacer padding={100} />
      </ScrollView>

      <Actions>
        <Button
          onPress={navigateToWalletCredentials}
          title={intl.formatMessage(messages.restoreButton)}
          disabled={!phrase}
        />
      </Actions>
    </SafeAreaView>
  )
}

export default injectIntl(RestoreWalletScreen)

const Instructions = (props) => <Text {...props} style={{fontSize: 16, lineHeight: 24}} />
const Actions = (props) => <View {...props} style={{padding: 16}} />
