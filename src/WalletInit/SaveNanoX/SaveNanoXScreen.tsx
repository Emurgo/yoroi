import {RouteProp, useRoute} from '@react-navigation/native'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'

import image from '../../assets/img/ledger_2.png'
import {useCreateBip44Wallet} from '../../hooks'
import {useWalletNavigation, WalletInitRoutes} from '../../navigation'
import {WalletNameForm} from '../WalletNameForm'

export const SaveNanoXScreen = () => {
  const strings = useStrings()
  const {resetToWalletSelection} = useWalletNavigation()
  const route = useRoute<RouteProp<WalletInitRoutes, 'save-nano-x'>>()
  const {networkId, walletImplementationId, hwDeviceInfo} = route.params

  const {createWallet, isLoading} = useCreateBip44Wallet({
    onSuccess: () => {
      resetToWalletSelection()
    },
  })

  return (
    <WalletNameForm
      onSubmit={({name}) =>
        createWallet({
          name,
          networkId,
          bip44AccountPublic: hwDeviceInfo.bip44AccountPublic,
          implementationId: walletImplementationId,
          hwDeviceInfo,
          readOnly: false,
        })
      }
      defaultWalletName={strings.ledgerWalletNameSuggestion}
      image={image}
      progress={{
        currentStep: 3,
        totalSteps: 3,
      }}
      isWaiting={isLoading}
    />
  )
}

const useStrings = () => {
  const intl = useIntl()

  return {
    ledgerWalletNameSuggestion: intl.formatMessage(messages.ledgerWalletNameSuggestion),
  }
}

const messages = defineMessages({
  ledgerWalletNameSuggestion: {
    id: 'components.walletinit.connectnanox.savenanoxscreen.ledgerWalletNameSuggestion',
    defaultMessage: '!!!My Ledger Wallet',
  },
})
