import {NavigationContainer} from '@react-navigation/native'
import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {
  mockCreateVotingRegTx,
  mockEncryptedStorage,
  mockGetStakingInfo,
  mockHwWallet,
  mockOsWallet,
  mockSignTx,
  mockSubmitTransaction,
  mockWallet,
  QueryProvider,
  WithModalProps,
} from '../../storybook'
import {Boundary} from '../components'
import {SelectedWalletProvider} from '../SelectedWallet'
import {YoroiWallet} from '../yoroi-wallets'
import {ConfirmPin} from './ConfirmPin'
import {ConfirmVotingTx} from './ConfirmVotingTx'
import {DisplayPin} from './DisplayPin'
import {DownloadCatalyst} from './DownloadCatalyst'
import {QrCode} from './QrCode'
import {VotingRegistration} from './VotingRegistration'
import {VotingRegistrationBackupCheckModal} from './VotingRegistrationBackupCheckModal'

storiesOf('Catalyst', module)
  .add('DownloadCatalyst, loading', () => (
    <Providers
      wallet={{
        ...mockWallet,
        getStakingInfo: mockGetStakingInfo.loading,
      }}
    >
      <DownloadCatalyst onNext={action('onNext')} />
    </Providers>
  ))

  .add('DownloadCatalyst, error', () => (
    <Providers
      wallet={{
        ...mockWallet,
        getStakingInfo: mockGetStakingInfo.error,
      }}
    >
      <DownloadCatalyst onNext={action('onNext')} />
    </Providers>
  ))

  .add('DownloadCatalyst, registered', () => (
    <Providers
      wallet={{
        ...mockWallet,
        getStakingInfo: mockGetStakingInfo.success.registered,
      }}
    >
      <DownloadCatalyst onNext={action('onNext')} />
    </Providers>
  ))

  .add('DownloadCatalyst, not registered ', () => (
    <Providers
      wallet={{
        ...mockWallet,
        getStakingInfo: mockGetStakingInfo.success.notRegistered,
      }}
    >
      <DownloadCatalyst onNext={action('onNext')} />
    </Providers>
  ))

  .add('DisplayPin', () => <DisplayPin pin="1234" onNext={action('onNext')} />)

  .add('ConfirmPin', () => <ConfirmPin pin="1234" onNext={action('onNext')} />)

  .add('ConfirmVotingTx, password', () => (
    <Providers
      wallet={{
        ...mockWallet,
        createVotingRegTx: mockCreateVotingRegTx.success,
        encryptedStorage: mockEncryptedStorage,
      }}
    >
      <ConfirmVotingTx pin="1234" onSuccess={action('onSuccess')} onNext={action('onNext')} />
    </Providers>
  ))

  .add('ConfirmVotingTx, hw', () => (
    <Providers
      wallet={{
        ...mockHwWallet,
        createVotingRegTx: mockCreateVotingRegTx.success,
      }}
    >
      <ConfirmVotingTx pin="1234" onSuccess={action('onSuccess')} onNext={action('onNext')} />
    </Providers>
  ))

  .add('ConfirmVotingTx, os', () => (
    <Providers
      wallet={{
        ...mockOsWallet,
        createVotingRegTx: mockCreateVotingRegTx.success,
      }}
    >
      <ConfirmVotingTx pin="1234" onSuccess={action('onSuccess')} onNext={action('onNext')} />
    </Providers>
  ))

  .add('QrCode', () => <QrCode votingKeyEncrypted="votingKeyEncrypted" onNext={action('onNext')} />)

  .add('CatalystBackupCheckModal', () => (
    <QueryProvider>
      <WithModalProps>
        {(modalProps) => <VotingRegistrationBackupCheckModal {...modalProps} onConfirm={action('onConfirm')} />}
      </WithModalProps>
    </QueryProvider>
  ))

  .add('Voting Registration, success', () => (
    <NavigationContainer independent>
      <Providers
        wallet={{
          ...mockWallet,
          getStakingInfo: mockGetStakingInfo.success.registered,
          encryptedStorage: mockEncryptedStorage,
          createVotingRegTx: mockCreateVotingRegTx.success,
          signTx: mockSignTx.success,
          submitTransaction: mockSubmitTransaction.success,
        }}
      >
        <VotingRegistration />
      </Providers>
    </NavigationContainer>
  ))
  .add('Voting Registration, error', () => (
    <NavigationContainer independent>
      <Providers
        wallet={{
          ...mockWallet,
          getStakingInfo: mockGetStakingInfo.success.registered,
          encryptedStorage: mockEncryptedStorage,
          createVotingRegTx: mockCreateVotingRegTx.error,
          signTx: mockSignTx.success,
          submitTransaction: mockSubmitTransaction.success,
        }}
      >
        <VotingRegistration />
      </Providers>
    </NavigationContainer>
  ))

const Providers = ({wallet, children}: {wallet: YoroiWallet; children: React.ReactNode}) => {
  return (
    <QueryProvider>
      <SelectedWalletProvider wallet={wallet}>
        <Boundary loading={{fallbackProps: {style: {flex: 1}}}}>{children}</Boundary>
      </SelectedWalletProvider>
    </QueryProvider>
  )
}
