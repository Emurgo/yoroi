import {useSetupWallet} from '@yoroi/setup-wallet'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {InteractionManager} from 'react-native'

import image from '../../../../assets/img/ledger_2.png'
import {showErrorDialog} from '../../../../dialogs'
import {errorMessages} from '../../../../i18n/global-messages'
import {useMetrics} from '../../../../metrics/metricsManager'
import {useWalletNavigation} from '../../../../navigation'
import {AddressMode} from '../../../../wallet-manager/types'
import {NetworkError} from '../../../../yoroi-wallets/cardano/errors'
import {useCreateBip44Wallet} from '../../../../yoroi-wallets/hooks'
import {WalletImplementationId} from '../../../../yoroi-wallets/types'
import {WalletNameForm} from '../WalletNameForm/WalletNameForm'

// when hw, later will be part of the onboarding
const addressMode: AddressMode = 'single'
export const SaveNanoXScreen = () => {
  const strings = useStrings()
  const {resetToWalletSelection} = useWalletNavigation()
  const {networkId, walletImplementationId, hwDeviceInfo} = useSetupWallet()
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

  if (!hwDeviceInfo) throw new Error('no hwDeviceInfo')

  const handleOnSubmit = React.useCallback(
    ({name}: {name: string}) => {
      createWallet({
        name,
        networkId,
        bip44AccountPublic: hwDeviceInfo.bip44AccountPublic,
        implementationId: walletImplementationId as WalletImplementationId,
        hwDeviceInfo,
        readOnly: false,
        addressMode,
      })
    },
    [createWallet, hwDeviceInfo, networkId, walletImplementationId],
  )

  return (
    <WalletNameForm
      onSubmit={({name}) => handleOnSubmit({name})}
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
