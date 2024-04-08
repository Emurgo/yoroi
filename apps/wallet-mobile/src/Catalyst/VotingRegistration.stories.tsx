import {NavigationContainer} from '@react-navigation/native'
import {action} from '@storybook/addon-actions'
import {storiesOf} from '@storybook/react-native'
import React from 'react'

import {QueryProvider, WithModalProps} from '../../.storybook/decorators'
import {Boundary} from '../components'
import {SelectedWalletProvider} from '../features/SelectedWallet/Context'
import {YoroiWallet} from '../yoroi-wallets/cardano/types'
import {mocks} from '../yoroi-wallets/mocks'
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
        ...mocks.wallet,
        getStakingInfo: mocks.getStakingInfo.loading,
      }}
    >
      <DownloadCatalyst onNext={action('onNext')} />
    </Providers>
  ))

  .add('DownloadCatalyst, error', () => (
    <Providers
      wallet={{
        ...mocks.wallet,
        getStakingInfo: mocks.getStakingInfo.error,
      }}
    >
      <DownloadCatalyst onNext={action('onNext')} />
    </Providers>
  ))

  .add('DownloadCatalyst, registered', () => (
    <Providers
      wallet={{
        ...mocks.wallet,
        getStakingInfo: mocks.getStakingInfo.success.registered,
      }}
    >
      <DownloadCatalyst onNext={action('onNext')} />
    </Providers>
  ))

  .add('DownloadCatalyst, not registered ', () => (
    <Providers
      wallet={{
        ...mocks.wallet,
        getStakingInfo: mocks.getStakingInfo.success.notRegistered,
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
        ...mocks.wallet,
        createVotingRegTx: mocks.createVotingRegTx.success,
        encryptedStorage: mocks.encryptedStorage,
      }}
    >
      <ConfirmVotingTx pin="1234" onSuccess={action('onSuccess')} onNext={action('onNext')} />
    </Providers>
  ))

  .add('ConfirmVotingTx, hw', () => (
    <Providers
      wallet={{
        ...mocks.hwWallet,
        createVotingRegTx: mocks.createVotingRegTx.success,
      }}
    >
      <ConfirmVotingTx pin="1234" onSuccess={action('onSuccess')} onNext={action('onNext')} />
    </Providers>
  ))

  .add('ConfirmVotingTx, os', () => (
    <Providers
      wallet={{
        ...mocks.osWallet,
        createVotingRegTx: mocks.createVotingRegTx.success,
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
          ...mocks.wallet,
          getStakingInfo: mocks.getStakingInfo.success.registered,
          encryptedStorage: mocks.encryptedStorage,
          createVotingRegTx: mocks.createVotingRegTx.success,
          signTx: mocks.signTx.success,
          submitTransaction: mocks.submitTransaction.success,
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
          ...mocks.wallet,
          getStakingInfo: mocks.getStakingInfo.success.registered,
          encryptedStorage: mocks.encryptedStorage,
          createVotingRegTx: mocks.createVotingRegTx.error,
          signTx: mocks.signTx.success,
          submitTransaction: mocks.submitTransaction.success,
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
        <Boundary loading={{size: 'full'}}>{children}</Boundary>
      </SelectedWalletProvider>
    </QueryProvider>
  )
}
