import React from 'react'
import {defineMessages, useIntl} from 'react-intl'
import {StyleSheet} from 'react-native'
import Markdown from 'react-native-easy-markdown'
import {useSelector} from 'react-redux'

import {Boundary, DangerousAction, PleaseWaitView, Spacer} from '../../components'
import {useWithdrawalTx} from '../../hooks'
import globalMessages, {ledgerMessages} from '../../i18n/global-messages'
import {getDefaultAssetByNetworkId} from '../../legacy/config'
import KeyStore from '../../legacy/KeyStore'
import {serverStatusSelector, utxosSelector} from '../../legacy/selectors'
import {theme} from '../../theme'
import {YoroiWallet} from '../../yoroi-wallets'
import {YoroiUnsignedTx} from '../../yoroi-wallets/types'
import {ConfirmTx} from './ConfirmTx/ConfirmTx'

type Props = {
  wallet: YoroiWallet
  storage: typeof KeyStore
  onCancel: () => void
  onSuccess: () => void
}

export const WithdrawStakingRewards = ({wallet, storage, onSuccess, onCancel}: Props) => {
  const strings = useStrings()
  const [state, setState] = React.useState<
    {step: 'form'; withdrawalTx: undefined} | {step: 'confirm'; withdrawalTx: YoroiUnsignedTx}
  >({step: 'form', withdrawalTx: undefined})

  return (
    <Boundary loading={{fallback: <PleaseWaitView title="" spinnerText={strings.pleaseWait} />}}>
      <Route active={state.step === 'form'}>
        <WithdrawalTxForm wallet={wallet} onDone={(withdrawalTx) => setState({step: 'confirm', withdrawalTx})} />
      </Route>

      {state.step === 'confirm' && (
        <Route active={true}>
          <ConfirmTx
            wallet={wallet}
            storage={storage}
            unsignedTx={state.withdrawalTx}
            onSuccess={onSuccess}
            onCancel={onCancel}
          />
        </Route>
      )}
    </Boundary>
  )
}

export const WithdrawalTxForm: React.FC<{
  wallet: YoroiWallet
  onDone: (withdrawalTx: YoroiUnsignedTx) => void
}> = ({wallet, onDone}) => {
  const strings = useStrings()
  const [deregister, setDeregister] = React.useState<boolean>()
  const utxos = useSelector(utxosSelector) || []
  const serverStatus = useSelector(serverStatusSelector)
  const {isLoading} = useWithdrawalTx(
    {
      wallet,
      deregister,
      defaultAsset: getDefaultAssetByNetworkId(wallet.networkId),
      utxos,
      serverTime: serverStatus.serverTime,
    },
    {
      onSuccess: (withdrawalTx) => onDone(withdrawalTx),
      enabled: deregister != null,
      useErrorBoundary: true,
      suspense: true,
    },
  )

  return (
    <DangerousAction
      title={strings.warningModalTitle}
      alertBox={{content: [strings.warning1, strings.warning2, strings.warning3]}}
      primaryButton={{
        disabled: isLoading,
        label: strings.keepButton,
        onPress: () => setDeregister(false),
      }}
      secondaryButton={{
        disabled: isLoading,
        label: strings.deregisterButton,
        onPress: () => setDeregister(true),
      }}
    >
      <Markdown style={styles.paragraph}>{strings.explanation1}</Markdown>
      <Spacer height={8} />
      <Markdown style={styles.paragraph}>{strings.explanation2}</Markdown>
      <Spacer height={8} />
      <Markdown style={styles.paragraph}>{strings.explanation3}</Markdown>
    </DangerousAction>
  )
}

const Route: React.FC<{active: boolean}> = ({active, children}) => <>{active ? children : null}</>

const styles = StyleSheet.create({
  paragraph: {
    ...theme.text,
  },
})

const useStrings = () => {
  const intl = useIntl()

  return {
    warningModalTitle: intl.formatMessage(messages.warningModalTitle),
    warning1: intl.formatMessage(messages.warning1),
    warning2: intl.formatMessage(messages.warning2),
    warning3: intl.formatMessage(messages.warning3),
    keepButton: intl.formatMessage(messages.keepButton),
    deregisterButton: intl.formatMessage(messages.deregisterButton),
    explanation1: intl.formatMessage(messages.explanation1),
    explanation2: intl.formatMessage(messages.explanation2),
    explanation3: intl.formatMessage(messages.explanation3),
    followSteps: intl.formatMessage(ledgerMessages.followSteps),
    pleaseWait: intl.formatMessage(globalMessages.pleaseWait),
  }
}

const messages = defineMessages({
  warningModalTitle: {
    id: 'components.delegation.withdrawaldialog.warningModalTitle',
    defaultMessage: '!!!Also deregister staking key?',
  },
  explanation1: {
    id: 'components.delegation.withdrawaldialog.explanation1',
    defaultMessage: '!!!When **withdrawing rewards**, you also have the option to deregister the staking key.',
  },
  explanation2: {
    id: 'components.delegation.withdrawaldialog.explanation2',
    defaultMessage:
      '!!!**Keeping the staking key** will allow you to withdraw the rewards, ' +
      'but continue delegating to the same pool.',
  },
  explanation3: {
    id: 'components.delegation.withdrawaldialog.explanation3',
    defaultMessage:
      '!!!**Deregistering the staking key** will give you back your deposit and undelegate the key from any pool.',
  },
  warning1: {
    id: 'components.delegation.withdrawaldialog.warning1',
    defaultMessage:
      '!!!You do NOT need to deregister to delegate to a different stake ' +
      'pool. You can change your delegation preference at any time.',
  },
  warning2: {
    id: 'components.delegation.withdrawaldialog.warning2',
    defaultMessage:
      '!!!You should NOT deregister if this staking key is used as a stake ' +
      "pool's reward account, as this will cause all pool operator rewards " +
      'to be sent back to the reserve.',
  },
  warning3: {
    id: 'components.delegation.withdrawaldialog.warning3',
    defaultMessage:
      '!!!Deregistering means this key will no longer receive rewards until ' +
      'you re-register the staking key (usually by delegating to a pool again)',
  },
  keepButton: {
    id: 'components.delegation.withdrawaldialog.keepButton',
    defaultMessage: '!!!Keep registered',
  },
  deregisterButton: {
    id: 'components.delegation.withdrawaldialog.deregisterButton',
    defaultMessage: '!!!Deregister',
  },
})
