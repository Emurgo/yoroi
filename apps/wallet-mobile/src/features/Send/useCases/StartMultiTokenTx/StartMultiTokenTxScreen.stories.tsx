import {storiesOf} from '@storybook/react-native'
import {TransferProvider} from '@yoroi/transfer'
import * as React from 'react'

import {QueryProvider} from '../../../../../.storybook/decorators'
import {Boundary} from '../../../../components/Boundary/Boundary'
import {YoroiWallet} from '../../../../yoroi-wallets/cardano/types'
import {mocks as walletMocks} from '../../../../yoroi-wallets/mocks/wallet'
import {WalletManagerProviderMock} from '../../../../yoroi-wallets/mocks/WalletManagerProviderMock'
import {mocks as sendMocks} from '../../common/mocks'
import {StartMultiTokenTxScreen} from './StartMultiTokenTxScreen'

storiesOf('Start MultiToken Tx', module)
  .add('initial', () => <Initial />)
  .add('error invalid address', () => <ErrorInvalidAddress />)
  .add('error memo too long', () => <ErrorMemoTooLong />)
  .add('loading resolve receiver', () => <LoadingResolveReceiver />)

const Initial = () => {
  const wallet: YoroiWallet = walletMocks.wallet

  return (
    <QueryProvider>
      <WalletManagerProviderMock wallet={wallet}>
        <TransferProvider>
          <Boundary>
            <StartMultiTokenTxScreen />
          </Boundary>
        </TransferProvider>
      </WalletManagerProviderMock>
    </QueryProvider>
  )
}

const ErrorInvalidAddress = () => {
  const wallet: YoroiWallet = walletMocks.wallet

  return (
    <QueryProvider>
      <WalletManagerProviderMock wallet={wallet}>
        <TransferProvider initialState={sendMocks.startTx.error.invalidAddress}>
          <Boundary>
            <StartMultiTokenTxScreen />
          </Boundary>
        </TransferProvider>
      </WalletManagerProviderMock>
    </QueryProvider>
  )
}

const LoadingResolveReceiver = () => {
  const wallet: YoroiWallet = walletMocks.wallet

  return (
    <QueryProvider>
      <WalletManagerProviderMock wallet={wallet}>
        <TransferProvider initialState={sendMocks.startTx.loading.resolveReceiver}>
          <Boundary>
            <StartMultiTokenTxScreen />
          </Boundary>
        </TransferProvider>
      </WalletManagerProviderMock>
    </QueryProvider>
  )
}

const ErrorMemoTooLong = () => {
  const wallet: YoroiWallet = walletMocks.wallet

  return (
    <QueryProvider>
      <WalletManagerProviderMock wallet={wallet}>
        <TransferProvider initialState={sendMocks.startTx.error.memoTooLong}>
          <Boundary>
            <StartMultiTokenTxScreen />
          </Boundary>
        </TransferProvider>
      </WalletManagerProviderMock>
    </QueryProvider>
  )
}
