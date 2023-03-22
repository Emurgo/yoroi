import {storiesOf} from '@storybook/react-native'
import * as React from 'react'

import {QueryProvider} from '../../../../.storybook/decorators'
import {Boundary} from '../../../components'
import {SelectedWalletProvider} from '../../../SelectedWallet'
import {YoroiWallet} from '../../../yoroi-wallets'
import {mocks as walletMocks} from '../../../yoroi-wallets/mocks/wallet'
import {mocks as sendMocks} from '../../shared/mocks'
import {SendProvider} from '../../shared/SendContext'
import {StartTxScreen} from './StartTxScreen'

storiesOf('Send/StartTx', module)
  .add('initial', () => <Initial />)
  .add('error invalid address', () => <ErrorInvalidAddress />)
  .add('error memo too long', () => <ErrorMemoTooLong />)
  .add('loading resolve receiver', () => <LoadingResolveReceiver />)

const Initial = () => {
  const wallet: YoroiWallet = walletMocks.wallet

  return (
    <QueryProvider>
      <SelectedWalletProvider wallet={wallet}>
        <SendProvider>
          <Boundary>
            <StartTxScreen />
          </Boundary>
        </SendProvider>
      </SelectedWalletProvider>
    </QueryProvider>
  )
}

const ErrorInvalidAddress = () => {
  const wallet: YoroiWallet = walletMocks.wallet

  return (
    <QueryProvider>
      <SelectedWalletProvider wallet={wallet}>
        <SendProvider initialState={sendMocks.startTx.error.invalidAddress}>
          <Boundary>
            <StartTxScreen />
          </Boundary>
        </SendProvider>
      </SelectedWalletProvider>
    </QueryProvider>
  )
}

const LoadingResolveReceiver = () => {
  const wallet: YoroiWallet = walletMocks.wallet

  return (
    <QueryProvider>
      <SelectedWalletProvider wallet={wallet}>
        <SendProvider initialState={sendMocks.startTx.loading.resolveReceiver}>
          <Boundary>
            <StartTxScreen />
          </Boundary>
        </SendProvider>
      </SelectedWalletProvider>
    </QueryProvider>
  )
}

const ErrorMemoTooLong = () => {
  const wallet: YoroiWallet = walletMocks.wallet

  return (
    <QueryProvider>
      <SelectedWalletProvider wallet={wallet}>
        <SendProvider initialState={sendMocks.startTx.error.memoTooLong}>
          <Boundary>
            <StartTxScreen />
          </Boundary>
        </SendProvider>
      </SelectedWalletProvider>
    </QueryProvider>
  )
}
