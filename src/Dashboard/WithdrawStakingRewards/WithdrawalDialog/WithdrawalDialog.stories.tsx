import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import BigNumber from 'bignumber.js'
import React from 'react'

import {mockWallet} from '../../../../storybook'
import {SelectedWalletProvider} from '../../../SelectedWallet'
import {Steps, WithdrawalDialog} from './WithdrawalDialog'

const props = {
  step: Steps.Warning,
  onKeepKey: action('onKeepKey'),
  onDeregisterKey: action('onDeregisterKey'),
  onChooseTransport: action('onChooseTransport'),
  useUSB: false,
  onConnectBLE: action('onConnectBLE'),
  onConnectUSB: action('onConnectUSB'),
  withdrawals: null,
  deregistrations: null,
  balance: new BigNumber(123456789),
  finalBalance: new BigNumber(0),
  fees: new BigNumber(123456),
  onConfirm: action('onConfirm'),
  onRequestClose: action('onRequestClose'),
  error: undefined,
}

storiesOf('WithdrawalDialog', module)
  .add('Steps.Warning', () => <WithdrawalDialog {...props} />)
  .add('Steps.ChooseTransport', () => <WithdrawalDialog {...{...props, step: Steps.ChooseTransport}} />)
  .add('Steps.LedgerConnect', () => <WithdrawalDialog {...{...props, step: Steps.LedgerConnect}} />)
  .add('Steps.Confirm, default', () => (
    <SelectedWalletProvider wallet={mockWallet}>
      <WithdrawalDialog {...{...props, step: Steps.Confirm}} />
    </SelectedWalletProvider>
  ))
  .add('Steps.Confirm, isHW', () => (
    <SelectedWalletProvider wallet={{...mockWallet, isHW: true}}>
      <WithdrawalDialog {...{...props, step: Steps.Confirm}} />
    </SelectedWalletProvider>
  ))
  .add('Steps.Confirm, isEasyConfirmationEnabled', () => (
    <SelectedWalletProvider wallet={{...mockWallet, isEasyConfirmationEnabled: true}}>
      <WithdrawalDialog {...{...props, step: Steps.Confirm}} />
    </SelectedWalletProvider>
  ))
  .add('Steps.WaitingHwResponse', () => <WithdrawalDialog {...{...props, step: Steps.WaitingHwResponse}} />)
  .add('Steps.Waiting', () => <WithdrawalDialog {...{...props, step: Steps.Waiting}} />)
  .add('Steps.Error', () => (
    <WithdrawalDialog
      {...{
        ...props,
        step: Steps.Error,
        error: {
          errorMessage: new Error('error message').message,
        },
      }}
    />
  ))
  .add('Steps.Closed', () => <WithdrawalDialog {...{...props, step: Steps.Closed}} />)
