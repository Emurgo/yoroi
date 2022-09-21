import {RouteProp, useRoute} from '@react-navigation/native'
import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {ActivityIndicator, StyleSheet} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useDispatch} from 'react-redux'

import {PleaseWaitModal} from '../../components'
import {useCloseWallet, useCreateWallet, useOpenWallet} from '../../hooks'
import globalMessages from '../../i18n/global-messages'
import {clearAccountState} from '../../legacy/account'
import {clearUTXOs} from '../../legacy/utxo'
import {WalletInitRoutes} from '../../navigation'
import {COLORS} from '../../theme'
import {walletManager} from '../../yoroi-wallets'
import {WalletForm} from '../WalletForm'

export const WalletCredentialsScreen = () => {
  const strings = useStrings()
  const route = useRoute<RouteProp<WalletInitRoutes, 'wallet-credentials'>>()
  const {phrase, networkId, walletImplementationId, provider} = route.params
  const dispatch = useDispatch()

  const {closeWallet} = useCloseWallet({
    onSuccess: () => {
      dispatch(clearUTXOs())
      dispatch(clearAccountState())
    },
  })

  const {openWallet, isLoading: isOpenWalletLoading} = useOpenWallet({
    onError: () => closeWallet(),
  })

  const {
    createWallet,
    isLoading: isCreateWalletLoading,
    isSuccess,
  } = useCreateWallet({
    onSuccess: (wallet) => {
      const walletMetas = walletManager.getWallets()
      const walletMeta = walletMetas[wallet.id]

      if (walletMeta !== undefined) {
        openWallet(walletMeta)
      }
    },
  })

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
      <WalletForm
        onSubmit={
          isCreateWalletLoading || isSuccess
            ? NOOP
            : ({name, password}) =>
                createWallet({name, password, mnemonicPhrase: phrase, networkId, walletImplementationId, provider})
        }
      />
      {isCreateWalletLoading && <ActivityIndicator color="black" />}
      <PleaseWaitModal title={strings.loadingWallet} spinnerText={strings.pleaseWait} visible={isOpenWalletLoading} />
    </SafeAreaView>
  )
}

const messages = defineMessages({
  loadingWallet: {
    id: 'components.walletselection.walletselectionscreen.loadingWallet',
    defaultMessage: '!!!Loading wallet',
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    pleaseWait: intl.formatMessage(globalMessages.pleaseWait),
    loadingWallet: intl.formatMessage(messages.loadingWallet),
  }
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
})

const NOOP = () => undefined
