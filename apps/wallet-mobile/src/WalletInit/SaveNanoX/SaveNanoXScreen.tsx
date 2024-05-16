import {RouteProp, useRoute} from '@react-navigation/native'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {InteractionManager} from 'react-native'

import image from '../../assets/img/ledger_2.png'
import {showErrorDialog} from '../../dialogs'
import {errorMessages} from '../../i18n/global-messages'
import {useMetrics} from '../../metrics/metricsManager'
import {useWalletNavigation, WalletInitRoutes} from '../../navigation'
import {AddressMode} from '../../wallet-manager/types'
import {NetworkError} from '../../yoroi-wallets/cardano/errors'
import {useCreateBip44Wallet} from '../../yoroi-wallets/hooks'
import {WalletNameForm} from '../WalletNameForm'

// when hw, later will be part of the onboarding
const addressMode: AddressMode = 'single'
export const SaveNanoXScreen = () => {
  const strings = useStrings()
  const {resetToWalletSelection} = useWalletNavigation()
  const route = useRoute<RouteProp<WalletInitRoutes, 'save-nano-x'>>()
  const {networkId, walletImplementationId, hwDeviceInfo} = route.params
  const intl = useIntl()
  const {track} = useMetrics()

  const {createWallet, isLoading} = useCreateBip44Wallet({
    onSuccess: () => {
      track.restoreWalletDetailsSettled()
      resetToWalletSelection()
    },
    onError: (error) => {
      InteractionManager.runAfterInteractions(() => {
        return error instanceof NetworkError
          ? showErrorDialog(errorMessages.networkError, intl)
          : showErrorDialog(errorMessages.generalError, intl, {message: error.message})
      })
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
          addressMode,
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
